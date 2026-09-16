-- Execute after migration, or append inside its rollback rehearsal. Never commits test data.
begin;
do $$
declare
 d jsonb; actor uuid; gym uuid; order_id uuid; rev integer; old_time timestamptz;
begin
 if has_function_privilege('anon','public.gym_admin_dashboard(date)','execute') then raise exception 'Anonymous RPC access'; end if;
 if has_function_privilege('authenticated','public.gym_admin_import_order(jsonb)','execute') then raise exception 'Authenticated import access'; end if;
 if has_table_privilege('authenticated','public.gym_admin_sync_state','select') then raise exception 'Sync secrets exposed'; end if;
 if has_table_privilege('anon','public.gym_module_orders','select') then raise exception 'Orders exposed'; end if;
 perform set_config('request.jwt.claims','{"role":"authenticated","sub":"00000000-0000-0000-0000-000000000001","email":"peter@peterbudzak.com"}',true);
 if public.is_gym_console_admin() then raise exception 'Email spoof allowed'; end if;
 begin perform public.gym_admin_dashboard(); raise exception 'Unauthorized dashboard allowed'; exception when insufficient_privilege then null; end;
 select user_id into actor from public.gym_admin_access limit 1;
 perform set_config('request.jwt.claims',jsonb_build_object('role','authenticated','sub',actor)::text,true);
 d:=public.gym_admin_dashboard('2026-09-01');
 if jsonb_array_length(d->'gyms')<>(select count(*) from public.gyms) then raise exception 'Gym count mismatch'; end if;
 if d->'sync' ? 'webhook_secret' or d->'sync' ? 'cron_secret' then raise exception 'Secret in dashboard'; end if;
 select id into gym from public.gyms limit 1;
 select updated_at into old_time from public.gym_admin_notes where gym_id=gym;
 perform public.gym_admin_save_gym(gym,'Temporary rollback test',old_time);
 if not exists(select 1 from public.gym_admin_notes where gym_id=gym and note='Temporary rollback test') then raise exception 'Note failed'; end if;
 begin perform public.gym_admin_save_gym(gym,'Stale',old_time); raise exception 'Stale note allowed'; exception when raise_exception then if sqlerrm='Stale note allowed' then raise; end if; end;
 perform public.gym_admin_import_order(jsonb_build_object('stripe_session_id','cs_admin_transaction_test','quantity',2,'amount_minor',3000,'refunded_minor',0,'currency','EUR','payment_status','unpaid','created_at',now(),'synced_at',now()));
 select id,revision into order_id,rev from public.gym_module_orders where stripe_session_id='cs_admin_transaction_test';
 begin perform public.gym_admin_update_order(order_id,rev,gym,'shipped','tracking',''); raise exception 'Unpaid shipment allowed'; exception when raise_exception then if sqlerrm='Unpaid shipment allowed' then raise; end if; end;
 perform public.gym_admin_import_order(jsonb_build_object('stripe_session_id','cs_admin_transaction_test','quantity',2,'amount_minor',3000,'refunded_minor',0,'currency','EUR','payment_status','paid','created_at',now(),'paid_at',now(),'synced_at',now()+interval '1 second'));
 select revision into rev from public.gym_module_orders where id=order_id;
 begin perform public.gym_admin_update_order(order_id,rev,gym,'shipped','',''); raise exception 'Missing tracking allowed'; exception when raise_exception then if sqlerrm='Missing tracking allowed' then raise; end if; end;
 perform public.gym_admin_update_order(order_id,rev,gym,'shipped','test-tracking','keep-note');
 begin perform public.gym_admin_update_order(order_id,rev,gym,'delivered','test-tracking',''); raise exception 'Stale revision allowed'; exception when raise_exception then if sqlerrm='Stale revision allowed' then raise; end if; end;
 -- A replay must preserve notes, assignment and fulfillment; older unpaid states cannot regress payment.
 perform public.gym_admin_import_order(jsonb_build_object('stripe_session_id','cs_admin_transaction_test','quantity',2,'amount_minor',3000,'refunded_minor',0,'currency','EUR','payment_status','unpaid','created_at',now(),'synced_at',now()));
 if not exists(select 1 from public.gym_module_orders where id=order_id and note='keep-note' and fulfillment_status='shipped' and payment_status='paid' and gym_id=gym and shipped_at is not null) then raise exception 'Replay regressed order'; end if;
 if (select count(*) from public.gym_module_orders where stripe_session_id='cs_admin_transaction_test')<>1 then raise exception 'Duplicate order'; end if;
 if not exists(select 1 from public.gym_admin_activity where entity_id=order_id) then raise exception 'Missing audit'; end if;
end;
$$;
select 'PASS: authorization, no secrets, notes, concurrency, unpaid shipping guard, tracking, verified import, replay and audit' as result;
rollback;

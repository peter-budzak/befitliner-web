begin;
do $$
declare payload jsonb := '{"country_code":"SK","contact_name":"AUTOMATED TEST","company":"TEST","email":"partner-staging-test@example.com","phone":"+421000000000","experience":"Synthetic integration test","message":"ROLLBACK"}'; rid uuid:=gen_random_uuid(); first_result jsonb; repeated jsonb;
begin
 first_result:=public.submit_partner_application(payload,rid,'test-hash','test-ip');
 repeated:=public.submit_partner_application(payload,rid,'test-hash','test-ip');
 assert first_result->>'id'=repeated->>'id' and (repeated->>'duplicate')::boolean,'idempotency failed';
 begin perform public.submit_partner_application(payload,rid,'different','test-ip'); raise exception 'conflict not rejected'; exception when others then if sqlerrm<>'idempotency_conflict' then raise; end if; end;
 for i in 1..4 loop perform public.submit_partner_application(payload||jsonb_build_object('email','test-'||i||'@example.com'),gen_random_uuid(),'hash-'||i,'test-ip'); end loop;
 begin perform public.submit_partner_application(payload,gen_random_uuid(),'sixth','test-ip'); raise exception 'rate not enforced'; exception when others then if sqlerrm<>'rate_limited' then raise; end if; end;
 assert not has_table_privilege('anon','public.partner_applications','SELECT'),'anonymous read grant';
 assert not has_table_privilege('authenticated','public.partner_applications','INSERT'),'authenticated insert grant';
 assert not has_function_privilege('anon','public.submit_partner_application(jsonb,uuid,text,text)','EXECUTE'),'public submit RPC';
 assert not has_function_privilege('authenticated','public.submit_partner_application(jsonb,uuid,text,text)','EXECUTE'),'user submit RPC';
end $$;
set local role anon;
do $$ begin assert (select count(*) from public.partner_countries)=19,'public countries'; end $$;
reset role;
select set_config('request.jwt.claims','{"sub":"00000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
set local role authenticated;
do $$ begin assert (select count(*) from public.partner_applications)=0,'non-admin PII leak'; end $$;
reset role;
select set_config('request.jwt.claims',json_build_object('sub',(select user_id from public.gym_admin_access limit 1),'role','authenticated')::text,true);
set local role authenticated;
do $$ begin assert public.is_gym_console_admin(),'existing admin authorization'; assert (select count(*) from public.partner_applications where contact_name='AUTOMATED TEST')=5,'admin cannot see applications'; end $$;
reset role;
rollback;
select 'PASS: atomic submission, duplicate, conflict, rate limit, anon and user isolation, existing admin access; all test data rolled back' as result;

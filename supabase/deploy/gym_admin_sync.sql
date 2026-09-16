-- Production-specific scheduling. Run after gym_admin_console migration.
-- Scoped sync token stays in the RLS-protected table, never in a public response or cron text.
begin;
create or replace function public.run_gym_admin_order_sync() returns bigint
language sql security definer set search_path = '' as $$
 select net.http_post(
   url := 'https://jkjncktexqqkrmezdjui.supabase.co/functions/v1/admin-gym-orders',
   headers := jsonb_build_object('Content-Type','application/json','Authorization',
      'Bearer '||(select cron_secret from public.gym_admin_sync_state where id=true)),
   body := '{"action":"sync"}'::jsonb,
   timeout_milliseconds := 60000
 );
$$;
revoke all on function public.run_gym_admin_order_sync() from public,anon,authenticated;
grant execute on function public.run_gym_admin_order_sync() to service_role;
select cron.schedule('fitliner-gym-admin-order-sync','*/15 * * * *','select public.run_gym_admin_order_sync();');
commit;

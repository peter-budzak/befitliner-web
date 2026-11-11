select cron.schedule(
  'fitliner-pro-funnel-campaign',
  '* * * * *',
  $job$
    select net.http_post(
      url := 'https://jkjncktexqqkrmezdjui.supabase.co/functions/v1/run-pro-funnel-email-campaign',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || (
          select decrypted_secret from vault.decrypted_secrets where name = 'fitliner_pro_funnel_cron_jwt'
        ),
        'x-pro-cron-secret', (
          select decrypted_secret from vault.decrypted_secrets where name = 'fitliner_pro_funnel_cron_secret'
        )
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 50000
    );
  $job$
);

select cron.schedule(
  'fitliner-pro-funnel-retention',
  '23 3 * * *',
  $job$
    delete from public.fitliner_pro_funnel where submitted_at is null and last_seen_at < now() - interval '30 days';
    delete from public.fitliner_pro_funnel where submitted_at < now() - interval '90 days';
  $job$
);

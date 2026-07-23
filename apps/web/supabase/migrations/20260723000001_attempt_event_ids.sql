-- Make direct attempt writes and local outbox retries idempotent.
alter table public.attempts add column client_event_id uuid;

update public.attempts
   set client_event_id = gen_random_uuid()
 where client_event_id is null;

alter table public.attempts alter column client_event_id set not null;

create unique index attempts_user_client_event_idx
  on public.attempts (user_id, client_event_id);

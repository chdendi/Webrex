-- Webrex progress tracking: profiles, attempts, completions + lesson_achievement RPC.
-- Decisions locked 2026-05-07:
--   * "passed" alone defines completion (verify step passed=true)
--   * No best_score; percentile uses attempts_to_pass (fewer = better)
--   * Anonymous users may attempt; only authenticated writes persist
--   * Region: ap-east-1

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- profiles: business-side mirror of auth.users (1:1)
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Auto-create profile row on auth.users insert.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- attempts: every verify submission (passed or not). One row per try.
-- ---------------------------------------------------------------------------
create table public.attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  step_id text not null,
  tier text not null check (tier in ('hard', 'soft', 'self', 'choice')),
  confidence text check (confidence in ('high', 'mid', 'low')),
  passed boolean not null,
  duration_ms integer,
  created_at timestamptz not null default now()
);
create index attempts_lesson_user_idx on public.attempts (lesson_id, user_id);
create index attempts_user_recent_idx on public.attempts (user_id, created_at desc);

-- ---------------------------------------------------------------------------
-- completions: derived "I beat this lesson" record. One row per user×lesson.
--   first_attempt_at = earliest attempts.created_at for this lesson
--   completed_at     = first attempts.created_at where passed=true
--   attempts_to_pass = count(attempts) up to and including the passing one
-- ---------------------------------------------------------------------------
create table public.completions (
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  first_attempt_at timestamptz not null,
  completed_at timestamptz not null,
  attempts_to_pass integer not null check (attempts_to_pass >= 1),
  primary key (user_id, lesson_id)
);
create index completions_lesson_completed_idx on public.completions (lesson_id, completed_at);
create index completions_lesson_first_attempt_idx on public.completions (lesson_id, first_attempt_at);
create index completions_lesson_attempts_idx on public.completions (lesson_id, attempts_to_pass);

-- ---------------------------------------------------------------------------
-- Trigger: when an attempt is inserted, maintain completions automatically.
-- ---------------------------------------------------------------------------
create or replace function public.maintain_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_first_attempt timestamptz;
  v_attempts_count integer;
  v_existing public.completions%rowtype;
begin
  -- Always update first_attempt_at if this attempt is earlier than known.
  select first_attempt_at into v_existing
    from public.completions
   where user_id = new.user_id and lesson_id = new.lesson_id;

  if not found then
    -- Compute first_attempt_at from attempts table (this row included).
    select min(created_at) into v_first_attempt
      from public.attempts
     where user_id = new.user_id and lesson_id = new.lesson_id;

    if new.passed then
      select count(*) into v_attempts_count
        from public.attempts
       where user_id = new.user_id and lesson_id = new.lesson_id
         and created_at <= new.created_at;

      insert into public.completions
        (user_id, lesson_id, first_attempt_at, completed_at, attempts_to_pass)
      values
        (new.user_id, new.lesson_id, v_first_attempt, new.created_at, v_attempts_count)
      on conflict (user_id, lesson_id) do nothing;
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists on_attempt_insert on public.attempts;
create trigger on_attempt_insert
  after insert on public.attempts
  for each row execute function public.maintain_completion();

-- ---------------------------------------------------------------------------
-- RLS: read-own; writes only via service_role (i.e. our /api routes).
-- ---------------------------------------------------------------------------
alter table public.profiles    enable row level security;
alter table public.attempts    enable row level security;
alter table public.completions enable row level security;

create policy profiles_select_own    on public.profiles    for select using (auth.uid() = id);
create policy attempts_select_own    on public.attempts    for select using (auth.uid() = user_id);
create policy completions_select_own on public.completions for select using (auth.uid() = user_id);

-- No INSERT/UPDATE/DELETE policies = denied for anon/authenticated by default.
-- service_role bypasses RLS.

-- ---------------------------------------------------------------------------
-- RPC: lesson_achievement(lesson_id, user_id) -> achievement card payload.
-- Percentile: percent_rank() over attempts_to_pass DESC, so fewer attempts
-- yields a higher beat_percent. NULLs when user has no completion yet.
-- ---------------------------------------------------------------------------
create or replace function public.lesson_achievement(
  p_lesson_id text,
  p_user_id uuid
)
returns table (
  beat_percent       numeric,
  completion_rank    integer,
  attempt_rank       integer,
  total_completions  integer,
  total_attempters   integer,
  attempts_to_pass   integer
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_my public.completions%rowtype;
  v_total_completions integer;
  v_total_attempters integer;
  v_completion_rank integer;
  v_attempt_rank integer;
  v_pct numeric;
begin
  select * into v_my
    from public.completions
   where user_id = p_user_id and lesson_id = p_lesson_id;

  select count(*) into v_total_completions
    from public.completions where lesson_id = p_lesson_id;

  select count(distinct user_id) into v_total_attempters
    from public.attempts where lesson_id = p_lesson_id;

  if v_my.user_id is null then
    -- User hasn't completed yet: surface only crowd stats.
    return query select
      null::numeric,
      null::integer,
      null::integer,
      v_total_completions,
      v_total_attempters,
      null::integer;
    return;
  end if;

  select count(*) + 1 into v_completion_rank
    from public.completions
   where lesson_id = p_lesson_id and completed_at < v_my.completed_at;

  select count(*) + 1 into v_attempt_rank
    from public.completions
   where lesson_id = p_lesson_id and first_attempt_at < v_my.first_attempt_at;

  -- percent_rank() returns [0,1]; window must be over all rows for the lesson,
  -- then filter to this user. ORDER BY attempts_to_pass DESC means fewer
  -- attempts ranks higher (closer to 1.0). Lone completer => 0; treat as 100.
  select case when v_total_completions <= 1 then 100
              else round((pct * 100)::numeric, 1) end
    into v_pct
    from (
      select user_id,
             percent_rank() over (order by attempts_to_pass desc) as pct
        from public.completions
       where lesson_id = p_lesson_id
    ) ranked
   where user_id = p_user_id;

  return query select
    v_pct,
    v_completion_rank,
    v_attempt_rank,
    v_total_completions,
    v_total_attempters,
    v_my.attempts_to_pass;
end;
$$;

grant execute on function public.lesson_achievement(text, uuid) to anon, authenticated;

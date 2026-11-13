-- One JSON document per user (tasks, routine choices, workouts, settings).
create table if not exists hub_state (
  user_id    text primary key,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

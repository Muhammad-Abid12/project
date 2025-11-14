create table public.push_subscriptions (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id uuid not null,
  subscription jsonb not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint push_subscriptions_pkey primary key (id),
  constraint push_subscriptions_user_id_key unique (user_id),
  constraint push_subscriptions_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;
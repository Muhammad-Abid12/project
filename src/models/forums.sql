create table public.forums (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  description text null,
  category text not null,
  author_id uuid not null,
  message_count integer null default 0,
  last_activity timestamp with time zone null default now(),
  is_pinned boolean null default false,
  tags text[] null default '{}'::text[],
  created_at timestamp with time zone null default now(),
  constraint forums_pkey primary key (id),
  constraint fk_forums_author foreign KEY (author_id) references profiles (id) on delete CASCADE,
  constraint forums_author_id_fkey foreign KEY (author_id) references auth.users (id)
) TABLESPACE pg_default;
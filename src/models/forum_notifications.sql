create table public.forum_notifications (
  id uuid not null default gen_random_uuid (),
  forum_id uuid not null,
  message_id uuid not null,
  author_id uuid not null,
  content text not null,
  created_at timestamp with time zone null default now(),
  constraint forum_notifications_pkey primary key (id),
  constraint forum_notifications_author_id_fkey foreign KEY (author_id) references auth.users (id) on delete CASCADE,
  constraint forum_notifications_forum_id_fkey foreign KEY (forum_id) references forums (id) on delete CASCADE,
  constraint forum_notifications_message_id_fkey foreign KEY (message_id) references forum_messages (id) on delete CASCADE
) TABLESPACE pg_default;
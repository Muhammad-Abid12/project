create table public.forum_messages (
  id uuid not null default extensions.uuid_generate_v4 (),
  forum_id uuid not null,
  content text not null,
  author_id uuid not null,
  parent_id uuid null,
  upvotes integer null default 0,
  downvotes integer null default 0,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint forum_messages_pkey primary key (id),
  constraint fk_messages_author foreign KEY (author_id) references profiles (id) on delete CASCADE,
  constraint forum_messages_author_id_fkey foreign KEY (author_id) references auth.users (id),
  constraint forum_messages_forum_id_fkey foreign KEY (forum_id) references forums (id) on delete CASCADE,
  constraint forum_messages_parent_id_fkey foreign KEY (parent_id) references forum_messages (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger on_forum_message_insert
after INSERT on forum_messages for EACH row
execute FUNCTION notify_forum_message ();

create trigger update_forum_message_count
after INSERT on forum_messages for EACH row
execute FUNCTION update_forum_stats ();
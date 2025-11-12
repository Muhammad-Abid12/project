/*
  # Create Messaging Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `username` (text, unique)
      - `avatar_url` (text)
      - `status` (text, default: 'offline')
      - `created_at` (timestamp)
    
    - `forums`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `category` (text)
      - `author_id` (uuid, foreign key)
      - `is_pinned` (boolean, default: false)
      - `message_count` (integer, default: 0)
      - `last_activity` (timestamp)
      - `created_at` (timestamp)
    
    - `forum_tags`
      - `id` (uuid, primary key)
      - `forum_id` (uuid, foreign key)
      - `tag` (text)
    
    - `chats`
      - `id` (uuid, primary key)
      - `name` (text)
      - `type` (text: 'private' or 'group')
      - `creator_id` (uuid, foreign key)
      - `avatar_url` (text)
      - `last_message_id` (uuid)
      - `created_at` (timestamp)
    
    - `chat_participants`
      - `id` (uuid, primary key)
      - `chat_id` (uuid, foreign key)
      - `user_id` (uuid, foreign key)
      - `joined_at` (timestamp)
    
    - `messages`
      - `id` (uuid, primary key)
      - `forum_id` (uuid, foreign key, nullable)
      - `chat_id` (uuid, foreign key, nullable)
      - `author_id` (uuid, foreign key)
      - `content` (text)
      - `parent_id` (uuid, foreign key, nullable)
      - `upvotes` (integer, default: 0)
      - `downvotes` (integer, default: 0)
      - `is_edited` (boolean, default: false)
      - `created_at` (timestamp)
    
    - `user_chat_unread`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `chat_id` (uuid, foreign key)
      - `unread_count` (integer, default: 0)

  2. Security
    - Enable RLS on all tables
    - Users can view all users (public data)
    - Users can view forums and their messages
    - Users can only modify their own messages
    - Users can view chats they're part of
    - Users can only manage their own unread counts
*/

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  username text UNIQUE NOT NULL,
  avatar_url text,
  status text DEFAULT 'offline',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forums (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text NOT NULL,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_pinned boolean DEFAULT false,
  message_count integer DEFAULT 0,
  last_activity timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS forum_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id uuid NOT NULL REFERENCES forums(id) ON DELETE CASCADE,
  tag text NOT NULL
);

CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('private', 'group')),
  creator_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  avatar_url text,
  last_message_id uuid,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  joined_at timestamptz DEFAULT now(),
  UNIQUE(chat_id, user_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  forum_id uuid REFERENCES forums(id) ON DELETE CASCADE,
  chat_id uuid REFERENCES chats(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content text NOT NULL,
  parent_id uuid REFERENCES messages(id) ON DELETE CASCADE,
  upvotes integer DEFAULT 0,
  downvotes integer DEFAULT 0,
  is_edited boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS user_chat_unread (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  chat_id uuid NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  unread_count integer DEFAULT 0,
  UNIQUE(user_id, chat_id)
);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE forums ENABLE ROW LEVEL SECURITY;
ALTER TABLE forum_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_chat_unread ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Anyone can view forums"
  ON forums FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create forums"
  ON forums FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Forum authors can update own forums"
  ON forums FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Forum authors can delete own forums"
  ON forums FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Anyone can view forum tags"
  ON forum_tags FOR SELECT
  USING (true);

CREATE POLICY "Forum authors can manage tags"
  ON forum_tags FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM forums WHERE forums.id = forum_id AND forums.author_id = auth.uid()
    )
  );

CREATE POLICY "Forum authors can delete tags"
  ON forum_tags FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM forums WHERE forums.id = forum_id AND forums.author_id = auth.uid()
    )
  );

CREATE POLICY "Users can view chats they are part of"
  ON chats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants WHERE chat_participants.chat_id = chats.id AND chat_participants.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chats"
  ON chats FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Chat participants can view chat participants"
  ON chat_participants FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants cp WHERE cp.chat_id = chat_participants.chat_id AND cp.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can join chats"
  ON chat_participants FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Chat creators can add participants"
  ON chat_participants FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM chats WHERE chats.id = chat_id AND chats.creator_id = auth.uid()
    )
  );

CREATE POLICY "Forum participants can view messages"
  ON messages FOR SELECT
  USING (
    forum_id IS NOT NULL
    OR (
      chat_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM chat_participants WHERE chat_participants.chat_id = messages.chat_id AND chat_participants.user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Authenticated users can create messages"
  ON messages FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Message authors can update own messages"
  ON messages FOR UPDATE
  TO authenticated
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Message authors can delete own messages"
  ON messages FOR DELETE
  TO authenticated
  USING (auth.uid() = author_id);

CREATE POLICY "Users can manage own unread counts"
  ON user_chat_unread FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_forums_author_id ON forums(author_id);
CREATE INDEX IF NOT EXISTS idx_forums_category ON forums(category);
CREATE INDEX IF NOT EXISTS idx_forum_tags_forum_id ON forum_tags(forum_id);
CREATE INDEX IF NOT EXISTS idx_chats_creator_id ON chats(creator_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_chat_id ON chat_participants(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_participants_user_id ON chat_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_forum_id ON messages(forum_id);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_author_id ON messages(author_id);
CREATE INDEX IF NOT EXISTS idx_messages_parent_id ON messages(parent_id);
CREATE INDEX IF NOT EXISTS idx_user_chat_unread_user_id ON user_chat_unread(user_id);
CREATE INDEX IF NOT EXISTS idx_user_chat_unread_chat_id ON user_chat_unread(chat_id);

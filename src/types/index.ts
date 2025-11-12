export interface User {
  id: string;
  username: string;
  avatar?: string;
  status?: 'online' | 'offline' | 'away';
}

export interface Message {
  id: string;
  content: string;
  author: User;
  timestamp: Date;
  parentId?: string;
  replies?: Message[];
  upvotes: number;
  downvotes: number;
  isEdited?: boolean;
}

export interface Chat {
  id: string;
  name: string;
  type: 'private' | 'group';
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  avatar?: string;
}

export interface Forum {
  id: string;
  title: string;
  description: string;
  category: string;
  author: User;
  messageCount: number;
  lastActivity: Date;
  isPinned?: boolean;
  tags?: string[];
}

export type ViewMode = 'forum' | 'group' | 'private';

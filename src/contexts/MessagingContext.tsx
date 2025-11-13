import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from './AuthContext';
import { ViewMode, Chat, Forum, Message, User } from '../types';

interface MessagingContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null) => void;
  selectedForum: Forum | null;
  setSelectedForum: (forum: Forum | null) => void;
  forums: Forum[];
  messages: Message[];
  currentUser: User;
  loading: boolean;
  createForum: (data: Omit<Forum, 'id' | 'author' | 'messageCount' | 'lastActivity'>) => Promise<void>;
  postMessage: (forumId: string, content: string, parentId?: string) => Promise<void>;
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) throw new Error('useMessaging must be within MessagingProvider');
  return context;
};

export const MessagingProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>('forum');
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);
  const [forums, setForums] = useState<Forum[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser: User = {
    id: user?.id || '',
    username: user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'You',
    avatar: user?.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.user_metadata?.full_name || 'You')}&background=2563eb&color=fff&size=40`,
  };

  const fetchForums = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('forums')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url) // Supabase automatically handles the join
        `)
        .order('last_activity', { ascending: false });

      if (error) {
        console.error('Fetch forums error:', error);
        return;
      }

      if (data) {
        const formatted = data.map((f: any) => ({
          ...f,
          author: {
            id: f.author?.id || '',
            username: f.author?.full_name || 'Unknown',
            avatar: f.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(f.author?.full_name || 'U')}&background=2563eb&color=fff&size=40`,
          },
        }));
        setForums(formatted);
        // console.log('Fetched forums:', formatted);
      }
    } catch (err) {
      console.error('Unexpected fetchForums error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (forumId: string) => {
    if (!forumId) return;
    try {
      // Top-level messages
      const { data: topLevelData, error: topError } = await supabase
        .from('forum_messages')
        .select(`
          *,
          author:profiles(id, full_name, avatar_url)
        `)
        .eq('forum_id', forumId)
        .is('parent_id', null)
        .order('created_at', { ascending: true });

      if (topError) {
        console.error('Top-level fetch error:', topError);
        return;
      }

      // Recursive replies
      const buildThread = async (msg: any): Promise<Message> => {
        const { data: repliesData, error: replyError } = await supabase
          .from('forum_messages')
          .select(`
            *,
            author:profiles(id, full_name, avatar_url)
          `)
          .eq('parent_id', msg.id)
          .order('created_at', { ascending: true });

        if (replyError) {
          console.error('Replies fetch error:', replyError);
          return { ...msg, replies: [] } as Message;
        }

        const formattedReplies = repliesData ? await Promise.all(repliesData.map(buildThread)) : [];

        return {
          id: msg.id,
          content: msg.content,
          author: {
            id: msg.author?.id || '',
            username: msg.author?.full_name || 'User',
            avatar: msg.author?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.author?.full_name || 'U')}&background=2563eb&color=fff&size=40`,
          },
          timestamp: new Date(msg.created_at),
          upvotes: msg.upvotes || 0,
          downvotes: msg.downvotes || 0,
          replies: formattedReplies,
        };
      };

      if (topLevelData) {
        const threads = await Promise.all(topLevelData.map(buildThread));
        setMessages(threads);
        // console.log('Fetched messages:', threads); // Debug: Should show posts
      }
    } catch (err) {
      console.error('Unexpected fetchMessages error:', err);
    }
  };

  // Create Forum (unchanged, but add refresh)
  const createForum = async (data: Omit<Forum, 'id' | 'author' | 'messageCount' | 'lastActivity'>) => {
    const { error } = await supabase
      .from('forums')
      .insert({
        title: data.title,
        description: data.description,
        category: data.category,
        author_id: user?.id,
        tags: data.tags,
        is_pinned: false, // Default
      });

    if (error) throw error;
    await fetchForums(); // Refresh list
  };

  // Post Message (unchanged, but add refresh)
  const postMessage = async (forumId: string, content: string, parentId?: string) => {
    const { error } = await supabase
      .from('forum_messages')
      .insert({
        forum_id: forumId,
        content,
        author_id: user?.id,
        parent_id: parentId,
      });

    if (error) throw error;
    // Refresh messages after post
    await fetchMessages(forumId);
  };

  // Realtime: Forums (listen for changes)
  useEffect(() => {
    fetchForums();
    const forumSub = supabase
      .channel('forums')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'forums' },
        () => fetchForums()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(forumSub);
    };
  }, [user]); // Re-fetch if user changes

  // Realtime + Fetch Messages when forum changes
  useEffect(() => {
    if (selectedForum?.id) {
      fetchMessages(selectedForum.id);
      const msgSub = supabase
        .channel(`forum-${selectedForum.id}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'forum_messages', filter: `forum_id=eq.${selectedForum.id}` },
          () => fetchMessages(selectedForum.id)
        )
        .subscribe();

      return () => {
        supabase.removeChannel(msgSub);
      };
    }
  }, [selectedForum]);

  return (
    <MessagingContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedChat,
        setSelectedChat,
        selectedForum,
        setSelectedForum,
        forums,
        messages,
        currentUser,
        loading,
        createForum,
        postMessage,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
};

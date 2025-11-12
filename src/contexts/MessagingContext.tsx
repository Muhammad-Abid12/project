import { createContext, useContext, useState, ReactNode } from 'react';
import { ViewMode, Chat, Forum, Message } from '../types';

interface MessagingContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedChat: Chat | null;
  setSelectedChat: (chat: Chat | null) => void;
  selectedForum: Forum | null;
  setSelectedForum: (forum: Forum | null) => void;
  currentUser: { id: string; username: string; avatar: string };
}

const MessagingContext = createContext<MessagingContextType | undefined>(undefined);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within MessagingProvider');
  }
  return context;
};

export const MessagingProvider = ({ children }: { children: ReactNode }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('forum');
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedForum, setSelectedForum] = useState<Forum | null>(null);

  const currentUser = {
    id: 'user-1',
    username: 'You',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100',
  };

  return (
    <MessagingContext.Provider
      value={{
        viewMode,
        setViewMode,
        selectedChat,
        setSelectedChat,
        selectedForum,
        setSelectedForum,
        currentUser,
      }}
    >
      {children}
    </MessagingContext.Provider>
  );
};

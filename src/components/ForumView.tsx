import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Chip,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import { Send, PushPin } from '@mui/icons-material';
import { useMessaging } from '../contexts/MessagingContext';
import { MessageThread } from './MessageThread';
import { Message } from '../types';

const mockMessages: Message[] = [
  {
    id: 'msg-1',
    content: 'I think React hooks have really improved the way we write components. What do you all think?',
    author: {
      id: 'user-2',
      username: 'DevMaster',
      avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100',
    },
    timestamp: new Date('2025-11-10T10:30:00'),
    upvotes: 24,
    downvotes: 2,
    replies: [
      {
        id: 'msg-2',
        content: 'Absolutely! useState and useEffect are game changers. Custom hooks are even better for reusability.',
        author: {
          id: 'user-3',
          username: 'CodeNinja',
          avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?w=100',
        },
        timestamp: new Date('2025-11-10T11:15:00'),
        upvotes: 12,
        downvotes: 0,
        parentId: 'msg-1',
        replies: [
          {
            id: 'msg-3',
            content: 'Custom hooks are the best! I created one for handling forms and it saved me so much time.',
            author: {
              id: 'user-4',
              username: 'ReactFan',
              avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?w=100',
            },
            timestamp: new Date('2025-11-10T12:00:00'),
            upvotes: 8,
            downvotes: 1,
            parentId: 'msg-2',
          },
        ],
      },
      {
        id: 'msg-4',
        content: 'I still prefer class components for complex state management. Anyone else?',
        author: {
          id: 'user-5',
          username: 'OldSchool',
          avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=100',
        },
        timestamp: new Date('2025-11-10T13:30:00'),
        upvotes: 3,
        downvotes: 15,
        parentId: 'msg-1',
      },
    ],
  },
  {
    id: 'msg-5',
    content: 'Has anyone tried using useReducer for global state instead of Redux? Thoughts?',
    author: {
      id: 'user-6',
      username: 'StateManager',
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=100',
    },
    timestamp: new Date('2025-11-11T08:00:00'),
    upvotes: 18,
    downvotes: 1,
    replies: [],
  },
];

export const ForumView = () => {
  const { selectedForum, currentUser } = useMessaging();
  const [newMessage, setNewMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  if (!selectedForum) {
    return (
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Select a forum to view discussions
        </Typography>
      </Box>
    );
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: `msg-${Date.now()}`,
        content: newMessage,
        author: {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar,
        },
        timestamp: new Date(),
        upvotes: 0,
        downvotes: 0,
        replies: [],
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const handleReply = (parentId: string, content: string) => {
    const newReply: Message = {
      id: `msg-${Date.now()}`,
      content,
      author: {
        id: currentUser.id,
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      timestamp: new Date(),
      upvotes: 0,
      downvotes: 0,
      parentId,
    };

    const addReplyToThread = (msgs: Message[]): Message[] => {
      return msgs.map((msg) => {
        if (msg.id === parentId) {
          return {
            ...msg,
            replies: [...(msg.replies || []), newReply],
          };
        }
        if (msg.replies) {
          return {
            ...msg,
            replies: addReplyToThread(msg.replies),
          };
        }
        return msg;
      });
    };

    setMessages(addReplyToThread(messages));
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {selectedForum.isPinned && <PushPin fontSize="small" color="primary" />}
          <Typography variant="h5" fontWeight={700}>
            {selectedForum.title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          {selectedForum.description}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
          {selectedForum.tags?.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar src={selectedForum.author.avatar} sx={{ width: 24, height: 24 }}>
              {selectedForum.author.username[0]}
            </Avatar>
            <Typography variant="caption" color="text.secondary">
              Created by {selectedForum.author.username}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            {selectedForum.messageCount} messages
          </Typography>
        </Box>
      </Paper>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {messages.map((message) => (
          <MessageThread key={message.id} message={message} onReply={handleReply} />
        ))}
      </Box>

      <Paper elevation={3} sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
          <Avatar src={currentUser.avatar} sx={{ width: 40, height: 40 }}>
            {currentUser.username[0]}
          </Avatar>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Share your thoughts..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{ minWidth: 100 }}
            startIcon={<Send />}
          >
            Post
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

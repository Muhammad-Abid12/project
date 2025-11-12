import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  Chip,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Send,
  AttachFile,
  EmojiEmotions,
  MoreVert,
  Info,
} from '@mui/icons-material';
import { useMessaging } from '../contexts/MessagingContext';

interface ChatMessage {
  id: string;
  content: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  timestamp: Date;
  isOwn: boolean;
}

const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    content: 'Hey, how are you?',
    senderId: 'user-2',
    senderName: 'Alice Johnson',
    senderAvatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?w=100',
    timestamp: new Date('2025-11-11T09:00:00'),
    isOwn: false,
  },
  {
    id: '2',
    content: "I'm doing great! Just working on a new project.",
    senderId: 'user-1',
    senderName: 'You',
    senderAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100',
    timestamp: new Date('2025-11-11T09:02:00'),
    isOwn: true,
  },
  {
    id: '3',
    content: 'That sounds exciting! What kind of project?',
    senderId: 'user-2',
    senderName: 'Alice Johnson',
    senderAvatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?w=100',
    timestamp: new Date('2025-11-11T09:05:00'),
    isOwn: false,
  },
  {
    id: '4',
    content: 'A messaging platform with forums, group chats, and private messaging. Kind of like a hybrid of Reddit and Discord!',
    senderId: 'user-1',
    senderName: 'You',
    senderAvatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?w=100',
    timestamp: new Date('2025-11-11T09:07:00'),
    isOwn: true,
  },
];

export const ChatView = () => {
  const { selectedChat, currentUser } = useMessaging();
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages);
  const [newMessage, setNewMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!selectedChat) {
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
          Select a chat to start messaging
        </Typography>
      </Box>
    );
  }

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const message: ChatMessage = {
        id: `msg-${Date.now()}`,
        content: newMessage,
        senderId: currentUser.id,
        senderName: currentUser.username,
        senderAvatar: currentUser.avatar,
        timestamp: new Date(),
        isOwn: true,
      };
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    }).format(date);
  };

  return (
    <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          borderBottom: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <Avatar src={selectedChat.avatar} sx={{ width: 48, height: 48 }}>
          {selectedChat.name[0]}
        </Avatar>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" fontWeight={600}>
            {selectedChat.name}
          </Typography>
          {selectedChat.type === 'group' && (
            <Typography variant="caption" color="text.secondary">
              {selectedChat.participants.length || 5} members
            </Typography>
          )}
          {selectedChat.type === 'private' && (
            <Chip label="Online" size="small" color="success" sx={{ height: 20 }} />
          )}
        </Box>
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreVert />
        </IconButton>
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={() => setAnchorEl(null)}
        >
          <MenuItem onClick={() => setAnchorEl(null)}>
            <Info fontSize="small" sx={{ mr: 1 }} />
            View Info
          </MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>Mute Notifications</MenuItem>
          <MenuItem onClick={() => setAnchorEl(null)}>Search in Chat</MenuItem>
        </Menu>
      </Paper>

      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        {messages.map((message, index) => {
          const showAvatar =
            !message.isOwn &&
            (index === messages.length - 1 ||
              messages[index + 1].senderId !== message.senderId);

          const showTimestamp =
            index === 0 ||
            new Date(message.timestamp).getTime() -
              new Date(messages[index - 1].timestamp).getTime() >
              300000;

          return (
            <Box key={message.id}>
              {showTimestamp && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                  <Chip
                    label={new Date(message.timestamp).toLocaleDateString()}
                    size="small"
                    sx={{ bgcolor: 'background.paper' }}
                  />
                </Box>
              )}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: message.isOwn ? 'flex-end' : 'flex-start',
                  alignItems: 'flex-end',
                  gap: 1,
                }}
              >
                {!message.isOwn && (
                  <Avatar
                    src={message.senderAvatar}
                    sx={{
                      width: 32,
                      height: 32,
                      visibility: showAvatar ? 'visible' : 'hidden',
                    }}
                  >
                    {message.senderName[0]}
                  </Avatar>
                )}
                <Box
                  sx={{
                    maxWidth: '70%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: message.isOwn ? 'flex-end' : 'flex-start',
                  }}
                >
                  {!message.isOwn && showAvatar && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mb: 0.5, ml: 1 }}
                    >
                      {message.senderName}
                    </Typography>
                  )}
                  <Paper
                    elevation={0}
                    sx={{
                      p: 1.5,
                      bgcolor: message.isOwn ? 'primary.main' : 'background.paper',
                      color: message.isOwn ? 'primary.contrastText' : 'text.primary',
                      borderRadius: 2,
                      wordBreak: 'break-word',
                    }}
                  >
                    <Typography variant="body2">{message.content}</Typography>
                  </Paper>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ mt: 0.5, mx: 1 }}
                  >
                    {formatTime(message.timestamp)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Box>

      <Paper elevation={3} sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-end' }}>
          <IconButton size="small">
            <AttachFile />
          </IconButton>
          <IconButton size="small">
            <EmojiEmotions />
          </IconButton>
          <TextField
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            variant="outlined"
            size="small"
          />
          <IconButton
            color="primary"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            sx={{
              bgcolor: 'primary.main',
              color: 'white',
              '&:hover': { bgcolor: 'primary.dark' },
              '&:disabled': { bgcolor: 'action.disabledBackground' },
            }}
          >
            <Send />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

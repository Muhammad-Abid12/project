import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Badge,
  Typography,
  Divider,
  Avatar,
  IconButton,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  Forum as ForumIcon,
  Group as GroupIcon,
  Chat as ChatIcon,
  Add as AddIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { useMessaging } from '../contexts/MessagingContext';
import { useState } from 'react';
import { Chat, Forum } from '../types';
import { CreateForumDialog } from './CreateForumDialog';
import { CreateChatDialog } from './CreateChatDialog';


export const Sidebar = () => {
  const { forums, createForum, viewMode, setViewMode, selectedChat, setSelectedChat, selectedForum, setSelectedForum } = useMessaging();
  const [searchQuery, setSearchQuery] = useState('');
  const [openForumDialog, setOpenForumDialog] = useState(false);
  const [openChatDialog, setOpenChatDialog] = useState(false);
  const [chats, setChats] = useState<Chat[]>([
    {
      id: 'chat-1',
      name: 'Alice Johnson',
      type: 'private',
      participants: [],
      lastMessage: { content: 'Hey, how are you?', timestamp: new Date() } as any,
      unreadCount: 2,
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?w=100',
    },
    {
      id: 'chat-2',
      name: 'Project Team',
      type: 'group',
      participants: [],
      lastMessage: { content: 'Meeting at 3 PM', timestamp: new Date() } as any,
      unreadCount: 5,
      avatar: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=100',
    },
    {
      id: 'chat-3',
      name: 'Bob Smith',
      type: 'private',
      participants: [],
      lastMessage: { content: 'Thanks!', timestamp: new Date() } as any,
      unreadCount: 0,
      avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?w=100',
    },
  ]);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredForums = forums.filter((forum) =>
    forum.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // TODO: Remove This
  const handleCreateForum = async (newForum: Omit<Forum, 'id' | 'author' | 'messageCount' | 'lastActivity'>) => {
    await createForum(newForum);
    setViewMode('forum');
  };

  const handleCreateChat = (newChat: Omit<Chat, 'id' | 'lastMessage' | 'unreadCount'>) => {
    const chat: Chat = {
      ...newChat,
      id: `chat-${Date.now()}`,
      lastMessage: undefined,
      unreadCount: 0,
    };
    setChats([...chats, chat]);
    setSelectedChat(chat);
    setViewMode(newChat.type === 'group' ? 'group' : 'private');
  };

  return (
    <Box
      sx={{
        width: 280,
        borderRight: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" fontWeight={700} gutterBottom>
          Messaging Hub
        </Typography>
        <TextField
          fullWidth
          size="small"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <List sx={{ py: 0 }}>
        <ListItem disablePadding>
          <ListItemButton
            selected={viewMode === 'forum'}
            onClick={() => {
              setViewMode('forum');
              setSelectedChat(null);
            }}
          >
            <ListItemIcon>
              <ForumIcon />
            </ListItemIcon>
            <ListItemText primary="Forums" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={viewMode === 'group'}
            onClick={() => {
              setViewMode('group');
              setSelectedForum(null);
            }}
          >
            <ListItemIcon>
              <Badge badgeContent={5} color="error">
                <GroupIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Group Chats" />
          </ListItemButton>
        </ListItem>
        <ListItem disablePadding>
          <ListItemButton
            selected={viewMode === 'private'}
            onClick={() => {
              setViewMode('private');
              setSelectedForum(null);
            }}
          >
            <ListItemIcon>
              <Badge badgeContent={2} color="error">
                <ChatIcon />
              </Badge>
            </ListItemIcon>
            <ListItemText primary="Private Chats" />
          </ListItemButton>
        </ListItem>
      </List>

      <Divider />

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {viewMode === 'forum' ? (
          <List>
            {filteredForums.map((forum) => (
              <ListItem
                key={forum.id}
                disablePadding
                secondaryAction={
                  <Typography variant="caption" color="text.secondary">
                    {forum.messageCount}
                  </Typography>
                }
              >
                <ListItemButton
                  selected={selectedForum?.id === forum.id}
                  onClick={() => setSelectedForum(forum)}
                >
                  <ListItemText
                    primary={forum.title}
                    secondary={forum.category}
                    primaryTypographyProps={{
                      noWrap: true,
                      fontSize: '0.9rem',
                      fontWeight: forum.isPinned ? 600 : 400,
                    }}
                    secondaryTypographyProps={{ noWrap: true, fontSize: '0.75rem' }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <List>
            {filteredChats
              .filter((chat) => (viewMode === 'group' ? chat.type === 'group' : chat.type === 'private'))
              .map((chat) => (
                <ListItem key={chat.id} disablePadding>
                  <ListItemButton
                    selected={selectedChat?.id === chat.id}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <Avatar src={chat.avatar} sx={{ width: 40, height: 40, mr: 2 }} />
                    <ListItemText
                      primary={chat.name}
                      secondary={chat.lastMessage?.content}
                      primaryTypographyProps={{ noWrap: true, fontSize: '0.9rem' }}
                      secondaryTypographyProps={{ noWrap: true, fontSize: '0.75rem' }}
                    />
                    {chat.unreadCount > 0 && (
                      <Badge badgeContent={chat.unreadCount} color="error" sx={{ ml: 1 }} />
                    )}
                  </ListItemButton>
                </ListItem>
              ))}
          </List>
        )}
      </Box>

      <Divider />
      <Box sx={{ p: 2 }}>
        <IconButton
          onClick={() => {
            if (viewMode === 'forum') {
              setOpenForumDialog(true);
            } else {
              setOpenChatDialog(true);
            }
          }}
          sx={{
            width: '100%',
            border: '2px dashed',
            borderColor: 'primary.main',
            borderRadius: 2,
            py: 1.5,
          }}
        >
          <AddIcon />
          <Typography variant="body2" sx={{ ml: 1 }}>
            New {viewMode === 'forum' ? 'Forum' : 'Chat'}
          </Typography>
        </IconButton>
      </Box>

      <CreateForumDialog
        open={openForumDialog}
        onClose={() => setOpenForumDialog(false)}
      // onCreate={handleCreateForum}
      />
      <CreateChatDialog
        open={openChatDialog}
        onClose={() => setOpenChatDialog(false)}
        onCreate={handleCreateChat}
        chatType={viewMode === 'group' ? 'group' : 'private'}
      />
    </Box>
  );
};

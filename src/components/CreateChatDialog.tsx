import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  Stack,
  Autocomplete,
  Avatar,
} from '@mui/material';
import { Chat } from '../types';

interface CreateChatDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (chat: Omit<Chat, 'id' | 'lastMessage' | 'unreadCount'>) => void;
  chatType: 'private' | 'group';
}

const MOCK_USERS = [
  { id: 'user-2', username: 'Alice Johnson', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?w=100' },
  { id: 'user-3', username: 'Bob Smith', avatar: 'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?w=100' },
  { id: 'user-4', username: 'Carol White', avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?w=100' },
  { id: 'user-5', username: 'David Brown', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?w=100' },
  { id: 'user-6', username: 'Eve Davis', avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?w=100' },
];

export const CreateChatDialog = ({ open, onClose, onCreate, chatType }: CreateChatDialogProps) => {
  const [name, setName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<typeof MOCK_USERS>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = 'Name is required';
    if (chatType === 'group' && selectedUsers.length < 2) {
      newErrors.participants = 'Group chat requires at least 2 participants';
    }
    if (chatType === 'private' && selectedUsers.length !== 1) {
      newErrors.participants = 'Private chat requires exactly 1 participant';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;

    onCreate({
      name: name.trim(),
      type: chatType,
      participants: selectedUsers,
      avatar: selectedUsers[0]?.avatar,
    });

    setName('');
    setSelectedUsers([]);
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Create {chatType === 'private' ? 'Private' : 'Group'} Chat
      </DialogTitle>
      <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Chat Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={!!errors.name}
          helperText={errors.name}
          placeholder={chatType === 'private' ? "Recipient's name" : 'Group name'}
        />

        <Box>
          <label style={{ fontSize: '0.875rem', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
            Select {chatType === 'private' ? 'Recipient' : 'Participants'}
          </label>
          <Autocomplete
            multiple={chatType === 'group'}
            fullWidth
            options={MOCK_USERS}
            getOptionLabel={(option) => option.username}
            value={selectedUsers}
            onChange={(_, newValue) => setSelectedUsers(newValue)}
            renderOption={(props, option) => (
              <Box component="li" sx={{ display: 'flex', alignItems: 'center', gap: 1 }} {...props}>
                <Avatar src={option.avatar} sx={{ width: 32, height: 32 }}>
                  {option.username[0]}
                </Avatar>
                {option.username}
              </Box>
            )}
            renderInput={(params) => (
              <TextField {...params} placeholder="Search users..." size="small" />
            )}
          />
          {errors.participants && (
            <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 1 }}>
              {errors.participants}
            </Box>
          )}
        </Box>

        {selectedUsers.length > 0 && (
          <Box sx={{ bgcolor: 'action.hover', p: 1.5, borderRadius: 1 }}>
            <Stack spacing={1}>
              {selectedUsers.map((user) => (
                <Box key={user.id} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar src={user.avatar} sx={{ width: 32, height: 32 }}>
                    {user.username[0]}
                  </Avatar>
                  <span>{user.username}</span>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreate} variant="contained">
          Create Chat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import { Forum } from '../types';

interface CreateForumDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (forum: Omit<Forum, 'id' | 'messageCount' | 'lastActivity'>) => void;
}

const CATEGORIES = ['Development', 'Design', 'Business', 'General', 'Help & Support', 'Announcements'];

export const CreateForumDialog = ({ open, onClose, onCreate }: CreateForumDialogProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!category) newErrors.category = 'Category is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = () => {
    if (!validate()) return;

    onCreate({
      title: title.trim(),
      description: description.trim(),
      category,
      author: {
        id: 'current-user',
        username: 'You',
      },
      tags,
      isPinned: false,
    });

    setTitle('');
    setDescription('');
    setCategory('');
    setTags([]);
    setTagInput('');
    setErrors({});
    onClose();
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New Forum</DialogTitle>
      <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          fullWidth
          label="Forum Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={!!errors.title}
          helperText={errors.title}
          placeholder="e.g., Best Practices for React"
        />

        <TextField
          fullWidth
          label="Description"
          multiline
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what this forum is about..."
        />

        <TextField
          select
          fullWidth
          label="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          error={!!errors.category}
          helperText={errors.category}
          SelectProps={{
            native: true,
          }}
        >
          <option value=""></option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </TextField>

        <Box>
          <TextField
            fullWidth
            label="Add Tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddTag();
              }
            }}
            placeholder="Type and press Enter or click Add"
            size="small"
          />
          <Button size="small" onClick={handleAddTag} sx={{ mt: 1 }}>
            Add Tag
          </Button>
          <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: 'wrap' }}>
            {tags.map((tag) => (
              <Chip
                key={tag}
                label={tag}
                onDelete={() => handleRemoveTag(tag)}
                size="small"
              />
            ))}
          </Stack>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreate} variant="contained">
          Create Forum
        </Button>
      </DialogActions>
    </Dialog>
  );
};

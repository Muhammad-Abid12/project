import { useState } from 'react';
import {
  Box,
  Paper,
  Avatar,
  Typography,
  IconButton,
  TextField,
  Button,
  Collapse,
} from '@mui/material';
import {
  ThumbUp,
  ThumbDown,
  Reply as ReplyIcon,
  MoreVert,
  Send,
} from '@mui/icons-material';
import { Message } from '../types';

interface MessageThreadProps {
  message: Message;
  depth?: number;
  onReply?: (parentId: string, content: string) => void;
}

export const MessageThread = ({ message, depth = 0, onReply }: MessageThreadProps) => {
  const [showReply, setShowReply] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [showReplies, setShowReplies] = useState(true);

  const handleReply = () => {
    if (replyContent.trim() && onReply) {
      onReply(message.id, replyContent);
      setReplyContent('');
      setShowReply(false);
    }
  };

  return (
    <Box sx={{ ml: depth * 4 }}>
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 1,
          bgcolor: depth > 0 ? 'action.hover' : 'background.paper',
          borderLeft: depth > 0 ? '3px solid' : 'none',
          borderColor: depth > 0 ? 'primary.main' : 'transparent',
          transition: 'all 0.2s',
          '&:hover': {
            bgcolor: 'action.selected',
          },
        }}
      >
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Avatar src={message.author.avatar} sx={{ width: 40, height: 40 }}>
            {message.author.username[0]}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {message.author.username}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {new Date(message.timestamp).toLocaleString()}
              </Typography>
              {message.isEdited && (
                <Typography variant="caption" color="text.secondary" fontStyle="italic">
                  (edited)
                </Typography>
              )}
            </Box>
            <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
              {message.content}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton size="small">
                <ThumbUp fontSize="small" />
              </IconButton>
              <Typography variant="caption">{message.upvotes}</Typography>
              <IconButton size="small">
                <ThumbDown fontSize="small" />
              </IconButton>
              <Typography variant="caption">{message.downvotes}</Typography>
              <IconButton size="small" onClick={() => setShowReply(!showReply)}>
                <ReplyIcon fontSize="small" />
              </IconButton>
              {message.replies && message.replies.length > 0 && (
                <Button
                  size="small"
                  onClick={() => setShowReplies(!showReplies)}
                  sx={{ textTransform: 'none', minWidth: 'auto' }}
                >
                  {showReplies ? 'Hide' : 'Show'} {message.replies.length} {message.replies.length === 1 ? 'reply' : 'replies'}
                </Button>
              )}
              <IconButton size="small" sx={{ ml: 'auto' }}>
                <MoreVert fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        </Box>
      </Paper>

      <Collapse in={showReply}>
        <Box sx={{ ml: depth * 4 + 7, mb: 2, display: 'flex', gap: 1 }}>
          <TextField
            fullWidth
            size="small"
            multiline
            maxRows={4}
            placeholder="Write a reply..."
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleReply();
              }
            }}
          />
          <Button
            variant="contained"
            onClick={handleReply}
            disabled={!replyContent.trim()}
            sx={{ minWidth: 'auto', px: 2 }}
          >
            <Send fontSize="small" />
          </Button>
        </Box>
      </Collapse>

      {message.replies && showReplies && (
        <Box>
          {message.replies.map((reply) => (
            <MessageThread
              key={reply.id}
              message={reply}
              depth={depth + 1}
              onReply={onReply}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

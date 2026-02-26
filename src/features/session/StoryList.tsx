import { useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CircleIcon from '@mui/icons-material/Circle';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import type { Story } from '@/types/index';
import { addStory, startStory } from '@/features/session/storyService';

interface StoryListProps {
  stories: Story[];
  loading: boolean;
  sessionId: string;
  isMaster: boolean;
  isSessionEnded: boolean;
}

function getStatusColor(status: Story['status']): string {
  switch (status) {
    case 'pending':
      return 'grey.400';
    case 'active':
      return 'warning.main';
    case 'ended':
      return 'success.main';
    default:
      return 'grey.400';
  }
}

function StoryList({
  stories,
  loading,
  sessionId,
  isMaster,
  isSessionEnded,
}: StoryListProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [adding, setAdding] = useState(false);
  const [starting, setStarting] = useState<string | null>(null);

  const hasActiveStory = stories.some((s) => s.status === 'active');

  async function handleAddStory() {
    const trimmed = title.trim();
    if (!trimmed) return;

    setAdding(true);
    try {
      await addStory(sessionId, trimmed, description.trim() || undefined);
      setTitle('');
      setDescription('');
    } catch (err) {
      console.error('Failed to add story:', err);
    } finally {
      setAdding(false);
    }
  }

  async function handleStartStory(storyId: string) {
    setStarting(storyId);
    try {
      await startStory(sessionId, storyId);
    } catch (err) {
      console.error('Failed to start story:', err);
    } finally {
      setStarting(null);
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="text.secondary">Loading stories…</Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6" sx={{ p: 2, pb: 1 }}>
        Stories
      </Typography>

      {/* Add Story form — master only, session not ended */}
      {isMaster && !isSessionEnded && (
        <Box sx={{ px: 2, pb: 1 }}>
          <TextField
            size="small"
            fullWidth
            label="Story title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddStory();
              }
            }}
            disabled={adding}
            sx={{ mb: 1 }}
          />
          <TextField
            size="small"
            fullWidth
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={adding}
            multiline
            maxRows={3}
            sx={{ mb: 1 }}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleAddStory}
            disabled={adding || !title.trim()}
            fullWidth
          >
            Add Story
          </Button>
        </Box>
      )}

      {stories.length === 0 ? (
        <Box sx={{ p: 2 }}>
          <Typography color="text.secondary" variant="body2">
            No stories yet.
          </Typography>
        </Box>
      ) : (
        <List
          sx={{
            flexGrow: 1,
            overflow: 'auto',
          }}
        >
          {stories.map((story) => (
            <ListItem
              key={story.id}
              sx={{
                borderLeft: story.status === 'active' ? 4 : 0,
                borderColor: 'warning.main',
              }}
              secondaryAction={
                isMaster &&
                story.status === 'pending' &&
                !isSessionEnded && (
                  <IconButton
                    edge="end"
                    aria-label="Start story"
                    onClick={() => handleStartStory(story.id)}
                    disabled={hasActiveStory || starting === story.id}
                    color="primary"
                    size="small"
                  >
                    <PlayArrowIcon />
                  </IconButton>
                )
              }
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                {story.status === 'ended' ? (
                  <CheckCircleIcon
                    sx={{ fontSize: 16, color: 'success.main' }}
                  />
                ) : (
                  <CircleIcon
                    sx={{
                      fontSize: 12,
                      color: getStatusColor(story.status),
                    }}
                  />
                )}
              </ListItemIcon>
              <ListItemText
                primary={story.title}
                primaryTypographyProps={{
                  sx: {
                    textDecoration:
                      story.status === 'ended' ? 'line-through' : 'none',
                  },
                }}
              />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default StoryList;

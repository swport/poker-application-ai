import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import CircleIcon from '@mui/icons-material/Circle';
import type { Story } from '@/types/index';

interface StoryListProps {
  stories: Story[];
  loading: boolean;
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

function StoryList({ stories, loading }: StoryListProps) {
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
            >
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CircleIcon
                  sx={{
                    fontSize: 12,
                    color: getStatusColor(story.status),
                  }}
                />
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

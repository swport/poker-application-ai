import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { Story } from '@/types/index';

interface ActiveStoryPanelProps {
  activeStory: Story | undefined;
}

function ActiveStoryPanel({ activeStory }: ActiveStoryPanelProps) {
  if (!activeStory) {
    return (
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
        }}
      >
        <Typography color="text.secondary" variant="h6">
          No active story
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        p: 3,
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
      }}
    >
      <Typography variant="h5" gutterBottom>
        {activeStory.title}
      </Typography>

      {activeStory.description && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {activeStory.description}
        </Typography>
      )}

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography color="text.secondary" variant="body2">
          Voting controls coming soon…
        </Typography>
      </Box>
    </Paper>
  );
}

export default ActiveStoryPanel;

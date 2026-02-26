import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import { useSession } from '@/features/session/useSession';
import { useStories } from '@/features/session/useStories';
import { useSessionRole } from '@/features/session/useSessionRole';
import SessionStatusBanner from '@/features/session/SessionStatusBanner';
import StoryList from '@/features/session/StoryList';
import ActiveStoryPanel from '@/features/session/ActiveStoryPanel';
import ConferencePanel from '@/features/session/ConferencePanel';

function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { session, loading: sessionLoading, error: sessionError } = useSession(sessionId);
  const { stories, loading: storiesLoading } = useStories(sessionId);
  const { isMaster } = useSessionRole(session);

  const activeStory = useMemo(
    () => stories.find((s) => s.status === 'active'),
    [stories],
  );

  if (sessionLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '60vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (sessionError || !session) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          {sessionError ?? 'Session not found.'}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <SessionStatusBanner session={session} />

      <Box sx={{ px: { xs: 0, sm: 1 }, py: 1 }}>
        <Typography variant="h5" component="h1">
          {session.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {isMaster ? 'You are the Poker Master' : 'Participant'}
        </Typography>
      </Box>

      <Grid
        container
        spacing={2}
        sx={{ flexGrow: 1, px: { xs: 0, sm: 1 }, pb: 2 }}
      >
        {/* Left panel — Story List */}
        <Grid size={{ xs: 12, md: 3 }}>
          <Paper
            elevation={0}
            sx={{
              height: '100%',
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <StoryList
              stories={stories}
              loading={storiesLoading}
              sessionId={session.id}
              isMaster={isMaster}
              isSessionEnded={session.status === 'ended'}
            />
          </Paper>
        </Grid>

        {/* Center panel — Active Story */}
        <Grid size={{ xs: 12, md: session.conferenceEnabled ? 6 : 9 }}>
          <ActiveStoryPanel
            activeStory={activeStory}
            session={session}
            isMaster={isMaster}
          />
        </Grid>

        {/* Right panel — Conference (only when enabled) */}
        {session.conferenceEnabled && (
          <Grid size={{ xs: 12, md: 3 }}>
            <ConferencePanel />
          </Grid>
        )}
      </Grid>
    </Box>
  );
}

export default SessionPage;

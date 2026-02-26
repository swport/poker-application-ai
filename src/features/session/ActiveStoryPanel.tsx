import { useCallback, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import StopIcon from '@mui/icons-material/Stop';
import PowerSettingsNewIcon from '@mui/icons-material/PowerSettingsNew';
import type { Session, Story } from '@/types/index';
import CountdownTimer from '@/features/session/CountdownTimer';
import { endStory, endSession } from '@/features/session/storyService';

interface ActiveStoryPanelProps {
  activeStory: Story | undefined;
  session: Session;
  isMaster: boolean;
}

function ActiveStoryPanel({ activeStory, session, isMaster }: ActiveStoryPanelProps) {
  const [ending, setEnding] = useState(false);
  const [endingSession, setEndingSession] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleEndStory = useCallback(async () => {
    if (!activeStory || ending) return;

    setEnding(true);
    try {
      await endStory(session.id, activeStory.id, session.isNumericScale);
    } catch (err) {
      console.error('Failed to end story:', err);
    } finally {
      setEnding(false);
    }
  }, [activeStory, ending, session.id, session.isNumericScale]);

  async function handleEndSession() {
    setEndingSession(true);
    setConfirmOpen(false);
    try {
      // End the active story first if one exists
      if (activeStory) {
        await endStory(session.id, activeStory.id, session.isNumericScale);
      }
      await endSession(session.id);
    } catch (err) {
      console.error('Failed to end session:', err);
    } finally {
      setEndingSession(false);
    }
  }

  if (!activeStory) {
    return (
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          border: 1,
          borderColor: 'divider',
          borderRadius: 2,
          gap: 3,
        }}
      >
        <Typography color="text.secondary" variant="h6">
          No active story
        </Typography>

        {/* End Session button — visible even when no active story */}
        {isMaster && session.status !== 'ended' && (
          <>
            <Button
              variant="outlined"
              color="error"
              startIcon={<PowerSettingsNewIcon />}
              onClick={() => setConfirmOpen(true)}
              disabled={endingSession}
            >
              End Session
            </Button>

            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
              <DialogTitle>End Session?</DialogTitle>
              <DialogContent>
                <DialogContentText>
                  This will permanently end the session. All participants will be
                  notified, and no further voting or story management will be
                  possible.
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
                <Button
                  onClick={handleEndSession}
                  color="error"
                  variant="contained"
                >
                  End Session
                </Button>
              </DialogActions>
            </Dialog>
          </>
        )}
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
        display: 'flex',
        flexDirection: 'column',
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

      {/* Countdown Timer */}
      <CountdownTimer
        timerStart={activeStory.timerStart}
        isMaster={isMaster}
        onExpire={handleEndStory}
      />

      <Box sx={{ mt: 3, textAlign: 'center' }}>
        <Typography color="text.secondary" variant="body2">
          Voting controls coming soon…
        </Typography>
      </Box>

      {/* Master controls */}
      {isMaster && (
        <Box
          sx={{
            mt: 'auto',
            pt: 3,
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Button
            variant="contained"
            color="warning"
            startIcon={<StopIcon />}
            onClick={handleEndStory}
            disabled={ending}
          >
            End Story
          </Button>

          <Button
            variant="outlined"
            color="error"
            startIcon={<PowerSettingsNewIcon />}
            onClick={() => setConfirmOpen(true)}
            disabled={endingSession}
          >
            End Session
          </Button>

          <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
            <DialogTitle>End Session?</DialogTitle>
            <DialogContent>
              <DialogContentText>
                This will end the current story and permanently end the session.
                All participants will be notified.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
              <Button
                onClick={handleEndSession}
                color="error"
                variant="contained"
              >
                End Session
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Paper>
  );
}

export default ActiveStoryPanel;

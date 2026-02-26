import { useState, useCallback } from 'react';
import AddIcon from '@mui/icons-material/Add';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Skeleton from '@mui/material/Skeleton';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/features/auth/useAuth';
import { useSessions } from '@/features/dashboard/useSessions';
import SessionListItem from '@/features/dashboard/SessionListItem';
import CreateSessionModal from '@/features/dashboard/CreateSessionModal';

function DashboardPage() {
  const { user } = useAuth();
  const { sessions, loading, error } = useSessions(user?.uid);
  const [modalOpen, setModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; link: string }>({
    open: false,
    link: '',
  });

  const handleCreated = useCallback((sessionId: string) => {
    const link = `${window.location.origin}/session/${sessionId}`;

    navigator.clipboard.writeText(link).catch(() => {
      // Clipboard write may fail in insecure contexts; snackbar still shows the link
    });

    setModalOpen(false);
    setSnackbar({ open: true, link });
  }, []);

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          My Poker Sessions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setModalOpen(true)}
        >
          Create New Poker
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Paper variant="outlined">
          {Array.from({ length: 3 }).map((_, i) => (
            <Box key={i} sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Skeleton variant="text" width="40%" height={28} />
              <Skeleton variant="text" width="25%" height={20} />
            </Box>
          ))}
        </Paper>
      ) : sessions.length === 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 4,
            textAlign: 'center',
          }}
        >
          <Typography color="text.secondary">
            No sessions yet. Create your first Poker session.
          </Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          {sessions.map((session) => (
            <SessionListItem key={session.id} session={session} />
          ))}
        </Paper>
      )}

      <CreateSessionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          Session created! Link copied: {snackbar.link}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default DashboardPage;

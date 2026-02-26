import { useParams } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Session
      </Typography>
      <Typography color="text.secondary">
        Session <strong>{sessionId}</strong> — coming soon.
      </Typography>
    </Box>
  );
}

export default SessionPage;

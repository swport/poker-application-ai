import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import type { Session } from '@/types/index';

interface SessionStatusBannerProps {
  session: Session;
}

function SessionStatusBanner({ session }: SessionStatusBannerProps) {
  if (session.status !== 'ended') {
    return null;
  }

  return (
    <Alert
      severity="info"
      variant="filled"
      sx={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        borderRadius: 0,
      }}
    >
      <AlertTitle>Session Ended</AlertTitle>
      This session has ended. Voting and story management are disabled.
    </Alert>
  );
}

export default SessionStatusBanner;

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import type { Session } from '@/types/index';
import { formatDate } from '@/utils/dateUtils';

interface SessionListItemProps {
  session: Session;
}

function SessionListItem({ session }: SessionListItemProps) {
  const navigate = useNavigate();
  const isActive = session.status === 'active';

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        p: 2,
        borderBottom: 1,
        borderColor: 'divider',
        '&:last-child': { borderBottom: 0 },
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1, mr: 2 }}>
        <Typography variant="subtitle1" noWrap fontWeight={500}>
          {session.title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {formatDate(session.createdAt)}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
        <Chip
          label={isActive ? 'Active' : 'Ended'}
          color={isActive ? 'success' : 'default'}
          size="small"
          variant={isActive ? 'filled' : 'outlined'}
        />
        <Button
          variant="outlined"
          size="small"
          onClick={() => navigate(`/session/${session.id}`)}
        >
          Open
        </Button>
      </Box>
    </Box>
  );
}

export default SessionListItem;

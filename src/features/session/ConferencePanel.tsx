import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

function ConferencePanel() {
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
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Typography color="text.secondary" variant="body2">
        Conference panel coming soon…
      </Typography>
    </Paper>
  );
}

export default ConferencePanel;

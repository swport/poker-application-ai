import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { Outlet } from 'react-router-dom';
import TopNav from '@/components/layout/TopNav';

function AppShell() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <TopNav />
      {/* Toolbar spacer pushes content below the fixed AppBar */}
      <Toolbar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          overflow: 'auto',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}

export default AppShell;

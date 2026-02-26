import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

function DashboardPlaceholder() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <Typography variant="h4" component="h1">
        Dashboard (coming soon)
      </Typography>
    </Box>
  );
}

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPlaceholder />,
      },
    ],
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App

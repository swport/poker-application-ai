import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useAuth } from '@/features/auth/useAuth';
import {
  sendOTP,
  completeSignInWithEmailLink,
  getStoredEmail,
  isEmailSignInLink,
} from '@/features/auth/authService';

interface EmailFormValues {
  email: string;
}

interface ConfirmEmailFormValues {
  email: string;
}

function LoginPage() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'email' | 'sent' | 'completing'>('email');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const completingRef = useRef(false);

  const emailForm = useForm<EmailFormValues>({ defaultValues: { email: '' } });
  const confirmForm = useForm<ConfirmEmailFormValues>({ defaultValues: { email: '' } });

  // Redirect if already signed in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [authLoading, user, navigate]);

  // Handle email link sign-in on page load
  useEffect(() => {
    if (completingRef.current) return;
    if (!isEmailSignInLink()) return;

    completingRef.current = true;
    const storedEmail = getStoredEmail();

    if (storedEmail) {
      setStep('completing');
      completeSignInWithEmailLink(storedEmail)
        .then(() => navigate('/dashboard', { replace: true }))
        .catch((err: unknown) => {
          setError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.');
          setStep('email');
          completingRef.current = false;
        });
    } else {
      // Opened on a different device — ask for email
      setStep('completing');
    }
  }, [navigate]);

  async function handleSendOTP(data: EmailFormValues) {
    setError(null);
    setSubmitting(true);
    try {
      await sendOTP(data.email);
      setStep('sent');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to send sign-in link.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmEmail(data: ConfirmEmailFormValues) {
    setError(null);
    setSubmitting(true);
    try {
      await completeSignInWithEmailLink(data.email);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  if (authLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        bgcolor: 'background.default',
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 3 }}>
          <Typography variant="h5" component="h1" textAlign="center">
            Poker Planning
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Sign in with your email to get started
          </Typography>

          {error && (
            <Alert severity="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Step 1: Enter email */}
          {step === 'email' && (
            <Box
              component="form"
              onSubmit={emailForm.handleSubmit(handleSendOTP)}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              noValidate
            >
              <TextField
                {...emailForm.register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
                label="Email"
                type="email"
                autoComplete="email"
                autoFocus
                fullWidth
                error={!!emailForm.formState.errors.email}
                helperText={emailForm.formState.errors.email?.message}
                disabled={submitting}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
              >
                {submitting ? 'Sending…' : 'Send Sign-In Link'}
              </Button>
            </Box>
          )}

          {/* Step 2: Link sent confirmation */}
          {step === 'sent' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'center' }}>
              <Alert severity="success">
                A sign-in link has been sent to your email. Click the link in your inbox to continue.
              </Alert>
              <Button variant="text" onClick={() => setStep('email')}>
                Use a different email
              </Button>
            </Box>
          )}

          {/* Step 3: Completing sign-in (opened link on different device) */}
          {step === 'completing' && !getStoredEmail() && (
            <Box
              component="form"
              onSubmit={confirmForm.handleSubmit(handleConfirmEmail)}
              sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
              noValidate
            >
              <Alert severity="info">
                Please confirm the email address you used to request the sign-in link.
              </Alert>
              <TextField
                {...confirmForm.register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: 'Enter a valid email address',
                  },
                })}
                label="Email"
                type="email"
                autoComplete="email"
                autoFocus
                fullWidth
                error={!!confirmForm.formState.errors.email}
                helperText={confirmForm.formState.errors.email?.message}
                disabled={submitting}
              />
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={submitting}
                startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : undefined}
              >
                {submitting ? 'Signing in…' : 'Confirm & Sign In'}
              </Button>
            </Box>
          )}

          {/* Completing auto-sign-in (same device) */}
          {step === 'completing' && getStoredEmail() && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
              <CircularProgress />
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default LoginPage;

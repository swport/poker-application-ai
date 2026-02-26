import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '@/features/auth/useAuth';
import { createSession } from '@/features/dashboard/sessionService';

interface CreateSessionFormValues {
  title: string;
  pointScale: string;
  isNumericScale: boolean;
  conferenceEnabled: boolean;
}

interface CreateSessionModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (sessionId: string) => void;
}

function parsePointScale(input: string): string[] {
  return input
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
}

function hasDuplicates(values: string[]): boolean {
  return new Set(values).size !== values.length;
}

function CreateSessionModal({ open, onClose, onCreated }: CreateSessionModalProps) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateSessionFormValues>({
    defaultValues: {
      title: '',
      pointScale: '1, 2, 3, 5, 8, 13',
      isNumericScale: true,
      conferenceEnabled: false,
    },
  });

  function handleClose() {
    if (submitting) return;
    reset();
    onClose();
  }

  async function onSubmit(data: CreateSessionFormValues) {
    if (!user) return;
    setSubmitting(true);
    try {
      const scaleValues = parsePointScale(data.pointScale);
      const sessionId = await createSession({
        title: data.title,
        pointScale: scaleValues,
        isNumericScale: data.isNumericScale,
        conferenceEnabled: data.conferenceEnabled,
        masterId: user.uid,
      });
      reset();
      onCreated(sessionId);
    } catch (err) {
      console.error('Failed to create session:', err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogTitle>Create New Poker Session</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '8px !important' }}>
          <Controller
            name="title"
            control={control}
            rules={{ required: 'Title is required' }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Session Title"
                placeholder="Sprint 42 Planning"
                error={!!errors.title}
                helperText={errors.title?.message}
                fullWidth
                autoFocus
              />
            )}
          />

          <Controller
            name="pointScale"
            control={control}
            rules={{
              required: 'Point scale is required',
              validate: (value) => {
                const values = parsePointScale(value);
                if (values.length < 2) return 'At least 2 point values are required';
                if (hasDuplicates(values)) return 'Duplicate values are not allowed';
                return true;
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Point Scale"
                placeholder="1, 2, 3, 5, 8, 13"
                error={!!errors.pointScale}
                helperText={errors.pointScale?.message ?? 'Comma-separated values'}
                fullWidth
              />
            )}
          />

          <Tooltip title="Enable to calculate average score" placement="right">
            <FormControlLabel
              control={
                <Controller
                  name="isNumericScale"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      checked={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              }
              label="Numeric scale"
            />
          </Tooltip>

          <FormControlLabel
            control={
              <Controller
                name="conferenceEnabled"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
            }
            label="Enable video conference"
          />
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

export default CreateSessionModal;

import React, { useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Box,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  MenuItem,
} from '@mui/material';
import { useForm, SubmitHandler } from 'react-hook-form';
//import { createTask, getCategories } from '../../services/taskService';

export interface FormInputs {
  title: string;
  description: string;
  category: string;
}

const FormScreen: React.FC = () => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<FormInputs>();

  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const navigate = (path: string) => {
    window.location.href = path;
  };

  const onSubmit: SubmitHandler<FormInputs> = async (data) => {
    setLoading(true);
    try {
      //const result = await createTask(data);
      reset();
      setSnackbar({ open: true, message: 'Zlecenie zostało zapisane!', severity: 'success' });
      setTimeout(() => navigate('/success'), 1000);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error.response?.data?.error || 'Wystąpił błąd przy zapisie.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
       //const cat = await getCategories();
        //setCategories(cat);
      } catch (err) {
        setSnackbar({ open: true, message: 'Nie udało się pobrać kategorii.', severity: 'error' });
      }
    };
    fetchCategories();
  }, []);

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        maxWidth: 600,
        mx: 'auto',
        mt: 4,
        p: 3,
        border: '1px solid #ccc',
        borderRadius: 2,
        boxShadow: 1,
      }}
    >
      <Typography variant="h5" component="h1" gutterBottom>
        Dodaj nowe zlecenie
      </Typography>

      <TextField
        label="Tytuł"
        fullWidth
        margin="normal"
        variant="outlined"
        {...register('title', { required: 'Tytuł jest wymagany' })}
        error={!!errors.title}
        helperText={errors.title?.message}
      />

      <TextField
        label="Opis"
        fullWidth
        margin="normal"
        variant="outlined"
        multiline
        rows={4}
        {...register('description', { required: 'Opis jest wymagany' })}
        error={!!errors.description}
        helperText={errors.description?.message}
      />

      <TextField
        select
        label="Kategoria"
        fullWidth
        margin="normal"
        variant="outlined"
        defaultValue=""
        {...register('category', { required: 'Kategoria jest wymagana' })}
        error={!!errors.category}
        helperText={errors.category?.message}
      >
        {categories.map((cat) => (
          <MenuItem key={cat} value={cat}>
            {cat}
          </MenuItem>
        ))}
      </TextField>

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? <CircularProgress size={24} /> : 'Zapisz'}
        </Button>
        <Button
          variant="outlined"
          color="secondary"
          onClick={() => navigate('/home')}
        >
          Wróć do menu
        </Button>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FormScreen;

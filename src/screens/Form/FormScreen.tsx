import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { TextField, Button, Box, Typography } from '@mui/material';

interface FormInputs {
  title: string;
  description: string;
  category: string;
}

const FormScreen: React.FC = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>();

  const navigate = (path: string) => {
    window.location.href = path;
  };

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    console.log('Dane formularza:', data);
    navigate('/success');
  };

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
        label="Kategoria"
        fullWidth
        margin="normal"
        variant="outlined"
        {...register('category', { required: 'Kategoria jest wymagana' })}
        error={!!errors.category}
        helperText={errors.category?.message}
      />

      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }}>
        Zapisz
      </Button>
    </Box>
  );
};

export default FormScreen;

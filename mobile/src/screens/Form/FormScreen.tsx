import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { TextInput, Button, Snackbar, ActivityIndicator, HelperText, Text, Menu, Divider } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
export interface FormInputs {
  title: string;
  description: string;
  category: string;
}

const FormScreen: React.FC = () => {
  const navigation = useNavigation();
  const { control, handleSubmit, reset, formState: { errors }, setValue } = useForm<FormInputs>();
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const [menuVisible, setMenuVisible] = useState(false);

  const navigate = (path: string) => {
    setSnackbar({ open: true, message: `Nawigacja do ${path}`, severity: 'success' });
  };

  const onSubmit = async (data: FormInputs) => {
    setLoading(true);
    try {
      // await createTask(data);
      reset();
      setSnackbar({ open: true, message: 'Zlecenie zostało zapisane!', severity: 'success' });
      setTimeout(() => navigate('success'), 1000);
    } catch (error: any) {
      setSnackbar({
        open: true,
        message: error?.response?.data?.error || 'Wystąpił błąd przy zapisie.',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // const cat = await getCategories();
        // setCategories(cat);
        setCategories(['Sprzątanie', 'Zakupy', 'Opieka', 'Transport']); 
      } catch (err) {
        setSnackbar({ open: true, message: 'Nie udało się pobrać kategorii.', severity: 'error' });
      }
    };
    fetchCategories();
  }, []);

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} style={styles.container}>
      <Text variant="headlineMedium" style={{ marginBottom: 24 }}>Dodaj nowe zlecenie</Text>
      
      <Controller
        control={control}
        name="title"
        rules={{ required: 'Tytuł jest wymagany' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              label="Tytuł"
              mode="outlined"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={!!errors.title}
              style={styles.input}
            />
            <HelperText type="error" visible={!!errors.title}>
              {errors.title?.message}
            </HelperText>
          </>
        )}
      />

      <Controller
        control={control}
        name="description"
        rules={{ required: 'Opis jest wymagany' }}
        render={({ field: { onChange, onBlur, value } }) => (
          <>
            <TextInput
              label="Opis"
              mode="outlined"
              value={value}
              onBlur={onBlur}
              onChangeText={onChange}
              error={!!errors.description}
              style={styles.input}
              multiline
              numberOfLines={4}
            />
            <HelperText type="error" visible={!!errors.description}>
              {errors.description?.message}
            </HelperText>
          </>
        )}
      />

      <Controller
        control={control}
        name="category"
        rules={{ required: 'Kategoria jest wymagana' }}
        render={({ field: { value, onChange } }) => (
          <>
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TextInput
                  label="Kategoria"
                  mode="outlined"
                  value={value}
                  style={styles.input}
                  onFocus={() => setMenuVisible(true)}
                  showSoftInputOnFocus={false}
                  right={<TextInput.Icon icon="menu-down" onPress={() => setMenuVisible(true)} />}
                  error={!!errors.category}
                  editable={false}
                />
              }
            >
              {categories.map((cat) => (
                <Menu.Item
                  key={cat}
                  title={cat}
                  onPress={() => {
                    onChange(cat);
                    setMenuVisible(false);
                  }}
                />
              ))}
              <Divider />
            </Menu>
            <HelperText type="error" visible={!!errors.category}>
              {errors.category?.message}
            </HelperText>
          </>
        )}
      />

      <View style={styles.buttonRow}>
        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          disabled={loading}
          style={{ flex: 1, marginRight: 8 }}
          icon={loading ? 'progress-clock' : undefined}
        >
          {loading ? <ActivityIndicator size={18} /> : 'Zapisz'}
        </Button>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={{ flex: 1 }}
        >
          Wróć do menu
        </Button>
      </View>

      <Snackbar
        visible={snackbar.open}
        onDismiss={() => setSnackbar((s) => ({ ...s, open: false }))}
        duration={3000}
        style={{
          backgroundColor: snackbar.severity === 'success' ? '#4caf50' : '#d32f2f'
        }}
      >
        {snackbar.message}
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 56,
    backgroundColor: '#fff',
    borderRadius: 14,
    elevation: 3, 
    shadowColor: '#000', 
    shadowOpacity: 0.08,
    shadowRadius: 8,
    flex:1,
    shadowOffset: { width: 0, height: 2 },
  },
  input: {
    marginBottom: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 24,
    marginBottom: 8,
  },
});


export default FormScreen;

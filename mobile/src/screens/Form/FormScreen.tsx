// === src/screens/Form/FormScreen.tsx ===
import React, { useEffect, useState } from 'react';
import {
  View, StyleSheet, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import {
  TextInput, Button, Snackbar, ActivityIndicator,
  HelperText, Text, Menu, Divider, SegmentedButtons,
} from 'react-native-paper';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useForm, Controller } from 'react-hook-form';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import { createTask } from '../../utils/api';
import { useError } from '../Feedback/ErrorContext';

/* GuardHire palette */
const COLORS = {
  primary: '#1E88E5',
  background: '#EEF2F6',
  card: '#FFFFFF',
  success: '#2E7D32',
  error: '#D32F2F',
};

export interface FormInputs {
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  dueDate: Date | null;
}

const priorityChoices = [
  { value: 'low', label: 'Niski' },
  { value: 'medium', label: 'Średni' },
  { value: 'high', label: 'Wysoki' },
];

const FormScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { setError } = useError();

  const { control, handleSubmit, reset, formState: { errors } } =
    useForm<FormInputs>({
      defaultValues: {
        title: '', description: '', category: '',
        priority: 'medium', dueDate: null,
      },
    });

  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [menuVisible, setMenuVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  /* ---------- submit ---------- */
  const onSubmit = async (data: FormInputs) => {
    setLoading(true);
    try {
      await createTask({ ...data, dueDate: data.dueDate ? data.dueDate.toISOString() : null });
      reset();
      setSnackbar({ open: true, message: 'Zlecenie zostało zapisane!', severity: 'success' });
      setTimeout(() => navigation.navigate('Success'), 600);
    } catch (e: any) {
      setError(e?.message || 'Wystąpił błąd przy zapisie.');
      setSnackbar({ open: true, message: 'Wystąpił błąd przy zapisie.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /* ---------- kategorie (mock) ---------- */
  useEffect(() => setCategories(['Sprzątanie', 'Zakupy', 'Opieka', 'Transport']), []);

  /* ---------- UI ---------- */
  return (
    <View style={[styles.root, { backgroundColor: COLORS.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={[styles.card, { backgroundColor: COLORS.card }]}>
          <Text variant="headlineMedium" style={styles.title}>Dodaj nowe zlecenie</Text>

          {/* ------- Tytuł ------- */}
          <Controller
            control={control} name="title"
            rules={{ required: 'Tytuł jest wymagany' }}
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  label="Tytuł" mode="outlined" value={value}
                  onChangeText={onChange} error={!!errors.title}
                  style={styles.input} theme={{ colors: { primary: COLORS.primary } }}
                />
                <HelperText type="error" visible={!!errors.title}>{errors.title?.message}</HelperText>
              </>
            )}
          />

          {/* ------- Opis ------- */}
          <Controller
            control={control} name="description"
            rules={{ required: 'Opis jest wymagany' }}
            render={({ field: { onChange, value } }) => (
              <>
                <TextInput
                  label="Opis" mode="outlined" value={value}
                  onChangeText={onChange} error={!!errors.description}
                  style={[styles.input, { height: 120 }]} multiline
                  theme={{ colors: { primary: COLORS.primary } }}
                />
                <HelperText type="error" visible={!!errors.description}>{errors.description?.message}</HelperText>
              </>
            )}
          />

          {/* ------- Kategoria ------- */}
          <Controller
            control={control} name="category"
            rules={{ required: 'Kategoria jest wymagana' }}
            render={({ field: { value, onChange } }) => (
              <>
                <Menu
                  visible={menuVisible}
                  onDismiss={() => setMenuVisible(false)}
                  anchor={
                    <TextInput
                      label="Kategoria" mode="outlined" value={value}
                      style={styles.input} editable={false}
                      right={<TextInput.Icon icon="menu-down" onPress={() => setMenuVisible(true)} />}
                      onFocus={() => setMenuVisible(true)}
                      error={!!errors.category}
                      theme={{ colors: { primary: COLORS.primary } }}
                    />
                  }
                >
                  {categories.map((c) => (
                    <Menu.Item key={c} title={c} onPress={() => { onChange(c); setMenuVisible(false); }} />
                  ))}
                  <Divider />
                </Menu>
                <HelperText type="error" visible={!!errors.category}>{errors.category?.message}</HelperText>
              </>
            )}
          />

          {/* ------- Priorytet ------- */}
          <Controller
            control={control} name="priority"
            rules={{ required: true }}
            render={({ field: { value, onChange } }) => (
              <SegmentedButtons
                value={value} onValueChange={onChange}
                buttons={priorityChoices} style={styles.priority}
                theme={{ colors: { primary: COLORS.primary } }}
              />
            )}
          />
          <HelperText type="error" visible={!!errors.priority}>
            {errors.priority ? 'Wybierz priorytet' : ''}
          </HelperText>

          {/* ------- Termin ------- */}
          <Controller
            control={control} name="dueDate"
            rules={{ required: 'Data jest wymagana' }}
            render={({ field: { value, onChange } }) => (
              <>
                <TextInput
                  label="Termin wykonania" mode="outlined"
                  value={value ? value.toLocaleString() : ''}
                  style={styles.input} editable={false}
                  right={<TextInput.Icon icon="calendar" onPress={() => setShowDatePicker(true)} />}
                  error={!!errors.dueDate}
                  theme={{ colors: { primary: COLORS.primary } }}
                />
                {showDatePicker && (
                  <DateTimePicker
                    value={value || new Date()}
                    onChange={(_, date) => { setShowDatePicker(false); if (date) onChange(date); }}
                    display="default" minimumDate={new Date()}
                  />
                )}
                <HelperText type="error" visible={!!errors.dueDate}>{errors.dueDate?.message}</HelperText>
              </>
            )}
          />

          {/* ------- Przyciski ------- */}
          <View style={styles.buttonRow}>
            <Button
              mode="contained" buttonColor={COLORS.primary}
              onPress={handleSubmit(onSubmit)} disabled={loading}
              style={{ flex: 1, marginRight: 8 }}
            >
              {loading ? <ActivityIndicator size={18} /> : 'Zapisz'}
            </Button>
            <Button
              mode="outlined" textColor={COLORS.primary}
              style={{ flex: 1, borderColor: COLORS.primary }}
              onPress={() => navigation.goBack()}
            >
              Wróć do menu
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Snackbar
        visible={snackbar.open}
        onDismiss={() => setSnackbar((s) => ({ ...s, open: false }))}
        duration={3000}
        style={{ backgroundColor: snackbar.severity === 'success' ? COLORS.success : COLORS.error }}
      >
        {snackbar.message}
      </Snackbar>
    </View>
  );
};

export default FormScreen;

const styles = StyleSheet.create({
  root: { flex: 1 },
  card: {
    borderRadius: 20, margin: 16, padding: 24,
    elevation: 4, shadowColor: '#000', shadowOpacity: 0.08,
    shadowRadius: 8, shadowOffset: { width: 0, height: 2 },
  },
  title: { marginBottom: 24 },
  input: { marginBottom: 12 },
  priority: { marginTop: 4, marginBottom: 16 },
  buttonRow: { flexDirection: 'row', marginTop: 32 },
});

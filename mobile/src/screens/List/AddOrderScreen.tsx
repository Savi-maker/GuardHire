import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';


const AddOrderScreen: React.FC = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
const [date, setDate] = useState(new Date());
const [showDatePicker, setShowDatePicker] = useState(false);
const [showTimePicker, setShowTimePicker] = useState(false);
const [amount, setAmount] = useState('');

const formatDate = (d: Date) => {
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${minutes}`;
};

  const handleSubmit = async () => {
  if (!name || !amount) {
    Alert.alert('Błąd', 'Uzupełnij wszystkie pola');
    return;
  }

  try {
    const response = await fetch('http://192.168.0.19:3000/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, status: 'nowe', date: date.toISOString() }),
    });

    if (!response.ok) throw new Error('Błąd serwera');
    const order = await response.json(); 
console.log(' ID ZLECENIA', order?.id);
console.log('KWOTA', amount, '→', parseInt(amount));
    const paymentRes = await fetch('http://192.168.0.19:3000/payment/manual-create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: order.id,
        amount: parseInt(amount),
      }),
    });

  if (!paymentRes.ok) {
  const errText = await paymentRes.text();
  console.error('BŁĄD PŁATNOŚCI', paymentRes.status, errText);
  throw new Error('Błąd tworzenia płatności');
}


    Alert.alert('Sukces', 'Zlecenie i wpłata zostały dodane!');
    navigation.goBack();

  } catch (err) {
    console.error(err);
    Alert.alert('Błąd', 'Nie udało się dodać danych');
  }
};

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Nazwa</Text>
      <TextInput style={styles.input} value={name} onChangeText={setName} />
      <Text style={styles.label}>Status</Text>
      <TextInput style={styles.input} value="nowe" editable={false} />
      <Text style={styles.label}>Kwota (PLN)</Text>
<TextInput style={styles.input} value={amount} onChangeText={setAmount} keyboardType="numeric"/>
   <Text style={styles.label}>Data i godzina</Text>
<TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
  <Text>{formatDate(date)}</Text>
</TouchableOpacity>

{showDatePicker && (
  <DateTimePicker
    value={date}
    mode="date"
    display="default"
    onChange={(event: DateTimePickerEvent, selectedDate?: Date) => {
      setShowDatePicker(false);
      if (selectedDate) {
        const updatedDate = new Date(date);
        updatedDate.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
        setDate(updatedDate);
        setShowTimePicker(true);
      }
    }}
  />
)}

{showTimePicker && (
  <DateTimePicker
    value={date}
    mode="time"
    display="default"
    is24Hour={true}
    onChange={(event: DateTimePickerEvent, selectedTime?: Date) => {
      setShowTimePicker(false);
      if (selectedTime) {
        const updatedDate = new Date(date);
        updatedDate.setHours(selectedTime.getHours(), selectedTime.getMinutes());
        setDate(updatedDate);
      }
    }}
  />
)}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Dodaj Zlecenie</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddOrderScreen;

const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { marginTop: 10 },
  input: { borderWidth: 1, padding: 8, marginTop: 4, borderRadius: 5 },
  button: {
    marginTop: 20,
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
  },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },
});

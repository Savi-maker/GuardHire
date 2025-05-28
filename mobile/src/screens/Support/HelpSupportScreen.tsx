import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../ThemeContext/ThemeContext';

const faqData = [
  { id: 'q1', question: 'Jak zresetować hasło?', answer: 'Przejdź do ekranu logowania i kliknij „Resetuj hasło”.' },
  { id: 'q2', question: 'Jak zmienić dane kontaktowe?', answer: 'Wejdź w profil i wybierz „Edytuj profil”.' },
  { id: 'q3', question: 'Dlaczego nie mogę się zalogować?', answer: 'Sprawdź połączenie internetowe lub poprawność danych.' },
  { id: 'q4', question: 'Jak zaakceptować zlecenie?', answer: 'Wejdź w zakładkę „Zlecenia”, wybierz i kliknij „Zaakceptuj”.' },
  { id: 'q5', question: 'Gdzie znajdę historię zleceń?', answer: 'W zakładce „Historia” znajdziesz zakończone zlecenia.' },
  { id: 'q6', question: 'Nie dostaję powiadomień – co zrobić?', answer: 'Sprawdź ustawienia powiadomień w telefonie i aplikacji.' },
];

const guides = [
  {
    id: 'g1',
    title: 'Jak rozpocząć pracę z aplikacją',
    content: 'Zaloguj się, przejdź do Zleceń i zaakceptuj pierwsze zadanie. Zgłaszaj obecność i zakończ zlecenie po wykonaniu.',
  },
  {
    id: 'g2',
    title: 'Instrukcja zmiany hasła',
    content: 'Wejdź do swojego profilu, kliknij „Edytuj profil”, a następnie „Zmień hasło”.',
  },
  {
    id: 'g3',
    title: 'Poradnik dla nowych ochroniarzy',
    content: 'Pamiętaj o noszeniu identyfikatora, terminowym zgłaszaniu obecności oraz stosowaniu się do zasad bezpieczeństwa.',
  },
  {
    id: 'g4',
    title: 'Jak przesłać raport lub zgłoszenie',
    content: 'Z poziomu zlecenia kliknij „Raport” i uzupełnij formularz. Możesz też wysłać zgłoszenie w sekcji „Kontakt”.',
  },
  {
    id: 'g5',
    title: 'Jak zgłosić problem techniczny',
    content: 'Napisz do nas na support@guardhire.pl i dołącz screen oraz krótki opis błędu.',
  },
];

const HelpSupportScreen: React.FC = () => {
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const backgroundColor = isDarkMode ? '#121212' : '#ffffff';
  const textColor = isDarkMode ? '#ffffff' : '#000000';
  const cardColor = isDarkMode ? '#1e1e1e' : '#f2f2f2';

  const [expandedFaqId, setExpandedFaqId] = useState<string | null>(null);
  const [expandedGuideId, setExpandedGuideId] = useState<string | null>(null);

  const toggleFaq = (id: string) => {
    setExpandedFaqId(prev => (prev === id ? null : id));
  };

  const toggleGuide = (id: string) => {
    setExpandedGuideId(prev => (prev === id ? null : id));
  };

  const handleContactPress = () => {
    Linking.openURL('mailto:support@guardhire.pl?subject=Pomoc%20z%20aplikacją');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: 30 }]}>
        <Text style={[styles.header, { color: textColor }]}>Pomoc i wsparcie</Text>

        {/* FAQ */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Najczęściej zadawane pytania</Text>
          {faqData.map((item) => (
            <View key={item.id}>
              <TouchableOpacity
                style={[styles.faqItem, { backgroundColor: cardColor }]}
                onPress={() => toggleFaq(item.id)}
              >
                <Text style={[styles.faqQuestion, { color: textColor }]}>{item.question}</Text>
              </TouchableOpacity>
              {expandedFaqId === item.id && (
                <Text style={[styles.faqAnswer, { color: textColor }]}>{item.answer}</Text>
              )}
            </View>
          ))}
        </View>

        {/* Kontakt */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Kontakt z obsługą</Text>
          <Text style={[styles.contactText, { color: textColor }]}>📧 support@guardhire.pl</Text>
          <Text style={[styles.contactText, { color: textColor }]}>📞 +48 123 456 789</Text>

          <TouchableOpacity onPress={handleContactPress} style={[styles.contactButton, { backgroundColor: cardColor }]}>
            <Text style={[styles.contactButtonText, { color: textColor }]}>✉️ Napisz do nas</Text>
          </TouchableOpacity>
        </View>

        {/* Przewodniki */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Przewodniki i instrukcje</Text>
          {guides.map((item) => (
            <View key={item.id}>
              <TouchableOpacity
                style={[styles.faqItem, { backgroundColor: cardColor }]}
                onPress={() => toggleGuide(item.id)}
              >
                <Text style={[styles.faqQuestion, { color: textColor }]}>{item.title}</Text>
              </TouchableOpacity>
              {expandedGuideId === item.id && (
                <Text style={[styles.faqAnswer, { color: textColor }]}>{item.content}</Text>
              )}
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HelpSupportScreen;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flexGrow: 1,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 10,
  },
  faqItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  faqQuestion: {
    fontSize: 16,
  },
  faqAnswer: {
    fontSize: 14,
    marginLeft: 10,
    marginBottom: 10,
  },
  contactText: {
    fontSize: 16,
    marginBottom: 5,
  },
  contactButton: {
    paddingVertical: 10,
    marginTop: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

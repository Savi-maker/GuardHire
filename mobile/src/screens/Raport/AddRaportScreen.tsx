import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Audio } from "expo-av";
import { addRaport, getOrders, getMyProfile } from "../../utils/api";
import { useTheme } from "../ThemeContext/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";

type Order = { id: number; name: string };

export default function AddRaportScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();

  const [description, setDescription] = useState("");
  const [photoUri, setPhotoUri] = useState<string | undefined>();
  const [audioUri, setAudioUri] = useState<string | undefined>();
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [guardId, setGuardId] = useState<number | undefined>();

  const bgColor = theme === "dark" ? "#181a20" : "#fff";
  const cardColor = theme === "dark" ? "#22242a" : "#f8f8f8";
  const textColor = theme === "dark" ? "#f2f2f2" : "#181818";
  const primaryBtn = "#1976d2";

  useEffect(() => {
    getOrders()
      .then((data) => setOrders(data))
      .catch(() => Alert.alert("Błąd pobierania zleceń"));
    getMyProfile()
      .then((profile) => setGuardId(profile.id))
      .catch(() => Alert.alert("Błąd pobierania profilu"));
  }, []);

  const handlePickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handlePickPhotoCamera = async () => {
    const { granted } = await ImagePicker.requestCameraPermissionsAsync();
    if (!granted) {
      Alert.alert("Brak uprawnień", "Musisz wyrazić zgodę na użycie aparatu.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]?.uri) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
      setIsRecording(true);
    } catch {
      Alert.alert("Błąd", "Nie można rozpocząć nagrywania.");
    }
  };

  const stopRecording = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setAudioUri(uri || undefined);
      setRecording(null);
      setIsRecording(false);
    }
  };

  const handleSend = async () => {
    if (!description && !photoUri && !audioUri) {
      Alert.alert("Wypełnij opis lub dodaj plik!");
      return;
    }
    if (!selectedOrder) {
      Alert.alert("Wybierz zlecenie!");
      return;
    }
    if (!guardId) {
      Alert.alert("Brak ID użytkownika (ochroniarza)!");
      return;
    }
    setLoading(true);
    try {
      await addRaport({
        orderId: selectedOrder.id,
        guardId,
        description,
        photoUri,
        audioUri,
      });
      Alert.alert("Sukces", "Raport został dodany!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert("Błąd", err?.message || "Wysyłanie nie powiodło się.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ fontSize: 20, color: textColor, marginBottom: 12 }}>
            Dodaj raport
          </Text>

          <Text style={{ color: textColor, marginBottom: 8, fontWeight: "bold" }}>
            Wybierz zlecenie
          </Text>
          <FlatList
            data={orders}
            keyExtractor={(item) => item.id.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={{
                  padding: 10,
                  borderRadius: 8,
                  backgroundColor:
                    selectedOrder?.id === item.id ? primaryBtn : "#eee",
                  marginRight: 8,
                  marginBottom: 10,
                }}
                onPress={() => setSelectedOrder(item)}
              >
                <Text
                  style={{
                    color: selectedOrder?.id === item.id ? "#fff" : "#333",
                    fontWeight: "600",
                  }}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            )}
          />

          <Text style={{ color: textColor, marginTop: 10 }}>Opis:</Text>
          <TextInput
            placeholder="Opis raportu"
            value={description}
            onChangeText={setDescription}
            style={{
              backgroundColor: theme === "dark" ? "#262a33" : "#f4f4f4",
              color: textColor,
              borderRadius: 7,
              padding: 9,
              marginBottom: 13,
              marginTop: 3,
              minHeight: 60,
            }}
            placeholderTextColor={theme === "dark" ? "#888" : "#888"}
            multiline
          />

          <Text style={{ color: textColor, marginTop: 5, marginBottom: 4 }}>
            Zdjęcie:
          </Text>
          <View style={{ alignItems: "center", marginVertical: 16 }}>
            {photoUri ? (
              <Image
                source={{ uri: photoUri }}
                style={{
                  width: 180,
                  height: 130,
                  borderRadius: 12,
                  marginBottom: 10,
                }}
              />
            ) : (
              <View
                style={{
                  width: 180,
                  height: 130,
                  borderRadius: 12,
                  marginBottom: 10,
                  backgroundColor: "#ececec",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#bbb" }}>Brak zdjęcia</Text>
              </View>
            )}
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity
                onPress={handlePickPhoto}
                style={{
                  backgroundColor: primaryBtn,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 8,
                  marginRight: 8,
                }}
              >
                <Text style={{ color: "#fff" }}>Wybierz z galerii</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePickPhotoCamera}
                style={{
                  backgroundColor: "#1976d2",
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#fff" }}>Zrób zdjęcie</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={{ color: textColor, marginBottom: 5 }}>
            Notatka głosowa:
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 15 }}>
            <TouchableOpacity
              onPress={isRecording ? stopRecording : startRecording}
              style={{
                backgroundColor: isRecording ? "#c62828" : primaryBtn,
                padding: 10,
                borderRadius: 6,
                marginRight: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>
                {isRecording ? "Zakończ nagrywanie" : "Nagraj notatkę audio"}
              </Text>
            </TouchableOpacity>
            {audioUri && (
              <Text style={{ color: textColor }}>Plik audio nagrany</Text>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSend}
            style={{
              backgroundColor: primaryBtn,
              padding: 15,
              borderRadius: 8,
              alignItems: "center",
              marginTop: 8,
              opacity: loading ? 0.6 : 1,
            }}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 17 }}>
                Wyślij raport
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

import React, { useEffect, useState, useRef } from "react";
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import { Audio } from "expo-av";
import { useNavigation } from "@react-navigation/native";
import { getAllRaports, Raport, API_URL } from "../../utils/api";
import { useTheme } from "../ThemeContext/ThemeContext";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AllRaportScreen() {
  const navigation = useNavigation();
  const [raports, setRaports] = useState<Raport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const soundRef = useRef<Audio.Sound | null>(null);
  const { theme } = useTheme();

  const bgColor = theme === "dark" ? "#181a20" : "#fff";
  const cardColor = theme === "dark" ? "#22242a" : "#f8f8f8";
  const textColor = theme === "dark" ? "#f2f2f2" : "#181818";
  const primaryBtn = "#1976d2";

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      getAllRaports()
        .then(data => setRaports(data))
        .catch(e => console.error(e))
        .finally(() => setLoading(false));
    };
    fetchData();
    const unsubscribe = navigation.addListener('focus', fetchData);
    return () => {
      unsubscribe();
      if (soundRef.current) {
        soundRef.current.unloadAsync();
      }
    };
  }, [navigation]);

  const playAudio = async (audioUrl?: string) => {
    if (!audioUrl) return;
    try {
      if (isPlaying && soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync();
        setIsPlaying(false);
      }
      let url = audioUrl;
      if (!audioUrl.startsWith("http")) {
        url = `${API_URL}/uploads/${audioUrl.replace(/\\/g, "/").replace(/^\/+/, "")}`;
      }
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      soundRef.current = sound;
      setIsPlaying(true);
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate(async (status) => {
        if (!status.isLoaded || status.didJustFinish) {
          setIsPlaying(false);
          await sound.unloadAsync();
        }
      });
    } catch {
      setIsPlaying(false);
      alert("Błąd odtwarzania audio");
    }
  };

  if (loading)
    return <ActivityIndicator size="large" style={{ marginTop: 40 }} color={primaryBtn} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: bgColor, padding: 16 }}>
      <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 14, color: textColor }}>
        Wszystkie raporty
      </Text>
      <Text style={{ color: 'orange', marginBottom: 8 }}>Liczba raportów: {raports.length}</Text>
      {raports.length === 0 ? (
        <Text style={{ color: textColor }}>Brak raportów.</Text>
      ) : (
        <FlatList
          data={raports}
          keyExtractor={item => item.id.toString()}
          renderItem={({ item }) => (
            <View
              style={{
                backgroundColor: cardColor,
                borderRadius: 8,
                padding: 12,
                marginBottom: 12
              }}
            >
              <Text style={{ fontWeight: "bold", color: textColor }}>
                Zlecenie #{item.orderId} | Ochroniarz #{item.guardId}
              </Text>
              <Text style={{ fontWeight: "bold", color: textColor }}>
                Data: {item.createdAt?.split("T")[0]}
              </Text>
              <Text style={{ color: textColor }}>
                Opis: {item.description || "Brak opisu"}
              </Text>
              {item.photo ? (
                <Image
                  source={{
                    uri: `${API_URL}/uploads/${item.photo.replace(/\\/g, "/").replace(/^\/+/, "")}`
                  }}
                  style={{
                    width: "100%",
                    height: 140,
                    borderRadius: 8,
                    marginTop: 7
                  }}
                  resizeMode="cover"
                />
              ) : (
                <View
                  style={{
                    width: "100%",
                    height: 140,
                    borderRadius: 8,
                    marginTop: 7,
                    backgroundColor: "#ececec",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ color: "#bbb" }}>Brak zdjęcia</Text>
                </View>
              )}
              {item.audioNote &&
                typeof item.audioNote === "string" &&
                item.audioNote.length > 0 && (
                  <TouchableOpacity
                    onPress={() => playAudio(item.audioNote)}
                    style={{
                      marginTop: 10,
                      backgroundColor: primaryBtn,
                      padding: 9,
                      borderRadius: 6,
                      alignSelf: "flex-start"
                    }}
                  >
                    <Text style={{ color: "#fff" }}>
                      {isPlaying ? "⏸️ Odtwarzanie..." : "▶️ Odtwórz notatkę audio"}
                    </Text>
                  </TouchableOpacity>
                )}
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

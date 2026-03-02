import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();
  const [ip, setIp] = useState('');

  useEffect(() => {
    // Pobierz zapisane IP przy starcie
    const loadIp = async () => {
      try {
        const savedIp = await AsyncStorage.getItem('serverIP');
        if (savedIp) setIp(savedIp);
      } catch (error) {
        console.log('Błąd przy wczytywaniu IP:', error);
      }
    };
    loadIp();
  }, []);

  const saveIp = async () => {
    try {
      await AsyncStorage.setItem('serverIP', ip); // zapis do pamięci
      console.log('Nowe IP zapisane:', ip);
      router.back();
    } catch (error) {
      console.log('Błąd przy zapisie IP:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Podaj IP serwera:</Text>
      <TextInput
        style={styles.input}
        placeholder="192.168.x.x"
        value={ip}
        onChangeText={setIp}
      />
      <Button title="Zapisz" onPress={saveIp} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
});


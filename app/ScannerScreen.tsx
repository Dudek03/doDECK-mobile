import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

export default function ScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const router = useRouter();

    if (!permission) return <View />;
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Aplikacja potrzebuje dostępu do aparatu.</Text>
                <Button onPress={requestPermission} title="Przyznaj uprawnienia" />
            </View>
        );
    }

    const handleBarCodeScanned = async ({ data }) => {
        if (scanned) return;
        setScanned(true);

        try {
            const pairingData = JSON.parse(data);
            if (pairingData.ip && pairingData.secret) {
                await AsyncStorage.setItem('serverIP', pairingData.ip);
                await AsyncStorage.setItem('SECRET_KEY', pairingData.secret);
                alert('Sparowano pomyślnie! Łączenie z serwerem...');
                router.back(); // Powrót do głównego ekranu
            } else {
                alert('Nieprawidłowy kod QR.');
                setTimeout(() => setScanned(false), 2000);
            }
        } catch (e) {
            alert('Błąd odczytu kodu QR.');
            setTimeout(() => setScanned(false), 2000);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            />
            <View style={styles.overlay}>
                <Text style={styles.overlayText}>Zeskanuj kod QR z Web Edytora</Text>
                <Button title="Anuluj" color="#e74c3c" onPress={() => router.back()} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', backgroundColor: '#000' },
    text: { color: '#fff', textAlign: 'center', marginBottom: 20 },
    overlay: { position: 'absolute', bottom: 50, left: 0, right: 0, alignItems: 'center', padding: 20 },
    overlayText: { color: '#fff', fontSize: 18, marginBottom: 20, fontWeight: 'bold' }
});

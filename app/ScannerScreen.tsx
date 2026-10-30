import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const BARCODE_SETTINGS = { barcodeTypes: ['qr' as const] };

export default function ScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const router = useRouter();

    if (!permission) return <View style={styles.container} />;
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Aplikacja potrzebuje dostępu do aparatu, aby zeskanować kod QR.</Text>
                <View style={styles.permissionButtons}>
                    <Button onPress={requestPermission} title="Przyznaj uprawnienia" color="#2ecc71" />
                    <View style={{ width: 20, height: 12 }} />
                    <Button onPress={() => router.back()} title="Anuluj" color="#e74c3c" />
                </View>
            </View>
        );
    }

    const parseQrData = (rawData: any) => {
        if (!rawData || typeof rawData !== 'string') return null;
        const trimmed = rawData.trim();

        // 1. Format JSON (domyślny z "Aplikacja mobilna"): {"ip":"...","port":5000,"secret":"..."}
        try {
            const parsed = JSON.parse(trimmed);
            if (parsed && parsed.ip && parsed.secret) {
                return { ip: String(parsed.ip).trim(), secret: String(parsed.secret).trim() };
            }
        } catch (_) {}

        // 2. Format URL (np. gdy użytkownik zeskanuje kod z prawej strony "Przeglądarka"):
        // http://192.168.1.100:5000/?secret=...
        try {
            const urlMatch = trimmed.match(/^https?:\/\/([^:/]+)(?::\d+)?\/?[^?]*\?.*secret=([a-fA-F0-9]+)/);
            if (urlMatch) {
                return { ip: urlMatch[1].trim(), secret: urlMatch[2].trim() };
            }
            if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
                const url = new URL(trimmed);
                const secret = url.searchParams.get('secret');
                if (url.hostname && secret) {
                    return { ip: url.hostname.trim(), secret: secret.trim() };
                }
            }
        } catch (_) {}

        return null;
    };

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);

        const parsed = parseQrData(data);
        if (parsed && parsed.ip && parsed.secret) {
            try {
                await AsyncStorage.setItem('serverIP', parsed.ip);
                await AsyncStorage.setItem('SECRET_KEY', parsed.secret);
                alert(`Sparowano pomyślnie z PC!\nIP: ${parsed.ip}`);
                router.back();
            } catch (error) {
                alert('Błąd podczas zapisywania danych autoryzacji.');
                setTimeout(() => setScanned(false), 2000);
            }
        } else {
            alert('Nieprawidłowy kod QR. Upewnij się, że skanujesz kod parowania doDECK z PC.');
            setTimeout(() => setScanned(false), 2000);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={BARCODE_SETTINGS}
            />

            {/* Ramka celownika (viewfinder) na środku */}
            <View style={styles.viewfinderContainer} pointerEvents="none">
                <View style={styles.viewfinder}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                </View>
            </View>

            {/* Pasek nawigacyjny na dole */}
            <View style={styles.overlay}>
                <Text style={styles.overlayText}>Skieruj aparat na kod QR z okna parowania PC</Text>
                <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                    <Text style={styles.cancelButtonText}>✕ Anuluj</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' },
    text: { color: '#fff', textAlign: 'center', marginBottom: 20, fontSize: 16, paddingHorizontal: 30 },
    permissionButtons: { flexDirection: 'row', alignItems: 'center' },
    viewfinderContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    viewfinder: {
        width: 220,
        height: 220,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 30,
        height: 30,
        borderColor: '#2ecc71',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
    },
    overlay: {
        position: 'absolute',
        bottom: 25,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    overlayText: {
        color: '#fff',
        fontSize: 15,
        marginBottom: 12,
        fontWeight: 'bold',
        backgroundColor: 'rgba(0,0,0,0.65)',
        paddingVertical: 6,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    cancelButton: {
        backgroundColor: '#e74c3c',
        paddingVertical: 8,
        paddingHorizontal: 24,
        borderRadius: 8,
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 15,
    },
});

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import type { ParsedQrData } from './types';

const BARCODE_SETTINGS = { barcodeTypes: ['qr' as const] };

export const parseQrData = (rawData: any): ParsedQrData | null => {
    if (!rawData || typeof rawData !== 'string') return null;
    const trimmed = rawData.trim();

    // 1. JSON format: {"ip":"...","port":5000,"secret":"..."}
    try {
        const parsed = JSON.parse(trimmed);
        if (parsed && parsed.ip && parsed.secret) {
            return { ip: String(parsed.ip).trim(), secret: String(parsed.secret).trim() };
        }
    } catch (_) {}

    // 2. URL format: http://192.168.1.100:5000/#secret=... or ?secret=...
    try {
        const urlMatch = trimmed.match(/^https?:\/\/([^:/]+)(?::\d+)?\/?[^?#]*[?#].*secret=([a-fA-F0-9]+)/);
        if (urlMatch) {
            return { ip: urlMatch[1].trim(), secret: urlMatch[2].trim() };
        }
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            const url = new URL(trimmed);
            const hashParams = new URLSearchParams(url.hash.replace(/^#/, ''));
            const secret = hashParams.get('secret') || url.searchParams.get('secret');
            if (url.hostname && secret) {
                return { ip: url.hostname.trim(), secret: secret.trim() };
            }
        }
    } catch (_) {}

    // 3. Compact scheme format: dodeck://192.168.1.100#secret
    try {
        if (trimmed.startsWith('dodeck://')) {
            const rest = trimmed.replace('dodeck://', '');
            if (rest.includes('#')) {
                const [ipPart, sec] = rest.split('#');
                const ip = ipPart.split(':')[0].trim();
                if (ip && sec) return { ip, secret: sec.trim() };
            }
            const match = rest.match(/^([^:/]+)(?::\d+)?[?#].*secret=([a-fA-F0-9]+)/);
            if (match) {
                return { ip: match[1].trim(), secret: match[2].trim() };
            }
        }
    } catch (_) {}

    return null;
};

export default function ScannerScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [scanned, setScanned] = useState(false);
    const [torch, setTorch] = useState(false);
    const router = useRouter();

    useEffect(() => {
        let sub: any;
        try {
            sub = CameraView.onModernBarcodeScanned((event) => {
                if (event && event.data) {
                    handleBarCodeScanned({ data: event.data });
                }
            });
        } catch (_) {}
        return () => {
            if (sub && typeof sub.remove === 'function') {
                sub.remove();
            }
        };
    }, []);

    const handleLaunchNativeScanner = async () => {
        try {
            if (CameraView.isModernBarcodeScannerAvailable) {
                await CameraView.launchScanner({ barcodeTypes: ['qr'] });
            } else {
                alert('Google Play Services native scanner is not available on this device.');
            }
        } catch (err: any) {
            console.log('Launch scanner error:', err);
        }
    };

    if (!permission) return <View style={styles.container} />;
    if (!permission.granted) {
        return (
            <View style={styles.container}>
                <Text style={styles.text}>Camera access is required to scan QR codes.</Text>
                <View style={styles.permissionButtons}>
                    <Button onPress={requestPermission} title="Grant Permission" color="#2ecc71" />
                    <View style={{ width: 20, height: 12 }} />
                    <Button onPress={() => router.back()} title="Cancel" color="#e74c3c" />
                </View>
            </View>
        );
    }

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        if (scanned) return;
        setScanned(true);

        const parsed = parseQrData(data);
        if (parsed && parsed.ip && parsed.secret) {
            try {
                await AsyncStorage.setItem('serverIP', parsed.ip);
                await AsyncStorage.setItem('SECRET_KEY', parsed.secret);
                alert(`Successfully paired with PC!\nIP: ${parsed.ip}`);
                router.back();
            } catch (error) {
                alert('Error saving authorization data.');
                setTimeout(() => setScanned(false), 2000);
            }
        } else {
            alert('Invalid QR code. Please ensure you are scanning the doDECK pairing code from PC.');
            setTimeout(() => setScanned(false), 2000);
        }
    };

    return (
        <View style={styles.container}>
            <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                autofocus="on"
                enableTorch={torch}
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={BARCODE_SETTINGS}
            />

            {/* Viewfinder crosshairs */}
            <View style={styles.viewfinderContainer} pointerEvents="none">
                <View style={styles.viewfinder}>
                    <View style={[styles.corner, styles.topLeft]} />
                    <View style={[styles.corner, styles.topRight]} />
                    <View style={[styles.corner, styles.bottomLeft]} />
                    <View style={[styles.corner, styles.bottomRight]} />
                </View>
            </View>

            {/* Bottom navigation overlay */}
            <View style={styles.overlay}>
                <Text style={styles.overlayText}>Point camera at PC pairing QR code</Text>

                {CameraView.isModernBarcodeScannerAvailable && (
                    <TouchableOpacity
                        style={styles.googleScannerButton}
                        onPress={handleLaunchNativeScanner}
                    >
                        <Text style={styles.googleScannerButtonText}>🔍 Open Google Scanner (Recommended)</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.buttonRow}>
                    <TouchableOpacity
                        style={[styles.torchButton, torch && styles.torchButtonActive]}
                        onPress={() => setTorch((prev) => !prev)}
                    >
                        <Text style={styles.torchButtonText}>{torch ? '🔦 Turn off Flashlight' : '🔦 Flashlight'}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.manualButton} onPress={() => router.back()}>
                        <Text style={styles.manualButtonText}>⌨️ Manual Input</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => router.back()}>
                        <Text style={styles.cancelButtonText}>✕ Cancel</Text>
                    </TouchableOpacity>
                </View>
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
        borderTopLeftRadius: 8,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 8,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 8,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 8,
    },
    overlay: {
        position: 'absolute',
        bottom: 30,
        left: 20,
        right: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: '#333',
    },
    overlayText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    googleScannerButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        width: '100%',
        alignItems: 'center',
    },
    googleScannerButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: 'bold',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
        width: '100%',
    },
    torchButton: {
        flex: 1,
        backgroundColor: '#333',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    torchButtonActive: {
        backgroundColor: '#f39c12',
    },
    torchButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    manualButton: {
        flex: 1,
        backgroundColor: '#2c3e50',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    manualButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    cancelButton: {
        flex: 1,
        backgroundColor: '#e74c3c',
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: 'bold',
    },
});

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter, useFocusEffect } from 'expo-router';
import axios from 'axios';

interface LayoutItem {
    id: string;
    name: string;
    grid?: { columns: number; rows: number };
    buttons?: any[];
}

export default function SettingsScreen() {
    const router = useRouter();
    const [ip, setIp] = useState('');
    const [hasSecret, setHasSecret] = useState(false);
    const [layouts, setLayouts] = useState<LayoutItem[]>([]);
    const [activeLayoutId, setActiveLayoutId] = useState<string>('');
    const [loadingLayouts, setLoadingLayouts] = useState(false);
    const [showManual, setShowManual] = useState(false);
    const [manualIpInput, setManualIpInput] = useState('');
    const [manualSecretInput, setManualSecretInput] = useState('');

    const loadSettings = async () => {
        try {
            const savedIp = await AsyncStorage.getItem('serverIP');
            const savedSecret = await AsyncStorage.getItem('SECRET_KEY');
            const savedActiveId = await AsyncStorage.getItem('activeLayoutId');
            const cachedLayoutRaw = await AsyncStorage.getItem('cachedLayout');

            if (savedIp) {
                setIp(savedIp);
                setManualIpInput(savedIp);
                if (savedSecret) setManualSecretInput(savedSecret);
            }
            setHasSecret(Boolean(savedSecret));

            let currentLayouts: LayoutItem[] = [];
            if (cachedLayoutRaw) {
                try {
                    const parsed = JSON.parse(cachedLayoutRaw);
                    if (parsed && Array.isArray(parsed.layouts)) {
                        currentLayouts = parsed.layouts;
                        setLayouts(currentLayouts);
                    }
                } catch (e) {
                    // Ignore parse error
                }
            }

            if (savedActiveId) {
                setActiveLayoutId(savedActiveId);
            }

            if (savedIp) {
                fetchFreshLayouts(savedIp, savedActiveId);
            }
        } catch (error) {
            console.error('Błąd wczytywania ustawień:', error);
        }
    };

    const fetchFreshLayouts = async (serverIp: string, currentActiveId?: string | null) => {
        setLoadingLayouts(true);
        try {
            const res = await axios.get(`http://${serverIp}:5000/dispatcher/get_layout`, { timeout: 3000 });
            if (res.data && Array.isArray(res.data.layouts)) {
                setLayouts(res.data.layouts);
                await AsyncStorage.setItem('cachedLayout', JSON.stringify(res.data));

                if (!currentActiveId && res.data.active_layout_id) {
                    setActiveLayoutId(res.data.active_layout_id);
                    await AsyncStorage.setItem('activeLayoutId', res.data.active_layout_id);
                }
            }
        } catch (err) {
            console.log('Nie udało się pobrać najnowszych układów:', err);
        } finally {
            setLoadingLayouts(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadSettings();
        }, [])
    );

    const handleSelectLayout = async (layoutId: string) => {
        try {
            setActiveLayoutId(layoutId);
            await AsyncStorage.setItem('activeLayoutId', layoutId);
        } catch (e) {
            console.error('Błąd zapisu wybranego układu:', e);
        }
    };

    const handleDisconnect = async () => {
        Alert.alert(
            'Odłącz urządzenie',
            'Czy na pewno chcesz usunąć powiązanie z serwerem PC?',
            [
                { text: 'Anuluj', style: 'cancel' },
                {
                    text: 'Odłącz',
                    style: 'destructive',
                    onPress: async () => {
                        await AsyncStorage.multiRemove(['serverIP', 'SECRET_KEY', 'activeLayoutId', 'cachedLayout']);
                        setIp('');
                        setHasSecret(false);
                        setLayouts([]);
                        setActiveLayoutId('');
                    },
                },
            ]
        );
    };

    const handleSaveManualConfig = async () => {
        const cleanedIp = manualIpInput.trim();
        if (!cleanedIp) {
            Alert.alert('Błąd', 'Podaj poprawny adres IP serwera.');
            return;
        }
        const cleanedSecret = manualSecretInput.trim();
        await AsyncStorage.setItem('serverIP', cleanedIp);
        if (cleanedSecret) {
            await AsyncStorage.setItem('SECRET_KEY', cleanedSecret);
            setHasSecret(true);
        }
        setIp(cleanedIp);
        Alert.alert('Zapisano', `Zapisano adres IP: ${cleanedIp}`);
        fetchFreshLayouts(cleanedIp, activeLayoutId);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>⬅ Wróć</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Ustawienia doDECK</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* SEKCJA 1: POŁĄCZENIE I PAROWANIE */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Połączenie i Autoryzacja</Text>

                    <View style={styles.statusRow}>
                        <Text style={styles.label}>Serwer PC:</Text>
                        <Text style={styles.valueText}>{ip || 'Nie skonfigurowano'}</Text>
                    </View>

                    <View style={styles.statusRow}>
                        <Text style={styles.label}>Status:</Text>
                        <View style={styles.badgeContainer}>
                            <View
                                style={[
                                    styles.badgeDot,
                                    { backgroundColor: hasSecret && ip ? '#2ecc71' : '#e74c3c' },
                                ]}
                            />
                            <Text
                                style={[
                                    styles.badgeText,
                                    { color: hasSecret && ip ? '#2ecc71' : '#e74c3c' },
                                ]}
                            >
                                {hasSecret && ip ? 'Sparowano (HMAC aktywny)' : 'Brak autoryzacji'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity
                            style={styles.qrButton}
                            onPress={() => router.push('/ScannerScreen')}
                        >
                            <Text style={styles.qrButtonText}>📷 Skanuj kod QR z PC</Text>
                        </TouchableOpacity>

                        {Boolean(ip || hasSecret) && (
                            <TouchableOpacity
                                style={styles.disconnectButton}
                                onPress={handleDisconnect}
                            >
                                <Text style={styles.disconnectButtonText}>Odłącz</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* SEKCJA 2: WYBÓR UKŁADU (LAYOUT) */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.sectionTitle}>Wybór układu (Layout)</Text>
                        {loadingLayouts && <ActivityIndicator size="small" color="#2ecc71" />}
                    </View>

                    {layouts.length === 0 ? (
                        <Text style={styles.emptyText}>
                            {ip
                                ? 'Brak wczytanych układów z serwera. Sprawdź połączenie z PC.'
                                : 'Zeskanuj kod QR, aby pobrać dostępne układy przycisków.'}
                        </Text>
                    ) : (
                        <View style={styles.layoutList}>
                            {layouts.map((layout) => {
                                const isSelected = layout.id === activeLayoutId;
                                const cols = layout.grid?.columns || 4;
                                const rows = layout.grid?.rows || 4;

                                return (
                                    <TouchableOpacity
                                        key={layout.id}
                                        style={[
                                            styles.layoutItem,
                                            isSelected && styles.layoutItemSelected,
                                        ]}
                                        onPress={() => handleSelectLayout(layout.id)}
                                    >
                                        <View style={styles.layoutInfo}>
                                            <Text
                                                style={[
                                                    styles.layoutName,
                                                    isSelected && styles.layoutNameSelected,
                                                ]}
                                            >
                                                {layout.name || layout.id}
                                            </Text>
                                            <Text style={styles.layoutMeta}>
                                                Siatka {cols}x{rows} • {layout.buttons?.length || 0} kafelków
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <View style={styles.selectedBadge}>
                                                <Text style={styles.selectedBadgeText}>Aktywny ✓</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* SEKCJA 3: ZAAWANSOWANE / AWARYJNE RĘCZNE IP */}
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.accordionHeader}
                        onPress={() => setShowManual(!showManual)}
                    >
                        <Text style={styles.accordionTitle}>Opcje zaawansowane (ręczne IP)</Text>
                        <Text style={styles.accordionIcon}>{showManual ? '▲' : '▼'}</Text>
                    </TouchableOpacity>

                    {showManual && (
                        <View style={styles.manualContainer}>
                            <Text style={styles.manualDesc}>
                                Jeśli kamera nie działa, możesz ręcznie wprowadzić adres IP serwera PC w sieci Wi-Fi:
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="192.168.x.x"
                                placeholderTextColor="#666"
                                value={manualIpInput}
                                onChangeText={setManualIpInput}
                                autoCapitalize="none"
                                keyboardType="numeric"
                            />
                            <Text style={styles.manualLabel}>Klucz autoryzacji (Secret):</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Wklej 64-znakowy klucz z okna parowania"
                                placeholderTextColor="#666"
                                value={manualSecretInput}
                                onChangeText={setManualSecretInput}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={styles.saveManualButton}
                                onPress={handleSaveManualConfig}
                            >
                                <Text style={styles.saveManualButtonText}>Zapisz konfigurację</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        letterSpacing: 1,
    },
    backButton: {
        backgroundColor: '#252525',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#333',
    },
    backButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    scrollContent: {
        padding: 16,
        gap: 16,
    },
    card: {
        backgroundColor: '#1b1b1b',
        borderRadius: 10,
        padding: 16,
        borderWidth: 1,
        borderColor: '#2a2a2a',
    },
    cardHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 6,
    },
    label: {
        fontSize: 14,
        color: '#888',
    },
    valueText: {
        fontSize: 14,
        color: '#eee',
        fontWeight: '600',
    },
    badgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    badgeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    badgeText: {
        fontSize: 13,
        fontWeight: '600',
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 14,
    },
    qrButton: {
        flex: 1,
        backgroundColor: '#2ecc71',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qrButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
    },
    disconnectButton: {
        backgroundColor: '#e74c3c',
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    disconnectButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    emptyText: {
        color: '#777',
        fontSize: 13,
        fontStyle: 'italic',
        lineHeight: 18,
    },
    layoutList: {
        gap: 8,
    },
    layoutItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#242424',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    layoutItemSelected: {
        borderColor: '#2ecc71',
        backgroundColor: '#1b2d22',
    },
    layoutInfo: {
        flex: 1,
    },
    layoutName: {
        color: '#eee',
        fontSize: 15,
        fontWeight: '600',
    },
    layoutNameSelected: {
        color: '#2ecc71',
    },
    layoutMeta: {
        color: '#777',
        fontSize: 12,
        marginTop: 2,
    },
    selectedBadge: {
        backgroundColor: '#2ecc71',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    selectedBadgeText: {
        color: '#000',
        fontSize: 11,
        fontWeight: 'bold',
    },
    accordionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    accordionTitle: {
        color: '#aaa',
        fontSize: 14,
        fontWeight: '600',
    },
    accordionIcon: {
        color: '#aaa',
        fontSize: 12,
    },
    manualContainer: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#282828',
    },
    manualDesc: {
        color: '#777',
        fontSize: 12,
        marginBottom: 8,
        lineHeight: 16,
    },
    input: {
        backgroundColor: '#121212',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 6,
        padding: 10,
        color: '#fff',
        fontSize: 14,
        marginBottom: 10,
    },
    saveManualButton: {
        backgroundColor: '#007BFF',
        paddingVertical: 8,
        borderRadius: 6,
        alignItems: 'center',
    },
    manualLabel: {
        color: '#bbb',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
        marginTop: 6,
    },
    saveManualButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
});

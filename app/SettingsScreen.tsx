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
import type { LayoutItem } from './types';

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
            console.error('Error loading settings:', error);
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
            console.log('Failed to fetch latest layouts:', err);
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
            console.error('Error saving selected layout:', e);
        }
    };

    const handleDisconnect = async () => {
        Alert.alert(
            'Disconnect Device',
            'Are you sure you want to remove the connection to the PC server?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Disconnect',
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
            Alert.alert('Error', 'Please enter a valid server IP address.');
            return;
        }
        const cleanedSecret = manualSecretInput.trim();
        await AsyncStorage.setItem('serverIP', cleanedIp);
        if (cleanedSecret) {
            await AsyncStorage.setItem('SECRET_KEY', cleanedSecret);
            setHasSecret(true);
        }
        setIp(cleanedIp);
        Alert.alert('Saved', `Saved IP address: ${cleanedIp}`);
        fetchFreshLayouts(cleanedIp, activeLayoutId);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Text style={styles.backButtonText}>⬅ Back</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle}>doDECK Settings</Text>
                <View style={{ width: 60 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* SECTION 1: CONNECTION & AUTHORIZATION */}
                <View style={styles.card}>
                    <Text style={styles.sectionTitle}>Connection & Authorization</Text>

                    <View style={styles.statusRow}>
                        <Text style={styles.label}>PC Server:</Text>
                        <Text style={styles.valueText}>{ip || 'Not configured'}</Text>
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
                                {hasSecret && ip ? 'Paired (HMAC active)' : 'Unauthorized'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.actionButtonsRow}>
                        <TouchableOpacity
                            style={styles.qrButton}
                            onPress={() => router.push('/ScannerScreen')}
                        >
                            <Text style={styles.qrButtonText}>📷 Scan QR Code from PC</Text>
                        </TouchableOpacity>

                        {Boolean(ip || hasSecret) && (
                            <TouchableOpacity
                                style={styles.disconnectButton}
                                onPress={handleDisconnect}
                            >
                                <Text style={styles.disconnectButtonText}>Disconnect</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* SECTION 2: LAYOUT SELECTION */}
                <View style={styles.card}>
                    <View style={styles.cardHeaderRow}>
                        <Text style={styles.sectionTitle}>Layout Selection</Text>
                        {loadingLayouts && <ActivityIndicator size="small" color="#2ecc71" />}
                    </View>

                    {layouts.length === 0 ? (
                        <Text style={styles.emptyText}>
                            {ip
                                ? 'No layouts loaded from server. Check PC connection.'
                                : 'Scan QR code to load available button layouts.'}
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
                                                Grid {cols}x{rows} • {layout.buttons?.length || 0} tiles
                                            </Text>
                                        </View>
                                        {isSelected && (
                                            <View style={styles.selectedBadge}>
                                                <Text style={styles.selectedBadgeText}>Active ✓</Text>
                                            </View>
                                        )}
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    )}
                </View>

                {/* SECTION 3: ADVANCED / MANUAL IP */}
                <View style={styles.card}>
                    <TouchableOpacity
                        style={styles.accordionHeader}
                        onPress={() => setShowManual(!showManual)}
                    >
                        <Text style={styles.accordionTitle}>Advanced Options (Manual IP)</Text>
                        <Text style={styles.accordionIcon}>{showManual ? '▲' : '▼'}</Text>
                    </TouchableOpacity>

                    {showManual && (
                        <View style={styles.manualContainer}>
                            <Text style={styles.manualDesc}>
                                If camera does not work, you can manually enter the PC server IP address on your Wi-Fi network:
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
                            <Text style={styles.manualLabel}>Authorization Key (Secret):</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Paste 64-character key from pairing window"
                                placeholderTextColor="#666"
                                value={manualSecretInput}
                                onChangeText={setManualSecretInput}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                style={styles.saveManualButton}
                                onPress={handleSaveManualConfig}
                            >
                                <Text style={styles.saveManualButtonText}>Save Configuration</Text>
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
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#222',
    },
    label: {
        fontSize: 14,
        color: '#888',
    },
    valueText: {
        fontSize: 14,
        color: '#fff',
        fontFamily: 'monospace',
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
        fontWeight: 'bold',
    },
    actionButtonsRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 16,
    },
    qrButton: {
        flex: 1,
        backgroundColor: '#2ecc71',
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    qrButtonText: {
        color: '#000',
        fontWeight: 'bold',
        fontSize: 14,
    },
    disconnectButton: {
        backgroundColor: '#e74c3c',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    disconnectButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 14,
    },
    emptyText: {
        color: '#666',
        fontSize: 13,
        fontStyle: 'italic',
        lineHeight: 18,
    },
    layoutList: {
        gap: 8,
    },
    layoutItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#222',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#333',
    },
    layoutItemSelected: {
        borderColor: '#2ecc71',
        backgroundColor: '#1a2e22',
    },
    layoutInfo: {
        flex: 1,
    },
    layoutName: {
        fontSize: 15,
        fontWeight: 'bold',
        color: '#ddd',
        marginBottom: 2,
    },
    layoutNameSelected: {
        color: '#2ecc71',
    },
    layoutMeta: {
        fontSize: 12,
        color: '#777',
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
        fontSize: 14,
        fontWeight: '600',
        color: '#888',
    },
    accordionIcon: {
        fontSize: 12,
        color: '#888',
    },
    manualContainer: {
        marginTop: 14,
        borderTopWidth: 1,
        borderTopColor: '#252525',
        paddingTop: 12,
        gap: 8,
    },
    manualDesc: {
        fontSize: 12,
        color: '#777',
        lineHeight: 16,
    },
    manualLabel: {
        fontSize: 12,
        color: '#aaa',
        marginTop: 4,
    },
    input: {
        backgroundColor: '#111',
        borderWidth: 1,
        borderColor: '#333',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 8,
        color: '#fff',
        fontSize: 13,
        fontFamily: 'monospace',
    },
    saveManualButton: {
        backgroundColor: '#3498db',
        paddingVertical: 10,
        borderRadius: 6,
        alignItems: 'center',
        marginTop: 6,
    },
    saveManualButtonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 13,
    },
});

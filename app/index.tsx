import React, { useState, useCallback } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'
import VolumeControl from './components/VolumeControl'
import { useFocusEffect, useRouter } from "expo-router";
import ActionTile from './components/ActionTile'
import ValueTile from './components/ValueTile'
import WidgetTile from './components/WidgetTile'

const INITIAL_LAYOUT = {
    "active_layout_id": "profile_main",
    "layouts": [
        {
            "id": "profile_main",
            "name": "Główny Panel",
            "grid": { "columns": 4, "rows": 4 },
            "buttons": [
                { "id": "1", "title": "pulpit", "color": "#1a1a1a", "type": "ACTION", "x": 1, "y": 1, "w": 1, "h": 1, "payload": { "command": "hotkey", "args": "win+d" } },
                { "id": "2", "title": "task-manager", "color": "#1a1a1a", "type": "ACTION", "x": 2, "y": 1, "w": 1, "h": 1, "payload": { "command": "hotkey", "args": "ctrl+shift+esc" } },
                { "id": "5", "title": "pliki", "color": "#1a1a1a", "type": "ACTION", "x": 3, "y": 1, "w": 1, "h": 1, "payload": { "command": "hotkey", "args": "win+e" } },
                { "id": "6", "title": "onet", "color": "#1a1a1a", "type": "ACTION", "x": 4, "y": 1, "w": 1, "h": 1, "payload": { "command": "open_url", "args": "https://www.onet.pl/" } },
                { "id": "3", "title": "Mixer Audio", "color": "#2ecc71", "type": "WIDGET", "x": 1, "y": 2, "w": 4, "h": 1, "payload": { "command": "open_mixer" } },
                { "id": "4", "title": "ram usage", "color": "#5865F2", "type": "LIVE DATA", "x": 1, "y": 3, "w": 2, "h": 2, "payload": { "sensor": "ram" } },
                { "id": "7", "title": "prev", "color": "#2ecc71", "type": "ACTION", "x": 3, "y": 3, "w": 1, "h": 1, "payload": { "command": "hotkey", "args": "left arrow" } },
                { "id": "8", "title": "next", "color": "#2ecc71", "type": "ACTION", "x": 4, "y": 3, "w": 1, "h": 1, "payload": { "command": "hotkey", "args": "right arrow" } }
            ]
        }
    ]
}

const MainScreen = () => {
    const router = useRouter();

    const [layoutData, setLayoutData] = useState(INITIAL_LAYOUT)
    const [responseMessage, setResponseMessage] = useState('')
    const [isAudioChanging, setIsAudioChanging] = useState(false)
    const [appsAudio, setAppsAudio] = useState({})
    const [serverIP, setServerIP] = useState('')
    const [hardwareData, setHardwareData] = useState({ 'cpu': 0, 'ram': 0 })

    const BASE_URL = `http://${serverIP}:5000`

    const activeProfile = layoutData.layouts.find(l => l.id === layoutData.active_layout_id) || layoutData.layouts[0];
    const columns = activeProfile.grid.columns;
    const rows = activeProfile.grid.rows;
    const buttons = activeProfile.buttons;

    useFocusEffect(
        useCallback(() => {
            const checkAndLoadIp = async () => {
                try {
                    const savedIp = await AsyncStorage.getItem('serverIP');
                    if (savedIp && savedIp !== serverIP) {
                        setServerIP(savedIp);
                        fetchLayoutFromPython(savedIp);
                    }
                } catch (error) {
                    console.log('Błąd przy wczytywaniu IP:', error);
                }
            };
            checkAndLoadIp();
        }, [serverIP])
    );

    const fetchLayoutFromPython = async (ip) => {
        try {
            setResponseMessage('Łączenie z serwerem...');
            const res = await axios.get(`http://${ip}:5000/dispatcher/get_layout`);
            if (res.data && res.data.layouts) {
                setLayoutData(res.data);
                setResponseMessage('Połączono!');
                setTimeout(() => setResponseMessage(''), 2000);
            }
        } catch (e) {
            // Teraz błąd sieci wyświetli się na dole ekranu telefonu!
            setResponseMessage('Błąd pobierania: ' + e.message);
            console.error("Nie udało się pobrać układu przycisków", e);
        }
    }

    useFocusEffect(
        useCallback(() => {
            let isLiveData = buttons.some(btn => btn.type == "LIVE DATA")
            if (!isLiveData || !serverIP) return

            const RESTInterval = setInterval(async () => {
                try {
                    const res = await axios.get(`${BASE_URL}/system/getSystemUsage`);
                    if (res.data && res.data != undefined) {
                        setHardwareData(res.data)
                    }
                } catch (e) {
                    console.error("nie udalo sie pobrac danych", e);
                }
            }, 3000)

            return () => clearInterval(RESTInterval);
        }, [serverIP, buttons])
    )

    const setAppVolume = async (name, newVolume) => {
        try {
            await axios.post(`${BASE_URL}/audio/setAppVolume`, {
                app: name,
                volume: newVolume
            })
        } catch (error) {
            console.error('Błąd zmiany głośności dla', name, error)
        }
    }

    const handleButtonPress = async (item) => {
        if (item.type === 'WIDGET' && item.payload.command === 'open_mixer') {
            try {
                const response = await axios.get(`${BASE_URL}/audio/getAppsVolume`)
                setAppsAudio(response.data)
                setIsAudioChanging(true)
            } catch (error) {
                setResponseMessage('Błąd pobierania audio: ' + error.message)
            }
            return
        }
        else if (item.type === 'ACTION') {
            try {
                const response = await axios.post(`${BASE_URL}/dispatcher/trigger`, {
                    command: item.payload.command,
                    args: item.payload.args || ''
                })

                setResponseMessage(response.data.msg || 'Wykonano')
                setTimeout(() => setResponseMessage(''), 3000)
            } catch (error) {
                setResponseMessage('Błąd połączenia: ' + error.message)
            }
        }
    }

    const renderItem = (item) => {
        if (item.type === 'ACTION') return <ActionTile item={item} onPress={() => handleButtonPress(item)} />;
        if (item.type === 'LIVE DATA') {
            const sensor = item.payload.sensor;
            if (sensor === 'cpu') return <ValueTile item={item} value={hardwareData.cpu} />;
            if (sensor === 'ram') return <ValueTile item={item} value={hardwareData.ram} />;
            return <View style={styles.gridItem}><Text>Brak danych</Text></View>;
        }
        if (item.type === 'WIDGET') return <WidgetTile item={item} onPress={() => handleButtonPress(item)} />;
    }

    return (
        <SafeAreaView style={styles.container}>
            {isAudioChanging ? (
                <VolumeControl
                    appsVolume={appsAudio}
                    closeFunction={() => setIsAudioChanging(false)}
                    onVolumeConfirm={(appName, newVolume) => setAppVolume(appName, newVolume)}
                />
            ) : (
                <>
                    <View style={styles.header}>
                        <Text style={styles.headerTitle}>DO(DECK)</Text>
                        <TouchableOpacity style={styles.settingsButton} onPress={() => router.push('/SettingsScreen')}>
                            <Text style={styles.settingsButtonText}>Ustawienia</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Całkowicie nowy, kuloodporny kontener układu */}
                    <View style={styles.gridContainer}>
                        {buttons.map((item) => {
                            // Obliczamy pozycję i rozmiar w procentach
                            const widthPct = (item.w / columns) * 100;
                            const heightPct = (item.h / rows) * 100;
                            const leftPct = ((item.x - 1) / columns) * 100;
                            const topPct = ((item.y - 1) / rows) * 100;

                            return (
                                <View
                                    key={item.id}
                                    style={{
                                        position: 'absolute',
                                        width: `${widthPct}%`,
                                        height: `${heightPct}%`,
                                        left: `${leftPct}%`,
                                        top: `${topPct}%`,
                                        padding: 5 // marginesy między kafelkami
                                    }}
                                >
                                    <View style={{ flex: 1, alignItems: 'stretch', justifyContent: 'center' }}>
                                        {renderItem(item)}
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.footer}>
                        <Text style={styles.response}>{responseMessage}</Text>
                    </View>
                </>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#121212' },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginTop: 40, marginBottom: 20, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#eee',
        paddingHorizontal: 15
    },
    settingsButtonText: { color: '#fff', fontWeight: '600' },
    headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold', letterSpacing: 2 },

    // Zmodyfikowany kontener, wymagany dla pozycjonowania absolutnego
    gridContainer: {
        flex: 1,
        position: 'relative',
        marginHorizontal: 10,
    },

    gridItem: {
        flex: 1, margin: 8, height: 120, borderRadius: 15, justifyContent: 'center', alignItems: 'center',
        shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4.65, elevation: 8,
    },
    settingsButton: { backgroundColor: '#007BFF', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
    footer: { height: 60, justifyContent: 'center', alignItems: 'center' },
    response: { color: '#aaa', fontSize: 14 }
})

export default MainScreen

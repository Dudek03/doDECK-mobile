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
import { mainStyles } from '../assets/styles/main'

const INITIAL_LAYOUT = {
    "active_layout_id": "profile_main",
    "layouts": [
        {
            "id": "profile_main",
            "name": "Główny Panel",
            "grid": { "columns": 4, "rows": 4 },
            "buttons": [
                {
                    "id": "1",
                    "title": "pulpit",
                    "color": "#1a1a1a",
                    "type": "ACTION",
                    "x": 1, "y": 1, "w": 1, "h": 1,
                    "payload": {
                        "command": "hotkey",
                        "args": "win+d"
                    }
                },

                {
                    "id": "2",
                    "title": "task-manager",
                    "color": "#1a1a1a",
                    "type": "ACTION",
                    "x": 2, "y": 1, "w": 1, "h": 1,
                    "payload": {
                        "command": "hotkey",
                        "args": "ctrl+shift+esc"
                    }
                },

                {
                    "id": "5",
                    "title": "pliki",
                    "color": "#1a1a1a",
                    "type": "ACTION",
                    "x": 3, "y": 1, "w": 1, "h": 1,
                    "payload": {
                        "command": "hotkey",
                        "args": "win+e"
                    }
                },

                {
                    "id": "6",
                    "title": "onet",
                    "color": "#1a1a1a",
                    "type": "ACTION",
                    "x": 4, "y": 1, "w": 1, "h": 1,
                    "payload": {
                        "command": "open_url",
                        "args": "https://www.onet.pl/"
                    }
                },

                {
                    "id": "3", "title": "Mixer Audio",
                    "color": "#2ecc71",
                    "type": "WIDGET",
                    "x": 1, "y": 2, "w": 4, "h": 1,
                    "payload": { "command": "open_mixer" }
                },

                {
                    "id": "4",
                    "title": "ram usage",
                    "color": "#5865F2",
                    "type": "LIVE DATA",
                    "x": 1, "y": 3, "w": 2, "h": 2,
                    "payload": { "sensor": "ram" }
                },

                {
                    "id": "7",
                    "title": "prev",
                    "color": "#2ecc71",
                    "type": "ACTION",
                    "x": 3, "y": 3, "w": 1, "h": 1,
                    "payload": {
                        "command": "hotkey",
                        "args": "left arrow"
                    }
                },

                {
                    "id": "8",
                    "title": "next",
                    "color": "#2ecc71",
                    "type": "ACTION",
                    "x": 4, "y": 3, "w": 1, "h": 1,
                    "payload": {
                        "command": "hotkey",
                        "args": "right arrow"
                    }
                }
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

    // 3. ZMIANA: Dynamiczne wyciąganie aktywnego profilu (to zapobiega błędom "undefined")
    const activeProfile = layoutData.layouts.find(l => l.id === layoutData.active_layout_id) || layoutData.layouts[0];
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
                    console.log('Błąd przy wczytywaniu IP z SecureStore:', error);
                }
            };

            checkAndLoadIp();

        }, [serverIP])
    );

    const fetchLayoutFromPython = async (ip) => {
        try {
            const res = await axios.get(`http://${ip}:5000/dispatcher/get_layout`);
            if (res.data && res.data.layouts) {
                setLayoutData(res.data);
            }
        } catch (e) {
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
        if (item.type === 'ACTION') {
            return <ActionTile item={item} onPress={() => handleButtonPress(item)} />;
        }

        if (item.type === 'LIVE DATA') {
            const sensor = item.payload.sensor;

            switch (sensor) {
                case 'cpu':
                    return <ValueTile item={item} value={hardwareData.cpu} />;
                case 'ram':
                    return <ValueTile item={item} value={hardwareData.ram} />;
                default:
                    return <View style={mainStyles.gridItem}><Text>Brak danych</Text></View>;
            }
        }

        if (item.type === 'WIDGET') {
            return <WidgetTile
                item={item}
                onPress={() => handleButtonPress(item)}
            />;
        }
    }

    return (
        <SafeAreaView style={mainStyles.container}>
            {isAudioChanging ? (
                <VolumeControl
                    appsVolume={appsAudio}
                    closeFunction={() => setIsAudioChanging(false)}
                    onVolumeConfirm={(appName, newVolume) => setAppVolume(appName, newVolume)}
                />
            ) : (
                <>
                    <View style={mainStyles.header}>
                        <Text style={mainStyles.headerTitle}>DO(DECK)</Text>
                        <TouchableOpacity
                            style={mainStyles.settingsButton}
                            onPress={() => router.push('/SettingsScreen')}
                        >
                            <Text style={mainStyles.settingsButtonText}>Ustawienia</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={{
                        flex: 1,
                        position: 'relative',
                        padding: 5
                    }}>
                        {buttons.map((item) => {
                            // Pobieramy rozmiar siatki
                            const totalCols = activeProfile.grid.columns;
                            const totalRows = activeProfile.grid.rows;

                            // Matematyka kafelków (szerokość, wysokość i przesunięcie w %)
                            const widthPercent = (item.w / totalCols) * 100;
                            const heightPercent = (item.h / totalRows) * 100;
                            // Odejmujemy 1, bo siatka w JSON zaczyna się od 1, a pozycje liczymy od 0
                            const leftPercent = ((item.x - 1) / totalCols) * 100;
                            const topPercent = ((item.y - 1) / totalRows) * 100;

                            return (
                                <View
                                    key={item.id}
                                    style={{
                                        position: 'absolute',
                                        width: `${widthPercent}%`,
                                        height: `${heightPercent}%`,
                                        left: `${leftPercent}%`,
                                        top: `${topPercent}%`,
                                        padding: 5, // To zastępuje CSSowy 'gap'
                                    }}
                                >
                                    <View style={{ flex: 1 }}>
                                        {renderItem(item)}
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                    <View style={mainStyles.footer}>
                        <Text style={mainStyles.response}>{responseMessage}</Text>
                    </View>
                </>
            )}
        </SafeAreaView>
    )
}

export default MainScreen

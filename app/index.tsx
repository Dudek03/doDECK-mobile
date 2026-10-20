import React, { useState, useCallback, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'
import { io } from 'socket.io-client'
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
    const [socket, setSocket] = useState(null)

    const [activeLayoutId, setActiveLayoutId] = useState(null)
    const [profileStack, setProfileStack] = useState([])

    const BASE_URL = `http://${serverIP}:5000`

    const currentLayoutId = activeLayoutId || layoutData.active_layout_id;
    const activeProfile = layoutData.layouts.find(l => l.id === currentLayoutId) || layoutData.layouts[0];
    const buttons = activeProfile.buttons || [];

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
                // Resetujemy stos przy pobraniu z serwera, żeby uniknąć osieroconych widoków
                setProfileStack([]);
                setActiveLayoutId(res.data.active_layout_id);
            }
        } catch (e) {
            setResponseMessage('Błąd pobierania: ' + e.message);
            console.error("Nie udało się pobrać układu przycisków", e);
        }
    }

    useEffect(() => {
        if (!serverIP) return;

        const newSocket = io(`http://${serverIP}:5000`);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setResponseMessage('Połączono na żywo!');

            const isLiveData = buttons.some(btn => btn.type === "LIVE DATA");
            if (isLiveData) {
                newSocket.emit('subscribe_telemetry');
            }
        });

        newSocket.on('system_update', (data) => {
            setHardwareData(data);
        });

        newSocket.on('audio_volume_data', (data) => {
            setAppsAudio(data);
        });

        return () => {
            newSocket.disconnect();
        };

    }, [serverIP, buttons]);


    const handleButtonPress = async (item) => {
        // NOWE: Obsługa folderów (Działa nawet bez połączonego socketu)
        if (item.type === 'FOLDER') {
            const targetProfileId = item.payload?.args;
            if (targetProfileId && layoutData.layouts.find(l => l.id === targetProfileId)) {
                setProfileStack([...profileStack, currentLayoutId]);
                setActiveLayoutId(targetProfileId);
            }
            return;
        }

        if (!socket) {
            setResponseMessage('Brak połączenia z serwerem');
            return;
        }

        if (item.type === 'WIDGET' && item.payload.command === 'open_mixer') {
            socket.emit('get_audio_volume');
            setIsAudioChanging(true);
            return;
        }
        else if (item.type === 'ACTION') {
            socket.emit('trigger_action', {
                command: item.payload.command,
                args: item.payload.args || ''
            });

            setResponseMessage('Wysłano komendę');
            setTimeout(() => setResponseMessage(''), 3000);
        }
    }

    const handleGoBack = () => {
        if (profileStack.length > 0) {
            const newStack = [...profileStack];
            const previousProfileId = newStack.pop();
            setProfileStack(newStack);
            setActiveLayoutId(previousProfileId);
        }
    };

    const setAppVolume = async (name, newVolume) => {
        try {
            await socket.emit(`set_audio_volume`, {
                app: name,
                volume: newVolume
            })
        } catch (error) {
            console.error('Błąd zmiany głośności dla', name, error)
        }
    }

    const renderItem = (item) => {
        // FOLDER używa wizualnie tego samego kafelka co ACTION
        if (item.type === 'ACTION' || item.type === 'FOLDER') {
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

                    {/* NOWE: Przycisk Wstecz zintegrowany z UI, jeśli jesteśmy w folderze */}
                    {profileStack.length > 0 && (
                        <TouchableOpacity
                            style={{ backgroundColor: '#3498db', padding: 12, marginHorizontal: 5, borderRadius: 8, alignItems: 'center', marginBottom: 5 }}
                            onPress={handleGoBack}
                        >
                            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>⬅ Wstecz</Text>
                        </TouchableOpacity>
                    )}

                    <View style={{
                        flex: 1,
                        position: 'relative',
                        padding: 5
                    }}>
                        {buttons.map((item) => {
                            const totalCols = activeProfile.grid.columns || 4;
                            const totalRows = activeProfile.grid.rows || 4;

                            const widthPercent = (item.w / totalCols) * 100;
                            const heightPercent = (item.h / totalRows) * 100;
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
                                        padding: 5,
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
        </SafeAreaView >
    )
}

export default MainScreen

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
import CryptoJS from 'crypto-js';

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

    const [isConnected, setIsConnected] = useState(false)
    const [activeLayoutId, setActiveLayoutId] = useState(null)
    const [profileStack, setProfileStack] = useState([])
    const [secretKey, setSecretKey] = useState('');

    const BASE_URL = `http://${serverIP}:5000`

    const currentLayoutId = activeLayoutId || layoutData.active_layout_id;
    const activeProfile = layoutData.layouts.find(l => l.id === currentLayoutId) || layoutData.layouts[0];
    const buttons = activeProfile.buttons || [];

    useFocusEffect(
        useCallback(() => {
            const checkAndLoadConfig = async () => {
                try {
                    const savedIp = await AsyncStorage.getItem('serverIP');
                    const savedSecret = await AsyncStorage.getItem('SECRET_KEY');
                    const savedLayoutId = await AsyncStorage.getItem('activeLayoutId');
                    const cachedLayoutRaw = await AsyncStorage.getItem('cachedLayout');

                    if (savedSecret) setSecretKey(savedSecret);
                    else setSecretKey('');

                    if (cachedLayoutRaw && (!layoutData || layoutData === INITIAL_LAYOUT)) {
                        try {
                            const parsed = JSON.parse(cachedLayoutRaw);
                            if (parsed && parsed.layouts) {
                                setLayoutData(parsed);
                            }
                        } catch (e) {}
                    }

                    if (savedLayoutId) {
                        setActiveLayoutId(savedLayoutId);
                    }

                    if (savedIp) {
                        setServerIP(savedIp);
                        fetchLayoutFromPython(savedIp, savedLayoutId);
                    }
                } catch (error) {
                    console.log('Błąd przy wczytywaniu konfiguracji:', error);
                }
            };
            checkAndLoadConfig();
        }, [])
    );

    const fetchLayoutFromPython = async (ip, preferredLayoutId = null) => {
        try {
            const res = await axios.get(`http://${ip}:5000/dispatcher/get_layout`, { timeout: 3000 });
            if (res.data && res.data.layouts) {
                setLayoutData(res.data);
                await AsyncStorage.setItem('cachedLayout', JSON.stringify(res.data));
                setProfileStack([]);
                const chosenId = preferredLayoutId && res.data.layouts.some(l => l.id === preferredLayoutId)
                    ? preferredLayoutId
                    : res.data.active_layout_id;
                setActiveLayoutId(chosenId);
            }
        } catch (e) {
            console.error("Nie udało się pobrać układu przycisków", e);
        }
    }

    useEffect(() => {
        if (!serverIP) return;

        const newSocket = io(`http://${serverIP}:5000`, {
            transports: ['websocket'],
            timeout: 5000,
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
            setResponseMessage('Połączono na żywo!');
            setTimeout(() => setResponseMessage(''), 2500);
            newSocket.emit('subscribe_telemetry');
        });

        newSocket.on('disconnect', () => {
            setIsConnected(false);
            setResponseMessage('Rozłączono z serwerem');
            setTimeout(() => setResponseMessage(''), 2500);
        });

        newSocket.on('connect_error', () => {
            setIsConnected(false);
        });

        newSocket.on('system_update', (data) => {
            setHardwareData(data);
        });

        newSocket.on('audio_volume_data', (data) => {
            setAppsAudio(data);
        });

        return () => {
            newSocket.disconnect();
            setIsConnected(false);
        };

    }, [serverIP]);


    const handleButtonPress = async (item) => {
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

        if (!secretKey) {
            alert("Nie jesteś autoryzowany. Zeskanuj kod QR.");
            return;
        }

        const timestamp = (Date.now() / 1000).toString();

        if (item.type === 'MACRO') {
            const steps = item.payload.steps || [];
            const rawString = JSON.stringify(steps) + timestamp;
            const signature = CryptoJS.HmacSHA256(rawString, secretKey).toString(CryptoJS.enc.Hex);

            socket.emit('trigger_macro', {
                steps: steps,
                timestamp: timestamp,
                signature: signature
            });

            setResponseMessage('Wykonuję sekwencję...');
            setTimeout(() => setResponseMessage(''), 3000);
            return;
        }
        else if (item.type === 'ACTION' || item.type === 'WORKSPACE') {
            const command = item.payload.command;
            const args = item.payload.args || '';

            const argsForSignature = typeof args === 'object' && args !== null ? JSON.stringify(args) : (args || '');
            const rawString = `${command}${argsForSignature}${timestamp}`;
            const signature = CryptoJS.HmacSHA256(rawString, secretKey).toString(CryptoJS.enc.Hex);

            socket.emit('trigger_action', {
                command: command,
                args: args,
                timestamp: timestamp,
                signature: signature
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

    const setAppVolume = (name, newVolume) => {
        try {
            if (!socket) return;
            socket.emit('set_audio_volume', {
                app: name,
                volume: newVolume
            });
        } catch (error) {
            console.error('Błąd zmiany głośności dla', name, error);
        }
    }

    const renderItem = (item) => {
        if (item.type === 'ACTION' || item.type === 'FOLDER' || item.type === 'WORKSPACE' || item.type === 'MACRO') {
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
                        <View style={mainStyles.titleContainer}>
                            <View
                                style={[
                                    mainStyles.statusDot,
                                    { backgroundColor: isConnected ? '#2ecc71' : '#e74c3c' }
                                ]}
                            />
                            <Text style={mainStyles.headerTitle}>DO(DECK)</Text>
                        </View>

                        <View style={mainStyles.headerButtonsContainer}>
                            <TouchableOpacity
                                style={mainStyles.settingsButton}
                                onPress={() => router.push('/SettingsScreen')}
                            >
                                <Text style={mainStyles.settingsButtonText}>⚙️ Ustawienia</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {profileStack.length > 0 && (
                        <TouchableOpacity
                            style={mainStyles.backButton}
                            onPress={handleGoBack}
                        >
                            <Text style={mainStyles.backButtonText}>⬅ Wstecz</Text>
                        </TouchableOpacity>
                    )}

                    <View style={mainStyles.gridContainer}>
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
                                    style={[
                                        mainStyles.gridItemWrapper,
                                        {
                                            width: `${widthPercent}%`,
                                            height: `${heightPercent}%`,
                                            left: `${leftPercent}%`,
                                            top: `${topPercent}%`,
                                        }
                                    ]}
                                >
                                    <View style={mainStyles.gridItemInner}>
                                        {renderItem(item)}
                                    </View>
                                </View>
                            );
                        })}
                    </View>

                    {responseMessage ? (
                        <View style={mainStyles.toastContainer} pointerEvents="none">
                            <Text style={mainStyles.toastText}>{responseMessage}</Text>
                        </View>
                    ) : null}
                </>
            )}
        </SafeAreaView>
    );
}

export default MainScreen

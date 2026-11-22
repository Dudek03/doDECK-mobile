import React, { useState, useCallback, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { io, Socket } from 'socket.io-client';
import VolumeControl from './components/VolumeControl';
import { useFocusEffect, useRouter } from 'expo-router';
import ActionTile from './components/ActionTile';
import ValueTile from './components/ValueTile';
import WidgetTile from './components/WidgetTile';
import { mainStyles } from '../assets/styles/main';
import CryptoJS from 'crypto-js';
import type { FullLayoutConfig, TileItem, AudioVolumeData, HardwareData, LayoutItem } from './types';

const INITIAL_LAYOUT: FullLayoutConfig = {
    active_layout_id: 'profile_main',
    layouts: [
        {
            id: 'profile_main',
            name: 'Main Panel',
            grid: { columns: 4, rows: 4 },
            buttons: [
                {
                    id: '1',
                    title: 'Desktop',
                    color: '#1a1a1a',
                    type: 'ACTION',
                    x: 1,
                    y: 1,
                    w: 1,
                    h: 1,
                    payload: {
                        command: 'hotkey',
                        args: 'win+d',
                    },
                },
                {
                    id: '2',
                    title: 'Task Manager',
                    color: '#1a1a1a',
                    type: 'ACTION',
                    x: 2,
                    y: 1,
                    w: 1,
                    h: 1,
                    payload: {
                        command: 'hotkey',
                        args: 'ctrl+shift+esc',
                    },
                },
                {
                    id: '5',
                    title: 'Files',
                    color: '#1a1a1a',
                    type: 'ACTION',
                    x: 3,
                    y: 1,
                    w: 1,
                    h: 1,
                    payload: {
                        command: 'hotkey',
                        args: 'win+e',
                    },
                },
                {
                    id: '6',
                    title: 'Web',
                    color: '#1a1a1a',
                    type: 'ACTION',
                    x: 4,
                    y: 1,
                    w: 1,
                    h: 1,
                    payload: {
                        command: 'open_url',
                        args: 'https://www.google.com',
                    },
                },
                {
                    id: '3',
                    title: 'Audio Mixer',
                    color: '#2ecc71',
                    type: 'WIDGET',
                    x: 1,
                    y: 2,
                    w: 4,
                    h: 1,
                    payload: { command: 'open_mixer' },
                },
                {
                    id: '4',
                    title: 'RAM Usage',
                    color: '#5865F2',
                    type: 'LIVE DATA',
                    x: 1,
                    y: 3,
                    w: 2,
                    h: 2,
                    payload: { sensor: 'ram' },
                },
                {
                    id: '7',
                    title: 'Prev',
                    color: '#2ecc71',
                    type: 'ACTION',
                    x: 3,
                    y: 3,
                    w: 1,
                    h: 1,
                    payload: {
                        command: 'hotkey',
                        args: 'left arrow',
                    },
                },
                {
                    id: '8',
                    title: 'Next',
                    color: '#2ecc71',
                    type: 'ACTION',
                    x: 4,
                    y: 3,
                    w: 1,
                    h: 1,
                    payload: {
                        command: 'hotkey',
                        args: 'right arrow',
                    },
                },
            ],
        },
    ],
};

const MainScreen: React.FC = () => {
    const router = useRouter();

    const [layoutData, setLayoutData] = useState<FullLayoutConfig>(INITIAL_LAYOUT);
    const [responseMessage, setResponseMessage] = useState<string>('');
    const [isAudioChanging, setIsAudioChanging] = useState<boolean>(false);
    const [appsAudio, setAppsAudio] = useState<AudioVolumeData>({ count: 0, apps: [] });
    const [serverIP, setServerIP] = useState<string>('');
    const [hardwareData, setHardwareData] = useState<HardwareData>({ cpu: 0, ram: 0 });
    const [socket, setSocket] = useState<Socket | null>(null);

    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [activeLayoutId, setActiveLayoutId] = useState<string | null>(null);
    const [profileStack, setProfileStack] = useState<string[]>([]);
    const [secretKey, setSecretKey] = useState<string>('');

    const currentLayoutId = activeLayoutId || layoutData.active_layout_id;
    const activeProfile: LayoutItem =
        layoutData.layouts.find((l) => l.id === currentLayoutId) || layoutData.layouts[0];
    const buttons: TileItem[] = activeProfile?.buttons || [];

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
                    console.log('Error loading configuration:', error);
                }
            };
            checkAndLoadConfig();

            if (socket && !socket.connected) {
                socket.connect();
            }
        }, [socket])
    );

    const fetchLayoutFromPython = async (ip: string, preferredLayoutId: string | null = null) => {
        try {
            const res = await axios.get(`http://${ip}:5000/dispatcher/get_layout`, { timeout: 4000 });
            if (res.data && res.data.layouts) {
                setLayoutData(res.data);
                await AsyncStorage.setItem('cachedLayout', JSON.stringify(res.data));
                setProfileStack([]);
                const chosenId =
                    preferredLayoutId && res.data.layouts.some((l: LayoutItem) => l.id === preferredLayoutId)
                        ? preferredLayoutId
                        : res.data.active_layout_id;
                setActiveLayoutId(chosenId);
            }
        } catch (e) {
            console.error('Failed to fetch button layout:', e);
        }
    };

    useEffect(() => {
        if (!serverIP) return;

        const newSocket = io(`http://${serverIP}:5000`, {
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
        });
        setSocket(newSocket);

        newSocket.on('connect', () => {
            setIsConnected(true);
            setResponseMessage('Connected live!');
            setTimeout(() => setResponseMessage(''), 2500);
            newSocket.emit('subscribe_telemetry');
        });

        newSocket.on('disconnect', (reason) => {
            setIsConnected(false);
            console.log('Socket disconnected:', reason);
        });

        newSocket.on('connect_error', (error) => {
            setIsConnected(false);
            console.log('Socket connect error:', error?.message || error);
        });

        newSocket.on('system_update', (data: HardwareData) => {
            setHardwareData(data);
        });

        newSocket.on('audio_volume_data', (data: AudioVolumeData) => {
            setAppsAudio(data);
        });

        return () => {
            newSocket.disconnect();
            setIsConnected(false);
        };
    }, [serverIP]);

    const handleButtonPress = async (item: TileItem) => {
        if (item.type === 'FOLDER') {
            const targetProfileId = item.payload?.args;
            if (targetProfileId && layoutData.layouts.find((l) => l.id === targetProfileId)) {
                setProfileStack([...profileStack, currentLayoutId]);
                setActiveLayoutId(targetProfileId);
            }
            return;
        }

        if (!socket || !isConnected) {
            setResponseMessage(`No connection to PC (${serverIP || 'No IP'}). Check Wi-Fi.`);
            setTimeout(() => setResponseMessage(''), 3000);
            if (socket && !socket.connected) {
                socket.connect();
            }
            return;
        }

        if (item.type === 'WIDGET' && item.payload?.command === 'open_mixer') {
            socket.emit('get_audio_volume');
            setIsAudioChanging(true);
            return;
        }

        if (!secretKey) {
            alert('Not authorized. Please scan the QR code from PC.');
            return;
        }

        const timestamp = (Date.now() / 1000).toString();

        if (item.type === 'MACRO') {
            const steps = item.payload?.steps || [];
            const rawString = JSON.stringify(steps) + timestamp;
            const signature = CryptoJS.HmacSHA256(rawString, secretKey).toString(CryptoJS.enc.Hex);

            socket.emit('trigger_macro', {
                steps: steps,
                timestamp: timestamp,
                signature: signature,
            });

            setResponseMessage('Executing sequence...');
            setTimeout(() => setResponseMessage(''), 3000);
            return;
        } else if (item.type === 'ACTION' || item.type === 'WORKSPACE') {
            const command = item.payload?.command || '';
            const args = item.payload?.args || '';

            const argsForSignature =
                typeof args === 'object' && args !== null ? JSON.stringify(args) : args || '';
            const rawString = `${command}${argsForSignature}${timestamp}`;
            const signature = CryptoJS.HmacSHA256(rawString, secretKey).toString(CryptoJS.enc.Hex);

            socket.emit('trigger_action', {
                command: command,
                args: args,
                timestamp: timestamp,
                signature: signature,
            });

            setResponseMessage('Command sent');
            setTimeout(() => setResponseMessage(''), 3000);
        }
    };

    const handleGoBack = () => {
        if (profileStack.length > 0) {
            const newStack = [...profileStack];
            const previousProfileId = newStack.pop();
            setProfileStack(newStack);
            if (previousProfileId) {
                setActiveLayoutId(previousProfileId);
            }
        }
    };

    const setAppVolume = (name: string, newVolume: number) => {
        try {
            if (!socket) return;
            socket.emit('set_audio_volume', {
                app: name,
                volume: newVolume,
            });
        } catch (error) {
            console.error('Volume change error for', name, error);
        }
    };

    const renderItem = (item: TileItem) => {
        if (
            item.type === 'ACTION' ||
            item.type === 'FOLDER' ||
            item.type === 'WORKSPACE' ||
            item.type === 'MACRO'
        ) {
            return <ActionTile item={item} onPress={() => handleButtonPress(item)} />;
        }

        if (item.type === 'LIVE DATA') {
            const sensor = item.payload?.sensor;
            switch (sensor) {
                case 'cpu':
                    return <ValueTile item={item} value={hardwareData.cpu} />;
                case 'ram':
                    return <ValueTile item={item} value={hardwareData.ram} />;
                default:
                    return (
                        <View style={mainStyles.gridItem}>
                            <Text>No data</Text>
                        </View>
                    );
            }
        }

        if (item.type === 'WIDGET') {
            return <WidgetTile item={item} onPress={() => handleButtonPress(item)} />;
        }

        return null;
    };

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
                                    { backgroundColor: isConnected ? '#2ecc71' : '#e74c3c' },
                                ]}
                            />
                            <Text style={mainStyles.headerTitle}>DO(DECK)</Text>
                        </View>

                        <View style={mainStyles.headerButtonsContainer}>
                            <TouchableOpacity
                                style={mainStyles.settingsButton}
                                onPress={() => router.push('/SettingsScreen')}
                            >
                                <Text style={mainStyles.settingsButtonText}>⚙️ Settings</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {profileStack.length > 0 && (
                        <TouchableOpacity style={mainStyles.backButton} onPress={handleGoBack}>
                            <Text style={mainStyles.backButtonText}>⬅ Back</Text>
                        </TouchableOpacity>
                    )}

                    <View style={mainStyles.gridContainer}>
                        {buttons.map((item) => {
                            const totalCols = activeProfile.grid?.columns || 4;
                            const totalRows = activeProfile.grid?.rows || 4;
                            const itemW = item.w || 1;
                            const itemH = item.h || 1;
                            const itemX = item.x || 1;
                            const itemY = item.y || 1;

                            const widthPercent = (itemW / totalCols) * 100;
                            const heightPercent = (itemH / totalRows) * 100;
                            const leftPercent = ((itemX - 1) / totalCols) * 100;
                            const topPercent = ((itemY - 1) / totalRows) * 100;

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
                                        },
                                    ]}
                                >
                                    <View style={mainStyles.gridItemInner}>{renderItem(item)}</View>
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
};

export default MainScreen;

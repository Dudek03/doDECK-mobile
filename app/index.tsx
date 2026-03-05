import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios'
import VolumeControl from './components/VolumeControl'
import { useRouter } from "expo-router";
import ActionTile from './components/ActionTile'
import ValueTile from './components/ValueTile'
import WidgetTile from './components/WidgetTile'

const INITIAL_BUTTONS = [
    {
        id: '1',
        title: 'Pulpit',
        color: '#1a1a1a',
        type: 'ACTION',
        payload: { command: 'hotkey', args: 'win+d' }
    },
    {
        id: '2',
        title: 'Mute Discord',
        color: '#5865F2',
        type: 'ACTION',
        payload: { command: 'mute_app', args: 'Discord.exe' }
    },
    {
        id: '3',
        title: 'Zrób Klip',
        color: '#e74c3c',
        type: 'ACTION',
        payload: { command: 'hotkey', args: 'alt+8' }
    },
    {
        id: '4',
        title: 'Mixer Audio',
        color: '#2ecc71',
        type: 'WIDGET',
        payload: { command: 'open_mixer' }
    },
    {
        id: '5',
        title: 'cpu usage',
        color: '#5865F2',
        type: 'LIVE DATA',
        payload: { sensor: 'cpu' }
    },
]


const MainScreen = () => {
    const router = useRouter();
    const [buttons, setButtons] = useState(INITIAL_BUTTONS)
    const [responseMessage, setResponseMessage] = useState('')
    const [isAudioChanging, setIsAudioChanging] = useState(false)
    const [appsAudio, setAppsAudio] = useState({})
    const [serverIP, setServerIP] = useState('')
    const [hardwareData, setHardwareData] = useState({ 'cpu': 0, 'ram': 0 })


    const BASE_URL = `http://${serverIP}:5000`


    useEffect(() => {
        const appInit = async () => {
            let currIp = '192.168.100.47'
            setServerIP(currIp)
            /*
            try {
                const savedIp = await AsyncStorage.getItem('serverIP');
                if (savedIp) {
                    setServerIP(savedIp);
                    currIp = savedIp
                }
                else {
                    await AsyncStorage.setItem('serverIP', currIp)
                    setServerIP(currIp)
                }
            } catch (error) {
                console.log('Błąd przy wczytywaniu IP:', error);
            }
            */

            try {
                const res = await axios.get(`http://${currIp}:5000/dispatcher/get_layout`);
                if (res.data && res.data.length > 0) {
                    setButtons(res.data);
                }
            } catch (e) {
                console.error("Nie udało się pobrać układu przycisków", e);
            }
        }
        appInit()
    }, []);


    useEffect(() => {
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

    const renderItem = ({ item }) => {
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
                /* case 'youtube_subs':
                       return <YouTubeTile item={item} subs={systemStats.youtube_subs} />; */
                default:
                    return <View style={styles.gridItem}><Text>Brak danych</Text></View>;
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
                    </View>

                    <FlatList
                        data={buttons}
                        renderItem={renderItem}
                        keyExtractor={item => item.id}
                        numColumns={2}
                        contentContainerStyle={styles.gridContainer}
                    />

                    <View style={styles.footer}>
                        <Text style={styles.response}>{responseMessage}</Text>
                    </View>
                </>
            )}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#121212',
    },
    header: {
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        marginBottom: 10,
    },
    headerTitle: {
        color: '#fff',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 2,
    },
    gridContainer: {
        paddingHorizontal: 10,
    },
    gridItem: {
        flex: 1,
        margin: 8,
        height: 120, // Kwadratowe kafelki
        borderRadius: 15, // Zaokrąglone rogi wyglądają lepiej na mobile
        justifyContent: 'center',
        alignItems: 'center',
        // Cienie dla iOS
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4.65,
        // Cienie dla Androida
        elevation: 8,
    },
    gridItemText: {
        color: 'white',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
    footer: {
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    response: {
        color: '#aaa',
        fontSize: 14,
    }
})

export default MainScreen

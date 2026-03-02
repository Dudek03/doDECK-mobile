import React, { useEffect, useState } from 'react'
import { SafeAreaView, StyleSheet, Text, View, TouchableOpacity, FlatList } from 'react-native'
import axios from 'axios'
import AsyncStorage from '@react-native-async-storage/async-storage'
import VolumeControl from './components/VolumeControl'
import { useRouter } from "expo-router";

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
    }
]


const MainScreen = () => {
    const router = useRouter();
    const [buttons, setButtons] = useState(INITIAL_BUTTONS)
    const [responseMessage, setResponseMessage] = useState('')
    const [isAudioChanging, setIsAudioChanging] = useState(false)
    const [appsAudio, setAppsAudio] = useState({})
    const [serverIP, setServerIP] = useState('')


    const BASE_URL = `http://${serverIP}:5000`

    useEffect(() => {
        const appInit = async () => {
            let currIp = '0'
            try {
                const savedIp = await AsyncStorage.getItem('serverIP');
                if (savedIp) {
                    setServerIP(savedIp);
                    currIp = savedIp
                }
            } catch (error) {
                console.log('Błąd przy wczytywaniu IP:', error);
            }

            try {
                const res = await axios.get(`http://${currIp}:5000/get_layout`);
                if (res.data && res.data.length > 0) {
                    setButtons(res.data);
                }
            } catch (e) {
                console.error("Nie udało się pobrać układu przycisków", e);
            }
        }
        appInit()
    }, []);


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

        try {
            const response = await axios.post(`${BASE_URL}/trigger`, {
                command: item.payload.command,
                args: item.payload.args || ''
            })

            setResponseMessage(response.data.msg || 'Wykonano')
            setTimeout(() => setResponseMessage(''), 3000)
        } catch (error) {
            setResponseMessage('Błąd połączenia: ' + error.message)
        }
    }

    const renderItem = ({ item }) => (
        <TouchableOpacity
            style={[styles.gridItem, { backgroundColor: item.color }]}
            onPress={() => handleButtonPress(item)}
            activeOpacity={0.7}
        >
            <Text style={styles.gridItemText}>{item.title}</Text>
        </TouchableOpacity>
    )

    return (
        <SafeAreaView style={styles.container}>
            {isAudioChanging ? (
                <VolumeControl appsVolume={appsAudio} closeFunction={() => setIsAudioChanging(false)} />
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
        backgroundColor: '#121212', // Nowoczesny, bardzo ciemny szary
    },
    header: {
        height: 80,
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

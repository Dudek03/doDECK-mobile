import React, { useEffect, useState } from 'react';
import { Text, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Slider from '@react-native-community/slider';
import ActionTile from './ActionTile';
import styles from '../../assets/styles/volumeControl';
import type { AudioApp, AudioVolumeData } from '../types';

export interface VolumeControlProps {
    appsVolume: AudioVolumeData;
    closeFunction: () => void;
    onVolumeConfirm?: (appName: string, finalVolume: number) => void;
}

const VolumeControl: React.FC<VolumeControlProps> = ({
    appsVolume,
    closeFunction,
    onVolumeConfirm,
}) => {
    const [apps, setApps] = useState<AudioApp[]>([]);

    useEffect(() => {
        if (appsVolume) {
            const list = appsVolume.apps || appsVolume.aplikacje;
            if (Array.isArray(list)) {
                setApps(list);
            }
        }
    }, [appsVolume]);

    const setVolume = (index: number, newVolume: number) => {
        setApps((prev) =>
            prev.map((item, i) =>
                i === index ? { ...item, Volume: newVolume } : item
            )
        );
    };

    const handleSlidingComplete = (appName: string, finalVolume: number) => {
        if (onVolumeConfirm) {
            onVolumeConfirm(appName, finalVolume);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>AUDIO MIXER</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {apps.map((e, index) => (
                    <View key={index} style={styles.appRow}>
                        <View style={styles.textContainer}>
                            <Text style={styles.appName}>{e.App}</Text>
                            <Text style={styles.volumeText}>{Math.round(e.Volume)}%</Text>
                        </View>

                        <Slider
                            style={styles.slider}
                            value={e.Volume}
                            onValueChange={(value) => setVolume(index, value)}
                            onSlidingComplete={(value) => handleSlidingComplete(e.App, value)}
                            minimumValue={0}
                            maximumValue={100}
                            step={1}
                            minimumTrackTintColor="#2ecc71"
                            maximumTrackTintColor="#333333"
                            thumbTintColor="#2ecc71"
                        />
                    </View>
                ))}

                <View style={styles.buttonContainer}>
                    <ActionTile
                        item={{
                            id: 'close_btn',
                            title: 'CLOSE',
                            color: '#e74c3c',
                        }}
                        onPress={closeFunction}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

export default VolumeControl;

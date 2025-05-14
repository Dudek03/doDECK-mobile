import { StyleSheet, Text, ScrollView, View } from "react-native";
import {useEffect, useState } from "react";
import TextButton from "./TextButton";
import { appendBaseUrl } from "expo-router/build/fork/getPathFromState-forks";
import Slider from '@react-native-community/slider';

const VolumeControl = ({appsVolume, closeFunction}) => {

    const [apps, setApps] = useState([])

    useEffect(() => {
        if(Array.isArray(appsVolume.aplikacje))
            setApps(appsVolume.aplikacje)
    }, [appsVolume.aplikacje])

    const setVolume = (index, newVolume) => {
        setApps(prev => 
            prev.map((item, i) =>
                i == index ? {...item, Volume: newVolume}: item
            )
        )
    }

    const styles = StyleSheet.create({
        button: {
            display: "flex",
            flex: 1, 
            padding: 10, 
            borderRadius: 15, 
            justifyContent: "center", 
            alignItems: "center",
            margin: 10,
            backgroundColor: "blue"
        },
        overlay: {
            display: "flex",
            flex: 1,
            flexDirection: "column",
            backgroundColor: "pink",
        }
    })

    return (
        <ScrollView style={styles.overlay}> 
         {apps.map((e, index) => (
              <View key={index} style={{ marginBottom: 20 }}>
                <Text>{e.App}: {e.Volume}</Text>
                <Slider
                  style={{ width: '100%' }}
                  value={e.Volume}
                  onValueChange={(value) => setVolume(index, value)}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  minimumTrackTintColor="#1fb28a"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#1a9274"
                />
              </View>
        ))}   
        <TextButton text={"close"} click={() => {closeFunction()}} bgColor={"black"} />
        </ScrollView>

    )
}


export default VolumeControl

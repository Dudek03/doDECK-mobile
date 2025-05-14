import Slider from '@react-native-community/slider';
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";

const VolumeSlider = ({volume, setVolume}) => {

    const styles = StyleSheet.create({

    })

    return (
            <Slider
                  style={{ width: '100%' }}
                  value={volume}
                  onValueChange={setVolume}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  minimumTrackTintColor="#1fb28a"
                  maximumTrackTintColor="#d3d3d3"
                  thumbTintColor="#1a9274"
            />

    )
}


export default VolumeSlider 

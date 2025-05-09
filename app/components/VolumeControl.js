import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useState } from "react";

const VolumeControl = ({appsVolume}) => {

    const styles = StyleSheet.create({
        button: {
            display: "flex",
            flex: 1, 
            padding: 10, 
            borderRadius: 15, 
            justifyContent: "center", 
            alignItems: "center",
            margin: 10,
            backgroundColor: bgColor
        },
        text: {
            textAlign: "center",
            color: textColor
        }
    })

    return (
        <View> 

        </View>
    )
}


export default VolumeControl

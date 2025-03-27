import React from 'react';
import { SafeAreaView, TouchableOpacity, StyleSheet, Text } from 'react-native';

const ActionButton = ({ text, image }) => {
    if (image)
        return (
            <TouchableOpacity style={styles.button}>
                <Text>{image}</Text>
            </TouchableOpacity>
        )
    else {
        return (
            <TouchableOpacity>
                <Text>{text}</Text>
            </TouchableOpacity>
        )
    }
}

const styles = StyleSheet.create({
    button: {

    }
})

export default ActionButton
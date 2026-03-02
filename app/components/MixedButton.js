import { StyleSheet, ImageBackground, Text, TouchableOpacity } from "react-native";
import { createMixedButtonStyles } from "../../assets/styles/mixedButton";

const MixedButton = ({ text, click, bgColor, imagePath, textColor = "white" }) => {

    styles = createMixedButtonStyles(bgColor, textColor)

    return (
        <TouchableOpacity style={styles.button} onPress={click ? () => { click() } : () => { }}>
            <ImageBackground source={{ imagePath }}>
                <Text style={styles.text}>{text}</Text>
            </ImageBackground>
        </TouchableOpacity>
    )
}


export default MixedButton

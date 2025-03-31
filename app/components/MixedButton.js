import { StyleSheet, ImageBackground, Text, TouchableOpacity } from "react-native";

const MixedButton = ({ text, click, bgColor, imagePath, textColor = "white" }) => {

    const styles = StyleSheet.create({
        button: {
            display: "flex",
            flex: 1,
            padding: 10,
            forderRadius: 15,
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
        <TouchableOpacity style={styles.button} onPress={click ? () => { click() } : () => { }}>
            <ImageBackground source={{ imagePath }}>
                <Text style={styles.text}>{text}</Text>
            </ImageBackground>
        </TouchableOpacity>
    )
}


export default MixedButton
import { StyleSheet, Text, TouchableOpacity } from "react-native";

const TextButton = ({ text, click, bgColor, textColor = "white" }) => {

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
        <TouchableOpacity style={styles.button} onPress={click ? () => { click() } : () => { }}>
            <Text style={styles.text}>{text}</Text>
        </TouchableOpacity>
    )
}


export default TextButton
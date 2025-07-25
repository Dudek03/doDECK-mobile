import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import {createUniversalButtonStyles} from '../../assets/styles/universalButton'

const UniversalButton = ({ text, click, color, textColor = "white", width, height, font, insertInside }) => {

    /*const styles = StyleSheet.create({
        button: {
            display: "flex",
            backgroundColor: color,
            justifyContent: "center",
            alignSelf: 'center',
            padding: 12,
            borderRadius: 100,
            alignItems: "center"
        }
    })*/

    styles = createUniversalButtonStyles(color)

    if (insertInside)
        return (
            <TouchableOpacity onPress={click ? () => { click() } : () => { }} style={[styles.button, width ? { width: width } : {}, height ? { height: height } : {}]}>
                {insertInside}
            </TouchableOpacity>
        )
    else
        return (
            <TouchableOpacity onPress={click ? () => { click() } : () => { }} style={[styles.button, width ? { width: width } : {}, height ? { height: height } : {}]}>
                <Text style={[{ color: textColor, textAlign: "center" }, font ? { fontSize: font } : {}]}>{text}</Text>
            </TouchableOpacity>
        )

}
export default UniversalButton

import { TouchableOpacity, Image, StyleSheet } from 'react-native'

const PhotoButton = ({ click, imagePath }) => {
    /*styles = StyleSheet.create({
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
        image: {
            width: "auto",
            flexWrap: "nowrap"
        }
    })*/

    return (
        <TouchableOpacity onPress={click ? () => { click() } : () => { }} style={styles.button}>
            <Image source={{ imagePath }}></Image>
        </TouchableOpacity>
    )
}

export default PhotoButton






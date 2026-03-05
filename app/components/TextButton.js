import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { createTextButtonStyles } from "../../assets/styles/textButton";

const TextButton = ({ text, click, bgColor, textColor = "white" }) => {
  let styles = createTextButtonStyles(bgColor, textColor);

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={
        click
          ? () => {
              click();
            }
          : () => {}
      }
    >
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
};

export default TextButton;

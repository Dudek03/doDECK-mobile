
import { StyleSheet } from "react-native";
import { baseButton } from "./base";

export const createTextButtonStyles = (bgColor, textColor) => StyleSheet.create({
  button: {
    ...baseButton,
    backgroundColor: bgColor,
  },
  text: {
    textAlign: "center",
    color: textColor,
  },
});

import { StyleSheet } from "react-native";

export const createTextButtonStyles = (bgColor, textColor) =>
  StyleSheet.create({
    button: {
      backgroundColor: bgColor,
    },
    text: {
      textAlign: "center",
      color: textColor,
    },
  });


import { StyleSheet } from "react-native";
import { baseButton } from "./base";

export const createPhotoButtonStyles = (bgColor) => StyleSheet.create({
  button: {
    ...baseButton,
    backgroundColor: bgColor,
  },
  image: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
});

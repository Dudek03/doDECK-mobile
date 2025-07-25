
import { StyleSheet } from "react-native";
import { baseButton } from "./base";

export default StyleSheet.create({
  button: {
    ...baseButton,
    backgroundColor: "blue",
  },
  overlay: {
    flex: 1,
    flexDirection: "column",
    backgroundColor: "pink",
  },
});

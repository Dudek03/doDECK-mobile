
import { StyleSheet } from "react-native";

export const createUniversalButtonStyles = (color) => StyleSheet.create({
  button: {
    backgroundColor: color,
    justifyContent: "center",
    alignSelf: 'center',
    alignItems: "center",
    padding: 12,
    borderRadius: 100,
  },
});

import { StyleSheet } from "react-native";

export const tileStyles = StyleSheet.create({
  gridItem: {
    flex: 1,
    width: "100%",
    height: "100%",
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  gridItemText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  largeValueText: {
    fontSize: 32,
    color: "white",
    fontWeight: "bold",
    marginTop: 10,
  },
});

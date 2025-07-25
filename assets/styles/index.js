
import { StyleSheet } from "react-native";
import { centeredContainer, column } from "./base";

export default StyleSheet.create({
  container: {
    ...centeredContainer,
    ...column,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
  response: {
    marginTop: 20,
    fontSize: 16,
    color: 'green',
  },
  clock: {
    backgroundColor: "purple",
    flex: 1,
  },
  buttons: {
    flex: 1,
    flexDirection: "column",
  },
  buttonRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-evenly",
    backgroundColor: "red",
    width: "100%",
  },
});

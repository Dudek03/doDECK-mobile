import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginBottom: 10,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  appRow: {
    marginBottom: 25,
    backgroundColor: "#1a1a1a",
    padding: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  textContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 5,
  },
  appName: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  volumeText: {
    color: "#2ecc71",
    fontSize: 18,
    fontWeight: "bold",
  },
  slider: {
    width: "100%",
    height: 40,
  },
  buttonContainer: {
    marginTop: 20,
    height: 120,
  },
});

export default styles;

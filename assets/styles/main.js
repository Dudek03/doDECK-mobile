import { StyleSheet } from "react-native";

export const mainStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
    paddingHorizontal: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  headerButtonsContainer: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center",
  },
  settingsButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: "center",
  },
  settingsButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  qrButton: {
    backgroundColor: "#2ecc71",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    justifyContent: "center",
  },
  qrButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backButton: {
    backgroundColor: "#3498db",
    padding: 12,
    marginHorizontal: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  gridContainer: {
    flex: 1,
    position: "relative",
    padding: 10,
  },
  gridItemWrapper: {
    position: "absolute",
    padding: 6,
  },
  gridItemInner: {
    flex: 1,
  },
  footer: {
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  response: {
    color: "#aaa",
    fontSize: 14,
  },
});

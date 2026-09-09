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
    marginTop: 40,
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  settingsButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  gridContainer: {
    paddingHorizontal: 10,
  },
  gridItem: {
    flex: 1,
    margin: 8,
    height: 120, // Kwadratowe kafelki
    borderRadius: 15, // Zaokrąglone rogi wyglądają lepiej na mobile
    justifyContent: "center",
    alignItems: "center",
    // Cienie dla iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    // Cienie dla Androida
    elevation: 8,
  },
  settingsButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
  },
  gridItemText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  footer: {
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  response: {
    color: "#aaa",
    fontSize: 14,
  },
});

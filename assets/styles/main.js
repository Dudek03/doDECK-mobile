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
    marginTop: 4,
    marginBottom: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1.5,
  },
  headerButtonsContainer: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  settingsButton: {
    backgroundColor: "#222",
    borderWidth: 1,
    borderColor: "#333",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  settingsButtonText: {
    color: "#eee",
    fontSize: 13,
    fontWeight: "600",
  },
  backButton: {
    backgroundColor: "#2980b9",
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 8,
    borderRadius: 6,
    alignItems: "center",
    marginBottom: 4,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  gridContainer: {
    flex: 1,
    position: "relative",
    padding: 4,
  },
  gridItemWrapper: {
    position: "absolute",
    padding: 4,
  },
  gridItemInner: {
    flex: 1,
  },
  toastContainer: {
    position: "absolute",
    bottom: 12,
    alignSelf: "center",
    backgroundColor: "rgba(24, 24, 24, 0.94)",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#444",
    zIndex: 999,
  },
  toastText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
});

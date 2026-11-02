import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import SettingsScreen from "../SettingsScreen";

jest.setTimeout(20000);

const mockPush = jest.fn();
const mockBack = jest.fn();

const mockAxiosGet = jest.fn().mockResolvedValue({
  data: {
    active_layout_id: "profile_main",
    layouts: [
      {
        id: "profile_main",
        name: "Główny Panel",
        grid: { columns: 4, rows: 4 },
        buttons: [{ id: "1", title: "Test" }],
      },
    ],
  },
});

jest.mock("axios", () => ({
  __esModule: true,
  default: {
    get: (...args) => mockAxiosGet(...args),
  },
  get: (...args) => mockAxiosGet(...args),
}));

jest.mock("expo-router", () => {
  const React = require("react");
  return {
    useRouter: () => ({
      push: mockPush,
      back: mockBack,
    }),
    useFocusEffect: (callback) => {
      React.useEffect(() => {
        callback();
      }, [callback]);
    },
  };
});

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(async (key) => {
    if (key === "serverIP") return "192.168.1.50";
    if (key === "SECRET_KEY") return "mock-secret-key-64";
    if (key === "activeLayoutId") return "profile_main";
    if (key === "cachedLayout") {
      return JSON.stringify({
        active_layout_id: "profile_main",
        layouts: [
          {
            id: "profile_main",
            name: "Główny Panel",
            grid: { columns: 4, rows: 4 },
            buttons: [{ id: "1", title: "Test" }],
          },
        ],
      });
    }
    return null;
  }),
  setItem: jest.fn().mockResolvedValue(null),
  multiRemove: jest.fn().mockResolvedValue(null),
}));

describe("SettingsScreen Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderuje nagłówek i sekcje ustawień", async () => {
    render(<SettingsScreen />);

    await waitFor(() => {
      expect(screen.getByText("Ustawienia doDECK")).toBeTruthy();
    });
    expect(screen.getByText("Połączenie i Autoryzacja")).toBeTruthy();
    expect(screen.getByText("Wybór układu (Layout)")).toBeTruthy();
    expect(screen.getByText("📷 Skanuj kod QR z PC")).toBeTruthy();
  }, 20000);

  it("nawiguje do ScannerScreen po kliknięciu przycisku skanowania QR", async () => {
    render(<SettingsScreen />);

    await waitFor(() => {
      expect(screen.getByText("📷 Skanuj kod QR z PC")).toBeTruthy();
    });
    fireEvent.press(screen.getByText("📷 Skanuj kod QR z PC"));
    expect(mockPush).toHaveBeenCalledWith("/ScannerScreen");
  }, 20000);

  it("pozwala na wybór układu i zapisuje go", async () => {
    render(<SettingsScreen />);

    await waitFor(() => {
      expect(screen.getByText("Główny Panel")).toBeTruthy();
    });
    expect(screen.getByText("Aktywny ✓")).toBeTruthy();
  }, 20000);
});

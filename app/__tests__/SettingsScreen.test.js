import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import SettingsScreen from "../SettingsScreen";

jest.setTimeout(20000);

const mockPush = jest.fn();
const mockBack = jest.fn();

jest.mock("axios", () => ({
  get: jest.fn(async () => ({
    data: {
      active_layout_id: "profile_main",
      layouts: [
        {
          id: "profile_main",
          name: "Main Panel",
          grid: { columns: 4, rows: 4 },
          buttons: [{ id: "1", title: "Test" }],
        },
      ],
    },
  })),
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
            name: "Main Panel",
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

  it("renders header and settings sections", async () => {
    await render(<SettingsScreen />);

    expect(screen.getByText("doDECK Settings")).toBeTruthy();
    expect(screen.getByText("Connection & Authorization")).toBeTruthy();
    expect(screen.getByText("Layout Selection")).toBeTruthy();
    expect(screen.getByText("📷 Scan QR Code from PC")).toBeTruthy();
  });

  it("navigates to ScannerScreen on pressing QR scan button", async () => {
    await render(<SettingsScreen />);

    fireEvent.press(screen.getByText("📷 Scan QR Code from PC"));
    expect(mockPush).toHaveBeenCalledWith("/ScannerScreen");
  });

  it("allows selecting a layout and marks it active", async () => {
    await render(<SettingsScreen />);

    expect(screen.getByText("Main Panel")).toBeTruthy();
    expect(screen.getByText("Active ✓")).toBeTruthy();
  });
});

import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import VolumeControl from "../components/VolumeControl";

describe("VolumeControl Component", () => {
  const mockAppsVolume = {
    aplikacje: [
      { App: "Spotify.exe", Volume: 50 },
      { App: "Discord.exe", Volume: 80 },
    ],
  };

  it("poprawnie renderuje listę aplikacji z ich głośnościami", () => {
    const { getByText } = render(
      <VolumeControl
        appsVolume={mockAppsVolume}
        closeFunction={jest.fn()}
        onVolumeConfirm={jest.fn()}
      />,
    );

    expect(getByText("Spotify.exe")).toBeTruthy();
    expect(getByText("50%")).toBeTruthy();
    expect(getByText("Discord.exe")).toBeTruthy();
    expect(getByText("80%")).toBeTruthy();
  });

  it("wywołuje closeFunction po wciśnięciu przycisku ZAMKNIJ", () => {
    const mockClose = jest.fn();
    const { getByText } = render(
      <VolumeControl
        appsVolume={mockAppsVolume}
        closeFunction={mockClose}
        onVolumeConfirm={jest.fn()}
      />,
    );

    fireEvent.press(getByText("ZAMKNIJ"));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});

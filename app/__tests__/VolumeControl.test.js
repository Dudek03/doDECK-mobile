import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import VolumeControl from "../components/VolumeControl";

describe("VolumeControl Component", () => {
  const mockAppsVolume = {
    aplikacje: [
      { App: "Spotify.exe", Volume: 50 },
      { App: "Discord.exe", Volume: 80 },
    ],
  };

  it("poprawnie renderuje listę aplikacji z ich głośnościami", async () => {
    await render(
      <VolumeControl
        appsVolume={mockAppsVolume}
        closeFunction={jest.fn()}
        onVolumeConfirm={jest.fn()}
      />,
    );

    expect(screen.getByText("Spotify.exe")).toBeTruthy();
    expect(screen.getByText("50%")).toBeTruthy();
    expect(screen.getByText("Discord.exe")).toBeTruthy();
    expect(screen.getByText("80%")).toBeTruthy();
  });

  it("wywołuje closeFunction po wciśnięciu przycisku ZAMKNIJ", async () => {
    const mockClose = jest.fn();
    await render(
      <VolumeControl
        appsVolume={mockAppsVolume}
        closeFunction={mockClose}
        onVolumeConfirm={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText("ZAMKNIJ"));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});

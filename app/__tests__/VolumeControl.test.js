import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import VolumeControl from "../components/VolumeControl";

describe("VolumeControl Component", () => {
  const mockAppsVolume = {
    apps: [
      { App: "Spotify.exe", Volume: 50 },
      { App: "Discord.exe", Volume: 80 },
    ],
    aplikacje: [
      { App: "Spotify.exe", Volume: 50 },
      { App: "Discord.exe", Volume: 80 },
    ],
  };

  it("renders list of applications and volume levels", async () => {
    await render(
      <VolumeControl
        appsVolume={mockAppsVolume}
        closeFunction={jest.fn()}
        onVolumeConfirm={jest.fn()}
      />,
    );

    expect(screen.getByText("AUDIO MIXER")).toBeTruthy();
    expect(screen.getByText("Spotify.exe")).toBeTruthy();
    expect(screen.getByText("50%")).toBeTruthy();
    expect(screen.getByText("Discord.exe")).toBeTruthy();
    expect(screen.getByText("80%")).toBeTruthy();
  });

  it("calls closeFunction when CLOSE button is pressed", async () => {
    const mockClose = jest.fn();
    await render(
      <VolumeControl
        appsVolume={mockAppsVolume}
        closeFunction={mockClose}
        onVolumeConfirm={jest.fn()}
      />,
    );

    fireEvent.press(screen.getByText("CLOSE"));
    expect(mockClose).toHaveBeenCalledTimes(1);
  });
});

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import ActionTile from "../components/ActionTile";

describe("ActionTile Component", () => {
  const mockItem = {
    id: "test-1",
    title: "Mój Przycisk",
    color: "#ff0000",
    type: "ACTION",
  };

  it("renderuje poprawnie tytuł kafelka", async () => {
    await render(<ActionTile item={mockItem} onPress={jest.fn()} />);

    expect(screen.getByText("Mój Przycisk")).toBeTruthy();
  });

  it("wywołuje onPress po kliknięciu", async () => {
    const onPressMock = jest.fn();
    await render(<ActionTile item={mockItem} onPress={onPressMock} />);

    fireEvent.press(screen.getByText("Mój Przycisk"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});

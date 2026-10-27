import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import WidgetTile from "../components/WidgetTile";

describe("WidgetTile Component", () => {
  const mockItem = {
    id: "widget-mixer",
    title: "Mixer Audio",
    color: "#2ecc71",
    type: "WIDGET",
  };

  it("renderuje poprawnie tytuł widgetu", async () => {
    await render(<WidgetTile item={mockItem} onPress={jest.fn()} />);

    expect(screen.getByText("Mixer Audio")).toBeTruthy();
  });

  it("wywołuje onPress po kliknięciu widgetu", async () => {
    const onPressMock = jest.fn();
    await render(<WidgetTile item={mockItem} onPress={onPressMock} />);

    fireEvent.press(screen.getByText("Mixer Audio"));
    expect(onPressMock).toHaveBeenCalledTimes(1);
  });
});

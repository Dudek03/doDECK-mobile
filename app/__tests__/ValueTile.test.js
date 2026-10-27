import React from "react";
import { render, screen } from "@testing-library/react-native";
import ValueTile from "../components/ValueTile";

describe("ValueTile Component", () => {
  const mockItem = {
    id: "live-cpu",
    title: "CPU USAGE",
    color: "#3498db",
    type: "LIVE DATA",
  };

  it("renderuje poprawnie tytuł i procentową wartość sensora", async () => {
    await render(<ValueTile item={mockItem} value={42} />);

    expect(screen.getByText("CPU USAGE")).toBeTruthy();
    expect(screen.getByText("42%")).toBeTruthy();
  });
});

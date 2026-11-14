import { render, screen } from "@testing-library/react";
import App from "./App";

beforeEach(() => localStorage.clear());

test("未ログイン時はログイン画面を表示する", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: "ログイン" })).toBeInTheDocument();
});

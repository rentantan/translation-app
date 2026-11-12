import { fireEvent, render, screen } from "@testing-library/react";
import App from "./App";
import TextInput from "./components/TextInput";
import { formatRelativeTime } from "./utils";

beforeEach(() => localStorage.clear());

test("未ログイン時はログイン画面を表示する", () => {
  render(<App />);
  expect(screen.getByRole("heading", { name: "ログイン" })).toBeInTheDocument();
});

test("Enter で翻訳し、IME 変換中の Enter では翻訳しない", () => {
  const onEnter = jest.fn();
  render(<TextInput value="こんにちは" onChange={() => {}} onEnter={onEnter} />);
  const textarea = screen.getByLabelText("翻訳する文章");

  fireEvent.keyDown(textarea, { key: "Enter", isComposing: true });
  fireEvent.keyDown(textarea, { key: "Enter", keyCode: 229 });
  expect(onEnter).not.toHaveBeenCalled();

  fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
  expect(onEnter).not.toHaveBeenCalled();

  fireEvent.keyDown(textarea, { key: "Enter" });
  expect(onEnter).toHaveBeenCalledTimes(1);
});

test("相対時刻を表示する", () => {
  const now = new Date("2025-01-10T12:00:00+09:00");
  expect(formatRelativeTime("2025-01-10T11:59:40+09:00", now)).toBe("たった今");
  expect(formatRelativeTime("2025-01-10T11:55:00+09:00", now)).toBe("5分前");
  expect(formatRelativeTime("2025-01-10T09:00:00+09:00", now)).toBe("3時間前");
  expect(formatRelativeTime("2025-01-08T12:00:00+09:00", now)).toBe("2日前");
  expect(formatRelativeTime("invalid", now)).toBe("");
});

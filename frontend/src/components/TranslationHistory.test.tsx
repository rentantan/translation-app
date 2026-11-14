import { act, fireEvent, render, screen } from "@testing-library/react";
import { api } from "../api";
import TranslationHistory from "./TranslationHistory";

jest.mock("../api", () => ({
  api: { history: jest.fn(), deleteHistory: jest.fn(), clearHistory: jest.fn() },
}));

const mockedApi = api as jest.Mocked<typeof api>;

const item = {
  id: 1,
  source_text: "こんにちは",
  translated_text: "Hello",
  source_lang: "ja",
  target_lang: "en",
  created_at: "2025-01-01T12:00:00+09:00",
};

beforeEach(() => {
  jest.useFakeTimers();
  mockedApi.history.mockResolvedValue({ items: [item], total: 1 });
  mockedApi.deleteHistory.mockResolvedValue({});
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

const renderHistory = async () => {
  render(<TranslationHistory isVisible onClose={() => {}} onSelectTranslation={() => {}} />);
  expect(await screen.findByText("こんにちは")).toBeInTheDocument();
};

test("削除は数秒間取り消せる", async () => {
  await renderHistory();
  fireEvent.click(screen.getByLabelText("この履歴を削除"));
  expect(screen.queryByText("こんにちは")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "元に戻す" }));
  expect(screen.getByText("こんにちは")).toBeInTheDocument();

  act(() => jest.advanceTimersByTime(10000));
  expect(mockedApi.deleteHistory).not.toHaveBeenCalled();
});

test("取り消さなければ時間が経つと削除を確定する", async () => {
  await renderHistory();
  fireEvent.click(screen.getByLabelText("この履歴を削除"));
  expect(mockedApi.deleteHistory).not.toHaveBeenCalled();

  await act(async () => {
    jest.advanceTimersByTime(5000);
  });
  expect(mockedApi.deleteHistory).toHaveBeenCalledWith(1);
  expect(screen.queryByRole("button", { name: "元に戻す" })).not.toBeInTheDocument();
});

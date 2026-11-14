import { render, screen } from "@testing-library/react";
import TranslationResult from "./TranslationResult";

test("結果が無いときはプレースホルダーを表示する", () => {
  render(<TranslationResult text="" loading={false} stale={false} onCopy={() => {}} />);
  expect(screen.getByText("翻訳結果がここに表示されます")).toBeInTheDocument();
  expect(screen.queryByTitle("翻訳結果をコピー")).not.toBeInTheDocument();
});

test("入力が変わったら古い結果であることを知らせる", () => {
  render(<TranslationResult text="Hello" loading={false} stale onCopy={() => {}} />);
  expect(screen.getByText("Hello")).toBeInTheDocument();
  expect(screen.getByText(/入力が変更されています/)).toBeInTheDocument();
});

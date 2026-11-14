import { fireEvent, render, screen } from "@testing-library/react";
import TextInput from "./TextInput";

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

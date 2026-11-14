import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import RegistrationForm from "./RegistrationForm";

test("確認用パスワードが一致しないとその場で表示する", () => {
  render(
    <MemoryRouter>
      <RegistrationForm onLogin={() => {}} />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText("パスワード（6文字以上）"), { target: { value: "secret123" } });
  const confirm = screen.getByLabelText("パスワード（確認）");

  fireEvent.change(confirm, { target: { value: "secret" } });
  expect(screen.getByText("パスワードが一致しません")).toBeInTheDocument();

  fireEvent.change(confirm, { target: { value: "secret123" } });
  expect(screen.queryByText("パスワードが一致しません")).not.toBeInTheDocument();
});

test("パスワードの表示を切り替えられる", () => {
  render(
    <MemoryRouter>
      <RegistrationForm onLogin={() => {}} />
    </MemoryRouter>,
  );
  const input = screen.getByLabelText("パスワード（6文字以上）");
  expect(input).toHaveAttribute("type", "password");
  fireEvent.click(screen.getAllByRole("button", { name: "パスワードを表示" })[0]);
  expect(input).toHaveAttribute("type", "text");
});

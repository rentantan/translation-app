import React, { useState } from "react";

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> & {
  invalid?: boolean;
};

/** 表示／非表示を切り替えられるパスワード入力欄 */
const PasswordInput: React.FC<Props> = ({ invalid, className, ...props }) => {
  const [visible, setVisible] = useState(false);
  return (
    <div className="password-field">
      <input
        {...props}
        type={visible ? "text" : "password"}
        className={`input${invalid ? " input--invalid" : ""}${className ? ` ${className}` : ""}`}
        aria-invalid={invalid || undefined}
      />
      <button
        type="button"
        className="icon-btn password-field__toggle"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "パスワードを隠す" : "パスワードを表示"}
        aria-pressed={visible}
      >
        <span aria-hidden="true">{visible ? "🙈" : "👁"}</span>
      </button>
    </div>
  );
};

export default PasswordInput;

import React from 'react';

type Props = {
  value: string;
  onChange: (val: string) => void;
  onEnter: () => void;
};

const TextInput: React.FC<Props> = ({ value, onChange, onEnter }) => {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          onEnter();
        }
      }}
      rows={5}
      placeholder="翻訳したい文章を入力"
      style={{
        width: '100%',
        padding: '1rem',
        borderRadius: '12px',
        border: '1px solid #ccc',
        resize: 'vertical',
        fontSize: '1rem',
        marginBottom: '0.5rem',
      }}
    />
  );
};

export default TextInput;

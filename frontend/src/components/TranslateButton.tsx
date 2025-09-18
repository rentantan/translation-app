import React from 'react';

type Props = {
  onClick: () => void;
  loading: boolean;
  disabled?: boolean;
};

const TranslateButton: React.FC<Props> = ({ onClick, loading, disabled }) => (
  <button
    onClick={onClick}
    disabled={loading || disabled}
    style={{
      width: '100%',
      padding: '0.8rem',
      borderRadius: '12px',
      border: 'none',
      background: loading ? '#ccc' : 'linear-gradient(45deg, #6a11cb, #2575fc)',
      color: 'white',
      fontWeight: 'bold',
      cursor: loading || disabled ? 'not-allowed' : 'pointer',
      marginBottom: '1rem',
    }}
  >
    {loading ? '翻訳中...' : '翻訳'}
  </button>
);

export default TranslateButton;

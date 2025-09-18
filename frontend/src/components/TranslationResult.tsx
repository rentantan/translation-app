import React from 'react';

type Props = { text: string };

const TranslationResult: React.FC<Props> = ({ text }) => {
  if (!text) return null;
  return (
    <div
      style={{
        marginTop: '1.5rem',
        padding: '1rem',
        borderRadius: '12px',
        backgroundColor: '#f0f4ff',
        minHeight: '3rem',
        fontSize: '1rem',
        whiteSpace: 'pre-wrap',
        boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)',
        overflowY: 'auto',
      }}
    >
      {text}
    </div>
  );
};

export default TranslationResult;

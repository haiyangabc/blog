import React from 'react';
import dynamic from 'next/dynamic';

// 动态导入 Markdown 编辑器，避免服务器端渲染问题
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
});

const MarkdownEditor: React.FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => {
  const handleChange = (value?: string) => {
    onChange(value || '');
  };

  return (
    <div className="w-full border rounded-md overflow-hidden">
      <MDEditor
        value={value}
        onChange={handleChange}
        height={400}
        preview="live"
        className="transition-all duration-300"
      />
    </div>
  );
};

export default MarkdownEditor;
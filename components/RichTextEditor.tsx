'use client'
import React, { useRef } from 'react';
import { Button, TextArea } from '@douyinfe/semi-ui';

// 简单实现的富文本编辑器
const RichTextEditor: React.FC<{ value: string; onChange: (value: string) => void }> = ({ value, onChange }) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  // 处理格式化操作
  const handleFormat = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    if (textAreaRef.current) {
      textAreaRef.current.focus();
      // 获取最新内容
      const newContent = textAreaRef.current.value;
      onChange(newContent);
    }
  };

  return (
    <div className="w-full border rounded-md overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 p-2 border-b bg-background">
        <Button 
          variant="ghost" 
          onClick={() => handleFormat('bold')}
        >
          粗体
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => handleFormat('italic')}
        >
          斜体
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => handleFormat('underline')}
        >
          下划线
        </Button>
        <Button 
          variant="ghost" 

          onClick={() => handleFormat('strikeThrough')}
        >
          删除线
        </Button>
        <div className="w-px h-6 bg-muted mx-1"></div>
        <Button 
          variant="ghost" 

          onClick={() => handleFormat('insertUnorderedList')}
        >
          无序列表
        </Button>
        <Button 
          variant="ghost" 

          onClick={() => handleFormat('insertOrderedList')}
        >
          有序列表
        </Button>
        <Button 
          variant="ghost" 

          onClick={() => handleFormat('formatBlock', '<blockquote>')}
        >
          引用
        </Button>
        <div className="w-px h-6 bg-muted mx-1"></div>
        <Button 
          variant="ghost" 

          onClick={() => handleFormat('formatBlock', '<h1>')}
        >
          H1
        </Button>
        <Button 
          variant="ghost" 

          onClick={() => handleFormat('formatBlock', '<h2>')}
        >
          H2
        </Button>
        <Button 
          variant="ghost" 

          onClick={() => handleFormat('formatBlock', '<p>')}
        >
          正文
        </Button>
      </div>
      <TextArea
        ref={textAreaRef}
        value={value}
        onChange={(e) => onChange(e)}
        placeholder="请输入文章内容..."
        rows={15}
        className="w-full border-none outline-none resize-none"
        style={{ minHeight: '300px' }}
      />
    </div>
  );
};

export default RichTextEditor;
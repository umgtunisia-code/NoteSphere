import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TaskForm } from '@/components/tasks/task-form';
import { Bold, Italic, List, ListOrdered, Heading, Quote, Undo, Redo, PlusCircle } from 'lucide-react';
import { useState } from 'react';

interface EditorProps {
  content: any;
  onChange: (content: any) => void;
  noteId?: string;
  projectId?: string;
}

export const Editor = ({ content, onChange, noteId, projectId }: EditorProps) => {
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: content || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl max-w-none focus:outline-none'
      }
    }
  });

  const handleConvertToTask = () => {
    if (editor) {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        const selectedText = editor.state.doc.textBetween(from, to);
        if (selectedText.trim()) {
          setSelectedText(selectedText);
          setShowTaskModal(true);
        }
      }
    }
  };

  if (!editor) {
    return null;
  }

  return (
    <div className="border rounded-lg p-2 bg-white">
      <div className="flex flex-wrap gap-1 mb-2">
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 1 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onPressedChange={() => editor.chain().focus().undo().run()}
        >
          <Undo className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          onPressedChange={() => editor.chain().focus().redo().run()}
        >
          <Redo className="h-4 w-4" />
        </Toggle>
        <Button
          size="sm"
          variant="outline"
          onClick={handleConvertToTask}
          disabled={!editor.state.selection.empty && 
            editor.state.selection.$anchor.pos === editor.state.selection.$head.pos}
        >
          <PlusCircle className="h-4 w-4 mr-1" />
          To Task
        </Button>
      </div>
      <EditorContent 
        editor={editor} 
        className="min-h-[200px] border rounded p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task from Note</DialogTitle>
          </DialogHeader>
          <TaskForm 
            projectId={projectId || ''} 
            onClose={() => setShowTaskModal(false)} 
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
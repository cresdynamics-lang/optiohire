'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link as LinkIcon, 
  Undo, 
  Redo, 
  Code 
} from 'lucide-react'

interface TemplateEditorProps {
  content: string
  onChange: (content: string) => void
}

const MenuBar = ({ editor }: { editor: any }) => {
  if (!editor) return null

  const addLink = () => {
    const url = window.prompt('URL')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b bg-slate-50 rounded-t-lg">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('bold') ? 'bg-slate-200 text-[#2D2DDD]' : 'text-slate-600'}`}
        title="Bold"
      >
        <Bold size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('italic') ? 'bg-slate-200 text-[#2D2DDD]' : 'text-slate-600'}`}
        title="Italic"
      >
        <Italic size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('bulletList') ? 'bg-slate-200 text-[#2D2DDD]' : 'text-slate-600'}`}
        title="Bullet List"
      >
        <List size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('orderedList') ? 'bg-slate-200 text-[#2D2DDD]' : 'text-slate-600'}`}
        title="Ordered List"
      >
        <ListOrdered size={18} />
      </button>
      <button
        onClick={addLink}
        className={`p-1.5 rounded hover:bg-slate-200 ${editor.isActive('link') ? 'bg-slate-200 text-[#2D2DDD]' : 'text-slate-600'}`}
        title="Link"
      >
        <LinkIcon size={18} />
      </button>
      <div className="w-px h-6 bg-slate-300 mx-1" />
      <button
        onClick={() => editor.chain().focus().undo().run()}
        className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
        title="Undo"
      >
        <Undo size={18} />
      </button>
      <button
        onClick={() => editor.chain().focus().redo().run()}
        className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
        title="Redo"
      >
        <Redo size={18} />
      </button>
    </div>
  )
}

export const TemplateEditor = ({ content, onChange }: TemplateEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-[#2D2DDD] underline cursor-pointer',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose max-w-none p-4 focus:outline-none min-h-[250px]',
      },
    },
  })

  // Update content if it changes externally (e.g. after loading)
  if (editor && editor.getHTML() !== content && content !== '') {
    // Only set if editor is not focused to avoid cursor jumping
    if (!editor.isFocused) {
      editor.commands.setContent(content)
    }
  }

  return (
    <div className="border border-slate-200 rounded-lg shadow-sm focus-within:border-[#2D2DDD] transition-colors bg-white">
      <MenuBar editor={editor} />
      <EditorContent editor={editor} />
      <div className="p-2 border-t bg-slate-50 rounded-b-lg flex justify-between items-center text-[10px] text-slate-500 font-medium uppercase tracking-wider">
        <span>Rich Text Enabled</span>
        <span>OptioHire Pro Editor</span>
      </div>
    </div>
  )
}

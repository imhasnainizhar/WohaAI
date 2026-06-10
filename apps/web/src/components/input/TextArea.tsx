"use client";

import {
  LexicalComposer,
} from "@lexical/react/LexicalComposer";

import {
  $getRoot,
  KEY_BACKSPACE_COMMAND,
  KEY_DELETE_COMMAND,
  KEY_ENTER_COMMAND,
} from "lexical";

import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useTheme } from "@/providers/ThemeProvider";

import { useState, useEffect, useRef } from "react";
import type { EditorState, LexicalEditor } from "lexical";


type ChatInputProps = {
  maxHeight: number;
}

// Placeholder
function Placeholder() {
  const [editor] = useLexicalComposerContext();
  const [placeholderVisible, setPlaceholderVisible] = useState<boolean>(true);

  useEffect(() => {
    editor.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        const text = $getRoot().getTextContent();
        setPlaceholderVisible(text.length === 0);
      })
    })
  }, [editor])
  return (
    placeholderVisible ? (
      <div className="
            absolute
            left-0
            top-1/2
            -translate-y-1/2
            pointer-events-none
            text-muted-foreground
            text-fluid-md
            "
      >
        Ask me anything...
      </div>
    ) : null
  );
}


// Editor Ref Plugin
// function EditorRefPlugin({
//     onReady,
// }: {
//     onReady: (editor: LexicalEditor) => void;
// }) {
//     const [editor] = useLexicalComposerContext();

//     useEffect(() => {
//         onReady(editor);
//     }, [editor, onReady]);

//     return null;
// }

// Word Level History Plugin
function WordLevelHistoryPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const root = editor.getRootElement();

    if (!root) return;

    const handler = () => {
      editor.update(() => {
        // force snapshot per keypress
      });
    };

    root.addEventListener("keydown", handler);

    return () => root.removeEventListener("keydown", handler);
  }, [editor]);

  return null;
}

// Main Component
export default function TextArea({ maxHeight }: ChatInputProps) {
  const [height, setHeight] = useState(24);

  const initialConfig = {
    namespace: "chat-composer",
    onError(error: Error) {
      throw error;
    },
  };

  const handleChange = (editorState: EditorState, editor: LexicalEditor) => {
    editorState.read(() => {
      const rootElement = editor.getRootElement();
      if (!rootElement) return;

      // measure content
      const scrollHeight = rootElement.scrollHeight;
      const newHeight = Math.min(scrollHeight, maxHeight);

      setHeight(newHeight);
    });
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      {/* OUTER WRAPPER controls animation */}
      <div
        className="
          relative w-full bg-none mt-2.5 mb-2
          overflow-hidden
          transition-[height] duration-150 ease-out
          will-change-[height]
        "
        style={{ height: height }}
      >
        <RichTextPlugin
          contentEditable={
            <div className="relative">
              <ContentEditable
                className="
                  outline-none text-fluid-md whitespace-pre-wrap wrap-break-word
                  min-h-6 max-h-60 overflow-y-auto
                "
              />
              <Placeholder />
            </div>
          }
          placeholder={null}
          ErrorBoundary={() => null}
        />

        <HistoryPlugin />
        <WordLevelHistoryPlugin />
        <OnChangePlugin onChange={handleChange} />
      </div>
    </LexicalComposer>
  );
}
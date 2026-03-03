import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
import { useChat, useProject } from "@/hooks/use-api";
import { motion } from "framer-motion";
import { clsx } from "clsx";

interface ChatPanelProps {
  projectId: string | null;
}

type Message = { role: "user" | "assistant" | "system"; content: string };

export function ChatPanel({ projectId }: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const { mutate: sendChat, isPending } = useChat();
  const { data: project } = useProject(projectId);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isPending]);

  // Initial greeting
  useEffect(() => {
    if (projectId && messages.length === 0 && project) {
      setMessages([
        {
          role: "assistant",
          content: `Hi! I'm ready to help tweak your design. You can ask me to "make the buttons larger", "change the theme to dark", or "add a hero section".`
        }
      ]);
    }
  }, [projectId, project, messages.length]);

  const handleSend = () => {
    if (!input.trim() || !projectId || isPending) return;

    const userMsg: Message = { role: "user", content: input };
    const newHistory = [...messages, userMsg];
    
    setMessages(newHistory);
    setInput("");

    sendChat(
      { projectId, messages: newHistory },
      {
        onSuccess: (data) => {
          setMessages([...newHistory, { role: "assistant", content: data.message }]);
        },
        onError: () => {
          // Toast handled in hook, just remove the failed user message or show error state
        }
      }
    );
  };

  if (!projectId) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center bg-black/20 text-white/30 border-l border-white/5">
        <Bot className="w-12 h-12 mb-4 opacity-50" />
        <p>Chat assistant will be available once a project is selected.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background border-l border-white/5 relative">
      {/* Header */}
      <div className="h-14 border-b border-white/5 flex items-center px-4 shrink-0 glass z-10">
        <div className="flex items-center gap-2 text-white font-medium">
          <Sparkles className="w-4 h-4 text-primary" />
          AI Assistant
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6" ref={scrollRef}>
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={clsx(
              "flex gap-3",
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            )}
          >
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg",
              msg.role === "user" 
                ? "bg-white/10 text-white" 
                : "bg-gradient-to-br from-primary to-accent text-white"
            )}>
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>
            <div className={clsx(
              "px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-md",
              msg.role === "user"
                ? "bg-white/10 text-white rounded-tr-sm border border-white/5"
                : "glass border-primary/20 text-white/90 rounded-tl-sm"
            )}>
              {msg.content}
            </div>
          </motion.div>
        ))}

        {isPending && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-white animate-pulse" />
            </div>
            <div className="px-4 py-4 rounded-2xl glass border-primary/20 rounded-tl-sm flex gap-1">
              <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </motion.div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 bg-background/80 backdrop-blur border-t border-white/5">
        <div className="relative flex items-center">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask AI to modify the design..."
            className="w-full glass-input rounded-xl pl-4 pr-12 py-3 text-sm focus:outline-none"
            disabled={isPending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isPending}
            className="absolute right-2 p-2 rounded-lg bg-primary/20 text-primary hover:bg-primary/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <div className="text-[10px] text-center text-white/30 mt-2 font-mono">
          Powered by {project ? "DesignToWeb AI" : "AI"}
        </div>
      </div>
    </div>
  );
}

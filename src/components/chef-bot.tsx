"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChefHat,
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  ArrowRight,
  ShieldCheck,
  Maximize2,
} from "lucide-react";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-1",
    sender: "bot",
    text: "Hi there! I'm SousChef — your ReciPeel AI assistant. How can I help you with recipe imports, dietary safety, or meal planning today?",
    timestamp: "Just now",
  },
];

const SUGGESTED_PROMPTS = [
  "How do I import a TikTok or Reel recipe?",
  "What is the difference between Hard and Soft conflicts?",
  "How do ingredient substitutions work?",
  "How do I organize recipes into folders?",
  "How are daily calorie and macro goals calculated?",
  "How do I filter recipes by Diet-Safe Only?",
];

export function ChefBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  function handleSend(textToSend?: string) {
    const query = (textToSend || input).trim();
    if (!query) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: "user",
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput("");
    setIsTyping(true);

    // AI Response logic
    setTimeout(() => {
      const responseText = generateBotAnswer(query);
      const botMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: "bot",
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 900);
  }

  function generateBotAnswer(q: string): string {
    const query = q.toLowerCase();

    if (query.includes("import") || query.includes("tiktok") || query.includes("reel") || query.includes("youtube")) {
      return "To import a recipe, click 'Import a recipe' on your dashboard or head to /recipes/import. Paste any TikTok, Instagram Reel, or YouTube Shorts link (or choose 'Enter Manually'). Our AI extracts the ingredients, cook time, and instructions automatically!";
    }

    if (query.includes("conflict") || query.includes("hard") || query.includes("soft") || query.includes("allergy")) {
      return "ReciPeel screens ingredients against your onboarding profile:\n\n• HARD Conflicts (Red): Flagged for saved allergies (e.g. peanuts, shellfish). Hard conflicts must be resolved or explicitly ignored before saving.\n• SOFT Conflicts (Amber): Flagged for diet preference mismatches (e.g. dairy for a vegan).";
    }

    if (query.includes("substitut") || query.includes("swap") || query.includes("replace")) {
      return "When a flagged ingredient is detected during import, ReciPeel searches 44+ seeded substitution rules. You get an inline impact preview (e.g. '-40 cal, +2g protein, removes dairy conflict'). Click 'Apply' to swap the ingredient and update your recipe totals!";
    }

    if (query.includes("folder") || query.includes("organize") || query.includes("library") || query.includes("tag")) {
      return "In your Recipe Library (/recipes), you can:\n\n1. Filter by Diet-Safe Only or Favorites.\n2. Create custom folders (e.g. 'Weeknight Dinners') and assign recipes to them.\n3. Add custom tags (e.g. #quick, #keto) and click any tag chip to filter your library instantly!";
    }

    if (query.includes("macro") || query.includes("calorie") || query.includes("tdee") || query.includes("onboarding")) {
      return "In Profile Setup (/onboarding), our automatic Mifflin-St Jeor calculator computes your TDEE daily calorie target based on your age, sex, height, and weight, splitting macros (Protein, Carbs, Fat) according to your fitness goal!";
    }

    if (query.includes("hi") || query.includes("hello") || query.includes("hey")) {
      return "Hello! 😊 I'm SousChef, your AI kitchen assistant. What would you like help with in ReciPeel?";
    }

    return `ReciPeel makes recipe importing and dietary safety seamless! You can import recipes from social media URLs, screen ingredients against your saved allergies & diets, apply smart substitutions, and manage your recipe library. 

Feel free to ask me specifically about importing, conflict checks, substitutions, or library folders!`;
  }

  return (
    <>
      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 rounded-full bg-primary px-5 py-3.5 text-sm font-semibold text-primary-foreground shadow-lift transition hover:scale-105 active:scale-95 cursor-pointer"
        aria-label="Open SousChef AI Assistant"
      >
        <span className="grid h-7 w-7 place-items-center rounded-full bg-white/20">
          <ChefHat className="h-4 w-4" />
        </span>
        <span>SousChef AI</span>
      </button>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 sm:inset-auto sm:bottom-24 sm:right-6 z-50 w-full sm:w-[420px] h-full sm:h-[530px] rounded-none sm:rounded-3xl border-0 sm:border border-border bg-surface shadow-lift overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between bg-primary p-4 text-primary-foreground">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15 backdrop-blur-xs">
                  <ChefHat className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-display font-bold text-base leading-none">SousChef AI</h3>
                    <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-100">Online</span>
                  </div>
                  <p className="mt-1 text-xs opacity-85">ReciPeel Assistant & Safety Guide</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <Link
                  href="/chef-bot"
                  onClick={() => setIsOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer text-primary-foreground"
                  title="Open in full page"
                >
                  <Maximize2 className="h-4 w-4" />
                </Link>
                <button
                  onClick={() => setIsOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer text-primary-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Chat Messages Body */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3.5 bg-background/50">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-2.5 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`grid h-7 w-7 shrink-0 place-items-center rounded-xl text-xs ${
                      m.sender === "user"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary text-primary-foreground font-bold"
                    }`}
                  >
                    {m.sender === "user" ? <User className="h-3.5 w-3.5" /> : <ChefHat className="h-3.5 w-3.5" />}
                  </div>

                  <div className={`max-w-[80%] space-y-1 ${m.sender === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`inline-block rounded-2xl p-3.5 text-xs leading-relaxed ${
                        m.sender === "user"
                          ? "bg-primary text-primary-foreground shadow-xs rounded-tr-xs"
                          : "bg-surface border border-border text-foreground shadow-xs rounded-tl-xs whitespace-pre-line"
                      }`}
                    >
                      {m.text}
                    </div>
                    <p className="text-[10px] text-muted-foreground px-1">{m.timestamp}</p>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="grid h-7 w-7 place-items-center rounded-xl bg-primary text-primary-foreground">
                    <Bot className="h-3.5 w-3.5" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl border border-border bg-surface px-4 py-2">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary delay-100" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-primary delay-200" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggested Prompts (Horizontally Scrollable) */}
            {messages.length <= 3 && (
              <div className="px-4 py-2.5 border-t border-border/40 bg-surface/95 flex flex-col gap-1.5">
                <div className="flex items-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Lightbulb className="h-3 w-3 text-primary" /> Quick Suggestions
                  </span>
                </div>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 scroll-smooth">
                  {SUGGESTED_PROMPTS.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(p)}
                      className="shrink-0 rounded-full border border-border/80 bg-background px-3.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary-soft/40 transition cursor-pointer whitespace-nowrap shadow-2xs"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-surface border-t border-border flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask SousChef AI anything..."
                className="flex-1 rounded-2xl border border-input bg-background px-4 py-2.5 text-xs text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground transition disabled:opacity-50 hover:shadow-soft cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

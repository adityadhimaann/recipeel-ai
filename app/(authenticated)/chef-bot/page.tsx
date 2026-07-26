"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ChefHat,
  Send,
  Sparkles,
  Bot,
  User,
  Lightbulb,
  ArrowLeft,
  ShieldCheck,
  RotateCcw,
  Trash2,
  Copy,
  Check,
  Plus,
  Play,
  Salad,
  SlidersHorizontal,
  Flame,
  Zap,
  Info,
  BookOpen,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type Message = {
  id: string;
  sender: "user" | "bot";
  text: string;
  timestamp: string;
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-full-1",
    sender: "bot",
    text: "Welcome to your SousChef AI Workspace!\n\nI am your intelligent ReciPeel kitchen assistant. I analyze social media recipe URLs (TikTok, Reels, Shorts), screen ingredients against your saved allergies & diets, compute macro impact deltas for substitutions, and help you plan your weekly meals.\n\nHow can I help you in the kitchen today?",
    timestamp: "Just now",
  },
];

const CATEGORIES = [
  { id: "all", label: "All Topics", icon: Sparkles },
  { id: "imports", label: "Video Imports", icon: Play },
  { id: "allergies", label: "Allergy Shields", icon: ShieldCheck },
  { id: "swaps", label: "Substitutions", icon: Zap },
  { id: "macros", label: "Macros & TDEE", icon: SlidersHorizontal },
];

const SUGGESTED_PROMPTS = [
  { text: "How do I import a TikTok or Reel recipe?", category: "imports" },
  { text: "What is the difference between Hard and Soft conflicts?", category: "allergies" },
  { text: "How do 1-click ingredient substitutions work?", category: "swaps" },
  { text: "Suggest safe substitutes for common peanut or dairy allergies", category: "swaps" },
  { text: "How are daily calories and macro goals calculated?", category: "macros" },
  { text: "How do I organize recipes into folders & custom tags?", category: "all" },
];

export default function SousChefFullPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

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
    }, 750);
  }

  function generateBotAnswer(q: string): string {
    const query = q.toLowerCase();

    if (query.includes("import") || query.includes("tiktok") || query.includes("reel") || query.includes("youtube")) {
      return "Video Recipe Extraction:\n\nTo import a recipe, navigate to /recipes/import or click Import a recipe on your Kitchen Planner dashboard.\n\n1. Paste any TikTok, Instagram Reel, or YouTube Shorts URL.\n2. Click Process Recipe.\n3. SousChef AI parses the video transcript, structures exact ingredient amounts, formats step-by-step cooking directions, and runs dietary conflict screening automatically!";
    }

    if (query.includes("conflict") || query.includes("hard") || query.includes("soft") || query.includes("allergy")) {
      return "Conflict Screening Engine:\n\nReciPeel screens extracted ingredients against your onboarding profile:\n\n• HARD Conflicts (Red Alert): Triggered by saved allergies (e.g. peanuts, tree nuts, shellfish). Hard conflicts block instant saving until resolved or explicitly overridden for safety.\n• SOFT Conflicts (Amber Alert): Triggered by diet preference mismatches (e.g. dairy or gluten for vegan/keto diets).";
    }

    if (query.includes("substitut") || query.includes("swap") || query.includes("replace")) {
      return "Smart Substitutions & Macro Impact:\n\nReciPeel runs on 44+ pre-seeded substitution rules:\n\n• When a conflict is flagged, click Swap → Alternative.\n• Live Macro Delta: You'll see real-time nutrition changes (e.g. Soy Sauce → Tamari: -40 cal, +0g protein, removes gluten).\n• The total recipe calories, protein, carbs, and fats recalculate automatically!";
    }

    if (query.includes("folder") || query.includes("organize") || query.includes("library") || query.includes("tag")) {
      return "Recipe Library Management:\n\nIn your Recipe Library (/recipes):\n\n1. Filter by Safe For Me or Favorites.\n2. Organize recipes into custom folders (e.g. Quick Weeknights, High Protein Prep).\n3. Add custom tags (e.g. #keto, #20min) to search and sort your library in seconds.";
    }

    if (query.includes("macro") || query.includes("calorie") || query.includes("tdee") || query.includes("onboarding")) {
      return "Mifflin-St Jeor TDEE Calorie Calculation:\n\nDuring Diet Setup (/onboarding), ReciPeel calculates your daily target energy expenditure based on your age, sex, height, weight, and fitness goals:\n\n• Weight Loss: 15-20% caloric deficit.\n• Muscle Gain: 10-15% caloric surplus.\n• Maintenance: Exact TDEE baseline.";
    }

    if (query.includes("peanut") || query.includes("dairy") || query.includes("allergen")) {
      return "Popular Safe Ingredient Swaps:\n\n• Peanut Oil → Avocado Oil or Olive Oil\n• Soy Sauce → Coconut Aminos or Tamari (Gluten-Free)\n• Whole Milk → Almond Milk or Oat Milk\n• Peanut Butter → Sunflower Seed Butter (SunButter)\n• Butter → Olive Oil or Dairy-Free Plant Butter";
    }

    return "SousChef AI Workspace Active\n\nReciPeel simplifies recipe importing, dietary screening, and weekly meal planning. Ask me anything about:\n\n1. Importing video URLs\n2. Screening hard allergies & soft diet warnings\n3. Applying 1-click ingredient swaps\n4. TDEE calories and macro tracking";
  }

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Response copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleClear() {
    setMessages(INITIAL_MESSAGES);
    toast.info("Conversation cleared");
  }

  const filteredPrompts =
    selectedCategory === "all"
      ? SUGGESTED_PROMPTS
      : SUGGESTED_PROMPTS.filter((p) => p.category === selectedCategory);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="mx-auto w-full max-w-6xl px-0 py-0 sm:px-6 sm:py-8 flex-1 flex flex-col">
        {/* Desktop Top Header (Hidden on Mobile for Edge-to-Edge Chat View) */}
        <div className="hidden sm:flex mb-6 flex-wrap items-center justify-between gap-4 border-b border-border/60 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="grid h-9 w-9 place-items-center rounded-full border border-border bg-surface text-muted-foreground hover:text-foreground transition shadow-2xs"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <div className="grid h-6 w-6 place-items-center rounded-lg bg-primary text-primary-foreground">
                  <ChefHat className="h-3.5 w-3.5" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground">SousChef AI Workspace</h1>
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Kitchen Intelligence
                </span>
              </div>
              <p className="text-xs text-muted-foreground">Full-page interactive recipe extraction, dietary screening & macro workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/recipes/import"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-soft hover:shadow-lift transition active:scale-95"
            >
              <Play className="h-3.5 w-3.5" /> Import Video
            </Link>
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3.5 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition cursor-pointer"
            >
              <Trash2 className="h-3.5 w-3.5" /> Reset
            </button>
          </div>
        </div>

        {/* Main Grid: Chat Workspace + Right Quick Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
          {/* Main Chat Panel (Fixed Native Full Screen on Mobile, Inner Scroll Only) */}
          <div className="fixed inset-x-0 top-[57px] bottom-0 z-10 flex flex-col bg-surface border-0 sm:static sm:z-auto sm:border sm:border-border sm:rounded-3xl sm:shadow-lift overflow-hidden sm:h-[600px] lg:h-[calc(100vh-175px)] lg:min-h-[580px] lg:max-h-[740px] lg:col-span-8">
            {/* Category Filter Chips */}
            <div className="p-3 border-b border-border/60 bg-surface-2/60 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`shrink-0 flex items-center gap-1.5 rounded-full px-3.5 py-1 text-xs font-bold transition cursor-pointer ${
                      selectedCategory === cat.id
                        ? "bg-primary text-primary-foreground shadow-2xs"
                        : "border border-border/80 bg-surface text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* Chat Messages Log with inner scrolling ONLY */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 bg-background/40 scroll-smooth">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex items-start gap-3.5 ${m.sender === "user" ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`grid h-8 sm:h-9 w-8 sm:w-9 shrink-0 place-items-center rounded-2xl text-xs font-bold ${
                      m.sender === "user"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary text-primary-foreground shadow-soft"
                    }`}
                  >
                    {m.sender === "user" ? <User className="h-4 w-4" /> : <ChefHat className="h-4.5 w-4.5" />}
                  </div>

                  <div className={`max-w-[85%] sm:max-w-[82%] space-y-1 ${m.sender === "user" ? "text-right" : "text-left"}`}>
                    <div
                      className={`group relative inline-block rounded-3xl p-3.5 sm:p-4 text-xs sm:text-sm leading-relaxed ${
                        m.sender === "user"
                          ? "bg-primary text-primary-foreground font-medium rounded-tr-xs shadow-2xs"
                          : "bg-surface border border-border text-foreground rounded-tl-xs shadow-2xs whitespace-pre-line"
                      }`}
                    >
                      {m.text}

                      {/* Copy action for bot messages */}
                      {m.sender === "bot" && (
                        <button
                          onClick={() => copyToClipboard(m.text, m.id)}
                          className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition grid h-6 w-6 place-items-center rounded-full bg-surface-2 text-muted-foreground hover:text-foreground border border-border/60 cursor-pointer"
                          title="Copy response"
                        >
                          {copiedId === m.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground px-2">{m.timestamp}</p>
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="grid h-8 sm:h-9 w-8 sm:w-9 place-items-center rounded-2xl bg-primary text-primary-foreground">
                    <ChefHat className="h-4.5 w-4.5" />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 shadow-xs">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary delay-100" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-primary delay-200" />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Quick Prompt Suggestions Track */}
            <div className="px-4 sm:px-5 py-3 border-t border-border/40 bg-surface flex flex-col gap-2 shrink-0">
              <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Lightbulb className="h-3.5 w-3.5 text-primary" /> Suggested Questions
                </span>
                <span>Click to ask</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {filteredPrompts.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.text)}
                    className="shrink-0 flex items-center gap-1.5 rounded-full border border-border/80 bg-background px-3.5 sm:px-4 py-1.5 text-xs font-semibold text-muted-foreground hover:border-primary hover:text-primary hover:bg-primary-soft/40 transition cursor-pointer whitespace-nowrap shadow-2xs"
                  >
                    <MessageSquare className="h-3 w-3 text-primary" />
                    {p.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Form Bar (Pinned to bottom of mobile screen with safe-area padding) */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 sm:p-4 bg-surface border-t border-border flex items-center gap-2.5 shrink-0 pb-[max(12px,env(safe-area-inset-bottom))]"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask SousChef AI about recipe imports or macro swaps..."
                className="flex-1 rounded-2xl border border-input bg-background px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15 shadow-xs"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold text-primary-foreground transition disabled:opacity-50 hover:shadow-lift cursor-pointer active:scale-95 shrink-0"
              >
                Send <Send className="h-4 w-4" />
              </button>
            </form>
          </div>

          {/* Right Sidebar Quick Actions & Diet Status (Visible on Desktop) */}
          <div className="hidden lg:flex lg:col-span-4 space-y-6 flex-col lg:h-[calc(100vh-175px)] lg:min-h-[580px] lg:max-h-[740px] lg:overflow-y-auto pr-1 no-scrollbar">
            {/* Active Diet Profile Card */}
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-card space-y-4">
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <div className="flex items-center gap-2 font-display font-bold text-base text-foreground">
                  <ShieldCheck className="h-5 w-5 text-primary" /> Active Safety Profile
                </div>
                <Link href="/onboarding" className="text-[11px] font-bold text-primary hover:underline">
                  Edit
                </Link>
              </div>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between rounded-2xl bg-surface-2 p-3 border border-border/40">
                  <span className="text-muted-foreground font-medium">Allergy Shields:</span>
                  <span className="font-bold text-emerald-600 flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Active (Hard Shield)
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-surface-2 p-3 border border-border/40">
                  <span className="text-muted-foreground font-medium">TDEE Target:</span>
                  <span className="font-bold text-foreground flex items-center gap-1">
                    <Flame className="h-3.5 w-3.5 text-amber-500" /> 2,250 kcal/day
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-surface-2 p-3 border border-border/40">
                  <span className="text-muted-foreground font-medium">Seeded Swaps:</span>
                  <span className="font-bold text-primary flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-primary" /> 44+ Rules Ready
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Kitchen Shortcuts Card */}
            <div className="rounded-3xl border border-border bg-surface p-6 shadow-card space-y-3">
              <h3 className="font-display font-bold text-base text-foreground mb-1">Quick Shortcuts</h3>

              <Link
                href="/recipes/import"
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface-2 p-3 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition"
              >
                <span className="flex items-center gap-2">
                  <Play className="h-4 w-4 text-primary" /> Import Recipe Link
                </span>
                <span>→</span>
              </Link>

              <Link
                href="/recipes"
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface-2 p-3 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition"
              >
                <span className="flex items-center gap-2">
                  <Salad className="h-4 w-4 text-primary" /> My Recipe Library
                </span>
                <span>→</span>
              </Link>

              <Link
                href="/onboarding"
                className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface-2 p-3 text-xs font-semibold text-foreground hover:border-primary hover:text-primary transition"
              >
                <span className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-primary" /> Diet & Macro Setup
                </span>
                <span>→</span>
              </Link>
            </div>

            {/* Pro Tip Card */}
            <div className="rounded-3xl border border-primary/20 bg-primary-soft/50 p-5 text-xs text-muted-foreground space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-primary">
                <Info className="h-4 w-4" /> Pro Tip
              </div>
              <p className="leading-relaxed">
                You can ask SousChef AI to suggest custom ingredient substitutions or meal ideas tailored to your remaining daily macros!
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

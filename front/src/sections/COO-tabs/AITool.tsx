import { useState, useRef, useEffect } from "react";

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

interface AIToolProps {
    isOpen: boolean;
    onClose: () => void;
}

const TypingIndicator = () => (
    <div className="flex items-center gap-1 px-4 py-3">
        <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 rounded-full bg-sky-500 animate-bounce [animation-delay:300ms]" />
    </div>
);

const BotIcon = () => (
    <svg viewBox="0 0 36 36" fill="none" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <rect width="36" height="36" rx="10" fill="url(#botGrad)" />
        <rect x="10" y="13" width="16" height="12" rx="3" fill="#f8fafc" fillOpacity="0.95" />
        <rect x="14" y="17" width="3" height="3" rx="1.5" fill="#3b82f6" />
        <rect x="19" y="17" width="3" height="3" rx="1.5" fill="#3b82f6" />
        <rect x="15" y="21" width="6" height="1.5" rx="0.75" fill="#3b82f6" fillOpacity="0.6" />
        <rect x="16" y="9" width="4" height="4" rx="1" fill="#f8fafc" fillOpacity="0.8" />
        <rect x="17.5" y="8" width="1" height="2" rx="0.5" fill="#f8fafc" fillOpacity="0.6" />
        <defs>
            <linearGradient id="botGrad" x1="0" y1="0" x2="36" y2="36" gradientUnits="userSpaceOnUse">
                <stop stopColor="#3b82f6" />
                <stop offset="1" stopColor="#8b5cf6" />
            </linearGradient>
        </defs>
    </svg>
);

const suggestions = [
    "What are the key OHS regulations I should know?",
    "How do I conduct a risk assessment?",
    "Explain PPE requirements for construction sites",
    "What is the emergency evacuation procedure?",
];

export default function AITool({ isOpen, onClose }: AIToolProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
        if (isOpen && messages.length === 0) {
            setShowSuggestions(true);
        }
    }, [isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isLoading]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;
        setShowSuggestions(false);

        const userMsg: Message = {
            id: crypto.randomUUID(),
            role: "user",
            content: text.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": "Bearer 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",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "arcee-ai/trinity-mini:free",
                    messages: [
                        {
                            role: "system",
                            content: "You are the OHS AI Assistant — an expert in Occupational Health and Safety (OHS). You help users understand workplace safety regulations, risk assessments, PPE requirements, incident reporting, emergency procedures, and compliance. Be concise, professional, and practical. Use bullet points when listing items. Always prioritize worker safety.",
                        },
                        ...messages.map((m) => ({ role: m.role, content: m.content })),
                        { role: "user", content: text.trim() },
                    ],
                }),
            });

            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content ?? "Sorry, I could not get a response. Please try again.";

            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: reply,
                    timestamp: new Date(),
                },
            ]);
        } catch {
            setMessages((prev) => [
                ...prev,
                {
                    id: crypto.randomUUID(),
                    role: "assistant",
                    content: "Connection error. Please check your network and try again.",
                    timestamp: new Date(),
                },
            ]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input);
        }
    };

    const handleNewChat = () => {
        setMessages([]);
        setShowSuggestions(true);
        setInput("");
    };

    const formatContent = (text: string) => {
        return text.split("\n").map((line, i) => (
            <span key={i}>
                {line}
                {i < text.split("\n").length - 1 && <br />}
            </span>
        ));
    };

    const formatTime = (d: Date) =>
        d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ backgroundColor: "rgba(0,0,0,0.25)", backdropFilter: "blur(4px)" }}
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="relative flex flex-col w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl"
                style={{
                    height: "min(85vh, 780px)",
                    background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 60%, #f8fafc 100%)",
                    border: "1px solid rgba(59,130,246,0.15)",
                    boxShadow: "0 0 80px rgba(59,130,246,0.08), 0 25px 60px rgba(0,0,0,0.1)",
                }}
            >
                {/* Ambient glow top */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 rounded-full"
                    style={{ background: "linear-gradient(90deg, transparent, #3b82f6, transparent)" }}
                />

                {/* Header */}
                <div
                    className="flex items-center justify-between px-5 py-4 shrink-0"
                    style={{ borderBottom: "1px solid rgba(59,130,246,0.12)", background: "rgba(59,130,246,0.04)" }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0 shadow-lg" style={{ boxShadow: "0 0 18px rgba(59,130,246,0.25)" }}>
                            <BotIcon />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-900 text-sm tracking-wide" style={{ fontFamily: "'DM Sans', sans-serif", letterSpacing: "0.03em" }}>
                                    OHS AI ASSISTANT
                                </span>
                                <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Online
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-0.5">Occupational Health & Safety Expert</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleNewChat}
                            className="flex items-center gap-1.5 text-xs text-sky-600 hover:text-sky-700 border border-sky-300 hover:border-sky-400 px-3 py-1.5 rounded-lg transition-all duration-200 hover:bg-sky-50"
                        >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            New Chat
                        </button>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-900/5 transition-all duration-200"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(59,130,246,0.2) transparent" }}>
                    {messages.length === 0 && showSuggestions && (
                        <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-6">
                            <div>
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl overflow-hidden shadow-xl" style={{ boxShadow: "0 0 40px rgba(59,130,246,0.2)" }}>
                                    <BotIcon />
                                </div>
                                <h3 className="text-slate-900 text-lg font-semibold mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                                    How can I help you today?
                                </h3>
                                <p className="text-slate-600 text-sm">Ask me anything about workplace health & safety</p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                                {suggestions.map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => sendMessage(s)}
                                        className="text-left text-xs text-slate-700 hover:text-slate-900 px-3 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02]"
                                        style={{
                                            background: "rgba(59,130,246,0.08)",
                                            border: "1px solid rgba(59,130,246,0.2)",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.14)")}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.08)")}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {messages.map((msg) => (
                        <div key={msg.id} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                            {msg.role === "assistant" && (
                                <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 mt-1" style={{ boxShadow: "0 0 12px rgba(59,130,246,0.2)" }}>
                                    <BotIcon />
                                </div>
                            )}
                            <div className={`max-w-[78%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-1`}>
                                <div
                                    className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
                                    style={
                                        msg.role === "user"
                                            ? {
                                                background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                                                color: "white",
                                                borderBottomRightRadius: "6px",
                                            }
                                            : {
                                                background: "#f8fafc",
                                                border: "1px solid rgba(59,130,246,0.15)",
                                                color: "#1e293b",
                                                borderBottomLeftRadius: "6px",
                                            }
                                    }
                                >
                                    {formatContent(msg.content)}
                                </div>
                                <span className="text-[10px] text-slate-500 px-1">{formatTime(msg.timestamp)}</span>
                            </div>
                        </div>
                    ))}

                    {isLoading && (
                        <div className="flex gap-3">
                            <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 mt-1" style={{ boxShadow: "0 0 12px rgba(59,130,246,0.2)" }}>
                                <BotIcon />
                            </div>
                            <div
                                className="rounded-2xl"
                                style={{
                                    background: "#f8fafc",
                                    border: "1px solid rgba(59,130,246,0.15)",
                                    borderBottomLeftRadius: "6px",
                                }}
                            >
                                <TypingIndicator />
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="px-4 pb-4 pt-3 shrink-0" style={{ borderTop: "1px solid rgba(59,130,246,0.1)" }}>
                    <div
                        className="flex items-end gap-3 rounded-xl px-4 py-3"
                        style={{
                            background: "#ffffff",
                            border: "1px solid rgba(59,130,246,0.2)",
                            transition: "border-color 0.2s",
                        }}
                        onFocus={() => { }}
                    >
                        <textarea
                            ref={inputRef}
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about OHS regulations, safety procedures..."
                            rows={1}
                            className="flex-1 bg-transparent text-sm text-slate-900 placeholder-slate-400 resize-none outline-none leading-relaxed"
                            style={{ maxHeight: "120px", fontFamily: "'DM Sans', sans-serif" }}
                            onInput={(e) => {
                                const t = e.currentTarget;
                                t.style.height = "auto";
                                t.style.height = Math.min(t.scrollHeight, 120) + "px";
                            }}
                        />
                        <button
                            onClick={() => sendMessage(input)}
                            disabled={!input.trim() || isLoading}
                            className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            style={{
                                background: input.trim() && !isLoading ? "linear-gradient(135deg, #3b82f6, #8b5cf6)" : "rgba(59,130,246,0.15)",
                                boxShadow: input.trim() && !isLoading ? "0 0 16px rgba(59,130,246,0.3)" : "none",
                            }}
                        >
                            <svg className="w-4 h-4 text-white translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </button>
                    </div>
                    <p className="text-center text-[10px] text-slate-600 mt-2">
                        OHS AI Assistant · Press <kbd className="text-slate-500">Enter</kbd> to send · <kbd className="text-slate-500">Shift+Enter</kbd> for new line
                    </p>
                </div>
            </div>
        </div>
    );
}
import { useState, useRef, useEffect } from "react";
import { Send, User, Sparkles } from "lucide-react";
import logo from "@/image/arogya.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
    id: string;
    text: string;
    sender: "user" | "bot";
    timestamp: Date;
}

export const HeroChat = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Hello! I'm your Aarogya AI Health Assistant. I can provide general health information and guidance. How can I help you today?",
            sender: "bot",
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: "user",
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsTyping(true);

        try {
            // Call the actual backend AI API
            const response = await fetch("http://localhost:8000/api/ai/chat/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: userMsg.text,
                    history: messages.slice(-10).map(m => ({
                        role: m.sender === "user" ? "user" : "assistant",
                        content: m.text
                    }))
                }),
            });

            if (response.ok) {
                const data = await response.json();
                const botMsg: Message = {
                    id: (Date.now() + 1).toString(),
                    text: data.reply || "I'm here to help! How can I assist you today?",
                    sender: "bot",
                    timestamp: new Date(),
                };
                setMessages((prev) => [...prev, botMsg]);
            } else {
                throw new Error("Failed to get response");
            }
        } catch (error) {
            console.error("Chat error:", error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: "I'm having trouble connecting right now. Please try again or contact our support team.",
                sender: "bot",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSend();
        }
    };

    return (
        <Card className="w-full h-[500px] flex flex-col shadow-2xl border-primary/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <CardHeader className="p-4 border-b bg-primary/5">
                <CardTitle className="flex items-center gap-2 text-primary">
                    <div className="h-9 w-9 overflow-hidden flex items-center justify-center">
                        <img src={logo} alt="Logo" className="h-full w-full object-contain" />
                    </div>
                    <div>
                        <span className="block text-lg">Aarogya AI Assistant</span>
                        <span className="block text-xs font-normal text-muted-foreground flex items-center gap-1">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                            </span>
                            Online
                        </span>
                    </div>
                </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 p-0 flex flex-col overflow-hidden">
                <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        <AnimatePresence initial={false}>
                            {messages.map((message) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                                >
                                    <div className={`flex gap-2 max-w-[80%] ${message.sender === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${message.sender === "user" ? "bg-primary text-primary-foreground" : ""
                                            }`}>
                                            {message.sender === "user" ? <User className="h-4 w-4" /> : <img src={logo} alt="Bot" className="h-full w-full object-contain" />}
                                        </div>
                                        <div className={`p-3 rounded-2xl text-sm whitespace-pre-wrap ${message.sender === "user"
                                            ? "bg-primary text-primary-foreground rounded-tr-none"
                                            : "bg-muted/50 border border-border rounded-tl-none"
                                            }`}>
                                            {message.text}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start"
                            >
                                <div className="flex gap-2 max-w-[80%]">
                                    <div className="h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        <img src={logo} alt="Bot" className="h-full w-full object-contain" />
                                    </div>
                                    <div className="bg-muted/50 border border-border p-3 rounded-2xl rounded-tl-none flex items-center gap-1">
                                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-background/50">
                    <div className="flex gap-2">
                        <Input
                            placeholder="Ask about appointments, doctors..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className="flex-1"
                        />
                        <Button size="icon" onClick={handleSend} disabled={!inputValue.trim() || isTyping}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

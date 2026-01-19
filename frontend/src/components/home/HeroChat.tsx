import { useState, useRef, useEffect } from "react";
import { Send, Bot, User, Sparkles } from "lucide-react";
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
            text: "Hello! I'm your Arogya AI Assistant. I can help you find doctors, understand our services, or guide you to the login. How can I help today?",
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

        // Simulate AI delay and response
        setTimeout(() => {
            const lowerText = userMsg.text.toLowerCase();
            let botResponse = "I can help you with appointments, finding doctors, or checking your records. Please log in for personalized care.";

            if (lowerText.includes("book") || lowerText.includes("appointment")) {
                botResponse = "To book an appointment, please register or log in to the Patient Portal. It's quick and easy!";
            } else if (lowerText.includes("login") || lowerText.includes("sign in")) {
                botResponse = "You can log in using the 'Patient Portal' or 'Staff Login' buttons at the top of the page.";
            } else if (lowerText.includes("doctor") || lowerText.includes("specialist")) {
                botResponse = "We have specialists in Cardiology, Neurology, Pediatrics, and more. Check our 'Departments' section below.";
            } else if (lowerText.includes("sick") || lowerText.includes("pain") || lowerText.includes("fever") || lowerText.includes("symptom")) {
                botResponse = "I'm sorry you're feeling unwell. Please log in to use our AI Symptom Checker or visit our Emergency department immediately if it's critical.";
            } else if (lowerText.includes("hello") || lowerText.includes("hi")) {
                botResponse = "Hello there! How can I assist you with your health journey today?";
            }

            const botMsg: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponse,
                sender: "bot",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMsg]);
            setIsTyping(false);
        }, 1500);
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
                    <div className="p-2 rounded-lg bg-primary/10">
                        <Bot className="h-6 w-6" />
                    </div>
                    <div>
                        <span className="block text-lg">Arogya Assistant</span>
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
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                                            }`}>
                                            {message.sender === "user" ? <User className="h-4 w-4" /> : <Sparkles className="h-4 w-4 text-primary" />}
                                        </div>
                                        <div className={`p-3 rounded-2xl text-sm ${message.sender === "user"
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
                                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                                        <Bot className="h-4 w-4 text-muted-foreground" />
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

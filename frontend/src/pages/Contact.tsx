import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        toast({
            title: "Message Sent!",
            description: "We'll get back to you as soon as possible.",
        });
        setFormData({ name: "", email: "", subject: "", message: "" });
    };

    const contactInfo = [
        {
            icon: Phone,
            title: "Phone",
            details: ["+1 (555) 123-4567", "Emergency: +1 (555) 911-0000"],
        },
        {
            icon: Mail,
            title: "Email",
            details: ["info@aarogya.health", "support@aarogya.health"],
        },
        {
            icon: MapPin,
            title: "Address",
            details: ["123 Healthcare Avenue", "Medical City, MC 12345"],
        },
        {
            icon: Clock,
            title: "Hours",
            details: ["Emergency: 24/7", "OPD: Mon-Sat, 8AM-8PM"],
        },
    ];

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">
                {/* Hero Section */}
                <section className="py-20 gradient-hero">
                    <div className="container">
                        <motion.div
                            className="text-center max-w-3xl mx-auto"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            <h1 className="text-4xl lg:text-5xl font-bold text-foreground mb-6">
                                Get in Touch
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Have questions? We're here to help. Reach out to us anytime.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Contact Info Cards */}
                <section className="py-20 bg-background">
                    <div className="container">
                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                            {contactInfo.map((info, index) => {
                                const Icon = info.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.1 }}
                                    >
                                        <Card className="h-full text-center hover:shadow-lg transition-all">
                                            <CardContent className="p-6">
                                                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                                                    <Icon className="h-6 w-6 text-primary-foreground" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                                    {info.title}
                                                </h3>
                                                {info.details.map((detail, idx) => (
                                                    <p key={idx} className="text-sm text-muted-foreground">
                                                        {detail}
                                                    </p>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Contact Form */}
                        <div className="grid lg:grid-cols-2 gap-12">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-3xl font-bold text-foreground mb-4">Send us a Message</h2>
                                <p className="text-muted-foreground mb-6">
                                    Fill out the form below and we'll get back to you within 24 hours.
                                </p>

                                <Card>
                                    <CardContent className="p-6">
                                        <form onSubmit={handleSubmit} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    placeholder="Your full name"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    placeholder="your.email@example.com"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="subject">Subject</Label>
                                                <Input
                                                    id="subject"
                                                    placeholder="What is this regarding?"
                                                    value={formData.subject}
                                                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="message">Message</Label>
                                                <Textarea
                                                    id="message"
                                                    placeholder="Your message..."
                                                    rows={5}
                                                    value={formData.message}
                                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                                    required
                                                />
                                            </div>

                                            <Button type="submit" className="w-full" size="lg">
                                                <Send className="mr-2 h-4 w-4" />
                                                Send Message
                                            </Button>
                                        </form>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                className="relative"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="sticky top-24">
                                    <h2 className="text-3xl font-bold text-foreground mb-4">Visit Us</h2>
                                    <p className="text-muted-foreground mb-6">
                                        Our hospital is conveniently located in the heart of Medical City.
                                    </p>

                                    <div className="aspect-video rounded-lg bg-muted flex items-center justify-center mb-6">
                                        <MapPin className="h-16 w-16 text-muted-foreground" />
                                    </div>

                                    <Card>
                                        <CardContent className="p-6">
                                            <h3 className="font-semibold text-foreground mb-4">Emergency?</h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                For medical emergencies, please call our emergency hotline or visit our
                                                emergency department immediately.
                                            </p>
                                            <Button variant="destructive" className="w-full" size="lg">
                                                <Phone className="mr-2 h-4 w-4" />
                                                Call Emergency: +1 (555) 911-0000
                                            </Button>
                                        </CardContent>
                                    </Card>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Contact;

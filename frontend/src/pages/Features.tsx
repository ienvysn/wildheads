import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
    Calendar,
    Clock,
    Shield,
    Stethoscope,
    Activity,
    Brain,
    FileText,
    Users,
    Smartphone,
    Lock,
    Bell,
    Zap,
} from "lucide-react";

const Features = () => {
    const features = [
        {
            icon: Calendar,
            title: "Smart Appointment Scheduling",
            description:
                "Book appointments online with your preferred doctor. Our AI suggests the best time slots based on your schedule and doctor availability.",
        },
        {
            icon: Brain,
            title: "AI Health Assistant",
            description:
                "Get instant health guidance from our AI-powered assistant. Available 24/7 to answer your health questions and provide general medical information.",
        },
        {
            icon: Shield,
            title: "Secure Medical Records",
            description:
                "Your medical records are encrypted and securely stored with enterprise-grade security. Access them anytime, anywhere with complete privacy.",
        },
        {
            icon: Stethoscope,
            title: "Expert Specialists",
            description:
                "Connect with experienced doctors across multiple specialties. Our team provides world-class healthcare services with personalized care.",
        },
        {
            icon: Activity,
            title: "Real-time Vitals Monitoring",
            description:
                "Track your health metrics in real-time. Blood pressure, heart rate, temperature, and more—all in one dashboard.",
        },
        {
            icon: FileText,
            title: "Digital Prescriptions",
            description:
                "Receive and manage prescriptions digitally. Track medication schedules and get reminders for timely intake.",
        },
        {
            icon: Clock,
            title: "Instant Notifications",
            description:
                "Get real-time updates about appointments, test results, and prescriptions. Never miss an important health update.",
        },
        {
            icon: Users,
            title: "Family Health Management",
            description:
                "Manage health records for your entire family from one account. Easy access to everyone's medical history.",
        },
        {
            icon: Smartphone,
            title: "Mobile-First Design",
            description:
                "Access your health dashboard from any device. Responsive design ensures a seamless experience on mobile, tablet, or desktop.",
        },
        {
            icon: Lock,
            title: "HIPAA Compliant",
            description:
                "We follow strict healthcare data protection standards. Your privacy and data security are our top priorities.",
        },
        {
            icon: Bell,
            title: "Smart Reminders",
            description:
                "Automated reminders for appointments, medication, and follow-ups. Never forget an important health task.",
        },
        {
            icon: Zap,
            title: "Lightning Fast",
            description:
                "Optimized performance ensures quick loading times and smooth interactions. Your time is valuable.",
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
                                Powerful Features for Modern Healthcare
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Discover how Aarogya combines cutting-edge AI technology with compassionate care
                                to deliver an exceptional healthcare experience.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="py-20 bg-background">
                    <div className="container">
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, index) => {
                                const Icon = feature.icon;
                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1">
                                            <CardContent className="p-6">
                                                <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                                                    <Icon className="h-6 w-6 text-primary-foreground" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                                    {feature.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">{feature.description}</p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default Features;

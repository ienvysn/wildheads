import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Heart, Users, Award, Target, Shield, Zap } from "lucide-react";

const About = () => {
    const values = [
        {
            icon: Heart,
            title: "Patient-Centered Care",
            description: "We put patients first in everything we do, ensuring compassionate and personalized healthcare.",
        },
        {
            icon: Shield,
            title: "Trust & Security",
            description: "Your health data is protected with enterprise-grade security and strict privacy standards.",
        },
        {
            icon: Zap,
            title: "Innovation",
            description: "Leveraging cutting-edge AI technology to deliver smarter, faster healthcare solutions.",
        },
        {
            icon: Award,
            title: "Excellence",
            description: "Committed to maintaining the highest standards of medical care and service quality.",
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
                                About Aarogya
                            </h1>
                            <p className="text-lg text-muted-foreground">
                                Transforming healthcare through AI-powered innovation and compassionate care.
                            </p>
                        </motion.div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="py-20 bg-background">
                    <div className="container">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
                                <p className="text-muted-foreground mb-4">
                                    At Aarogya, we're on a mission to make quality healthcare accessible to everyone through
                                    technology. We believe that healthcare should be simple, efficient, and patient-centered.
                                </p>
                                <p className="text-muted-foreground mb-4">
                                    Our AI-integrated hospital management system combines the best of modern technology with
                                    the human touch of compassionate care. We empower patients to take control of their health
                                    journey while providing healthcare professionals with powerful tools to deliver better care.
                                </p>
                                <p className="text-muted-foreground">
                                    Founded in 2024, we've already helped thousands of patients and healthcare providers
                                    streamline their healthcare experience. Our commitment to innovation and excellence
                                    drives us to continuously improve and expand our services.
                                </p>
                            </motion.div>

                            <motion.div
                                className="relative"
                                initial={{ opacity: 0, x: 20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                            >
                                <div className="aspect-square rounded-2xl gradient-primary p-12 flex items-center justify-center">
                                    <Users className="h-48 w-48 text-primary-foreground opacity-20" />
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-20 bg-muted/50">
                    <div className="container">
                        <motion.div
                            className="text-center mb-12"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                                Our Core Values
                            </h2>
                            <p className="text-muted-foreground max-w-2xl mx-auto">
                                The principles that guide everything we do
                            </p>
                        </motion.div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {values.map((value, index) => {
                                const Icon = value.icon;
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
                                                <div className="h-16 w-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4">
                                                    <Icon className="h-8 w-8 text-primary-foreground" />
                                                </div>
                                                <h3 className="text-lg font-semibold text-foreground mb-2">
                                                    {value.title}
                                                </h3>
                                                <p className="text-sm text-muted-foreground">{value.description}</p>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-20 bg-background">
                    <div className="container">
                        <div className="grid md:grid-cols-4 gap-8 text-center">
                            {[
                                { value: "15+", label: "Years of Excellence" },
                                { value: "200+", label: "Expert Doctors" },
                                { value: "50K+", label: "Happy Patients" },
                                { value: "24/7", label: "Emergency Care" },
                            ].map((stat, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <p className="text-4xl lg:text-5xl font-bold text-primary mb-2">{stat.value}</p>
                                    <p className="text-muted-foreground">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
};

export default About;

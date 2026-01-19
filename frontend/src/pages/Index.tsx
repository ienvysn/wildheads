import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  Shield, 
  Stethoscope, 
  Heart, 
  Brain, 
  Baby, 
  Bone, 
  Eye,
  Activity,
  Users,
  Award,
  ChevronRight
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Calendar,
      title: "Easy Scheduling",
      description: "Book appointments online in just a few clicks. Choose your preferred doctor and time slot."
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Get instant notifications about your appointments, test results, and prescriptions."
    },
    {
      icon: Shield,
      title: "Secure Records",
      description: "Your medical records are encrypted and securely stored. Access them anytime, anywhere."
    },
    {
      icon: Stethoscope,
      title: "Expert Doctors",
      description: "Our team of experienced specialists provides world-class healthcare services."
    }
  ];

  const departments = [
    { icon: Heart, name: "Cardiology", doctors: 8 },
    { icon: Brain, name: "Neurology", doctors: 6 },
    { icon: Baby, name: "Pediatrics", doctors: 10 },
    { icon: Bone, name: "Orthopedics", doctors: 7 },
    { icon: Eye, name: "Ophthalmology", doctors: 5 },
    { icon: Activity, name: "Emergency", doctors: 12 },
  ];

  const stats = [
    { value: "15+", label: "Years of Excellence" },
    { value: "200+", label: "Expert Doctors" },
    { value: "50K+", label: "Happy Patients" },
    { value: "24/7", label: "Emergency Care" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="container py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
                <Award className="h-4 w-4" />
                Trusted Healthcare Provider
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                Modern Healthcare at Your{" "}
                <span className="text-primary">Fingertips</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl">
                Experience seamless healthcare management with our integrated system. 
                Book appointments, access records, and connect with top specialists—all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="shadow-primary" onClick={() => navigate("/register")}>
                  Book Appointment
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate("/login")}>
                  Patient Portal
                </Button>
              </div>
            </motion.div>

            <motion.div 
              className="relative hidden lg:block"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="relative z-10">
                <div className="w-full aspect-square max-w-lg mx-auto rounded-3xl gradient-primary p-1">
                  <div className="w-full h-full rounded-3xl bg-background flex items-center justify-center">
                    <div className="text-center p-8">
                      <div className="h-24 w-24 rounded-2xl gradient-primary mx-auto mb-6 flex items-center justify-center">
                        <Heart className="h-12 w-12 text-primary-foreground" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">MediCare Hospital</h3>
                      <p className="text-muted-foreground">Your Health, Our Priority</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-info/10 rounded-full blur-3xl" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-primary">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <p className="text-3xl lg:text-4xl font-bold text-primary-foreground">{stat.value}</p>
                <p className="text-sm text-primary-foreground/80">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Why Choose MediCare?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We combine cutting-edge technology with compassionate care to deliver 
              the best healthcare experience for you and your family.
            </p>
          </motion.div>

          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="h-full border-0 shadow-md hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="h-12 w-12 rounded-lg gradient-primary flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Departments Section */}
      <section id="departments" className="py-20 bg-muted/50">
        <div className="container">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Our Departments
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Comprehensive healthcare services across multiple specialties, 
              staffed by experienced professionals.
            </p>
          </motion.div>

          <motion.div 
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {departments.map((dept, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="group cursor-pointer border-0 shadow-md hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-6 flex items-center gap-4">
                    <div className="h-14 w-14 rounded-xl bg-primary/10 group-hover:gradient-primary flex items-center justify-center transition-all">
                      <dept.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{dept.name}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {dept.doctors} Specialists
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground ml-auto group-hover:text-primary transition-colors" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-20">
        <div className="container">
          <motion.div 
            className="relative rounded-3xl overflow-hidden gradient-primary p-12 lg:p-16 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Experience Better Healthcare?
              </h2>
              <p className="text-primary-foreground/80 max-w-2xl mx-auto mb-8">
                Join thousands of patients who trust MediCare for their healthcare needs. 
                Register today and take control of your health journey.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  variant="secondary"
                  onClick={() => navigate("/register")}
                >
                  Register as Patient
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
                  onClick={() => navigate("/login")}
                >
                  Staff Login
                </Button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;

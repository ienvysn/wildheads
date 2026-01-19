import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, Stethoscope, Mail, Lock, Phone, User, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { authApi } from "@/services/api";
import logo from "@/image/arogya.png";

type RegisterRole = "hospital" | "doctor" | "patient";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [role, setRole] = useState<RegisterRole | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "", // Hospital Name or Doctor Full Name
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    hospitalId: "", // For doctors
    licenseNumber: "", // For doctors
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Universal Demo Register: Persist user info for login
      const users = JSON.parse(localStorage.getItem("demo_users") || "[]");
      users.push({
        name: formData.name,
        email: formData.email,
        role: role,
        password: formData.password
      });
      localStorage.setItem("demo_users", JSON.stringify(users));

      navigate("/login");
    } catch (error: any) {
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Banner */}
      <div className="hidden lg:flex flex-col justify-center items-center gradient-primary text-primary-foreground p-12 relative overflow-hidden">
        <div className="relative z-10 text-center max-w-lg">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-24 w-24 rounded-3xl bg-white flex items-center justify-center mx-auto mb-8 shadow-2xl overflow-hidden p-2">
              <img src={logo} alt="Arogya Logo" className="mt-3 h-full w-full object-contain" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-4xl font-bold mb-4">Join Arogya Service</h1>
            <p className="text-lg opacity-90">
              Connect with the ultimate healthcare ecosystem. {role === 'doctor' ? "Join as an expert to provide care." : "Join as a hospital to manage operations."}
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Right Form Area */}
      <div className="flex items-center justify-center p-6 bg-background overflow-y-auto">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {!role ? (
              <motion.div
                key="role-selection"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold tracking-tight">Create an Account</h2>
                  <p className="text-muted-foreground mt-2">Select your role to get started</p>
                </div>

                <div className="grid gap-4">
                  <Card
                    className="cursor-pointer hover:border-primary transition-all hover:bg-primary/5 group"
                    onClick={() => setRole("hospital")}
                  >
                    <CardHeader className="flex flex-row items-center gap-4 py-4">
                      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Hospital</CardTitle>
                        <CardDescription>Register your medical facility</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>

                  <Card
                    className="cursor-pointer hover:border-success transition-all hover:bg-success/5 group"
                    onClick={() => setRole("doctor")}
                  >
                    <CardHeader className="flex flex-row items-center gap-4 py-4">
                      <div className="h-12 w-12 rounded-xl bg-success/10 flex items-center justify-center group-hover:bg-success group-hover:text-white transition-colors">
                        <Stethoscope className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Doctor</CardTitle>
                        <CardDescription>Join as a healthcare professional</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </div>

                <div className="text-center space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Joining as a staff member? <br />
                    <span className="text-primary font-medium">Hospitals and Doctors can register their facilities.</span>
                  </p>
                  <p className="text-sm">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="registration-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => setRole(null)}
                  className="mb-4 -ml-2 text-muted-foreground hover:text-foreground"
                >
                  ← Change Role
                </Button>

                <Card className="border-0 shadow-lg">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-2xl">
                      {role === "hospital" ? "Hospital Registration" : role === "doctor" ? "Doctor Registration" : "Patient Registration"}
                    </CardTitle>
                    <CardDescription>Fill in your details to create an account</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          {role === "hospital" ? "Hospital Name *" : "Full Name *"}
                        </Label>
                        <div className="relative">
                          <Input
                            id="name"
                            name="name"
                            placeholder={role === "hospital" ? "City General Hospital" : "Dr. John Doe"}
                            value={formData.name}
                            onChange={handleChange}
                            className="pl-10"
                            required
                            disabled={isLoading}
                          />
                          <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <div className="relative">
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="contact@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            className="pl-10"
                            required
                            disabled={isLoading}
                          />
                          <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="relative">
                          <Input
                            id="phone"
                            name="phone"
                            type="tel"
                            placeholder="+1 (555) 123-4567"
                            value={formData.phone}
                            onChange={handleChange}
                            className="pl-10"
                            disabled={isLoading}
                          />
                          <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      {role === "doctor" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="licenseNumber">Medical License Number *</Label>
                            <Input
                              id="licenseNumber"
                              name="licenseNumber"
                              placeholder="MD-12345678"
                              value={formData.licenseNumber}
                              onChange={handleChange}
                              required
                              disabled={isLoading}
                            />
                          </div>
                        </>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="password">Password *</Label>
                        <div className="relative">
                          <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Min. 8 characters"
                            value={formData.password}
                            onChange={handleChange}
                            className="pl-10"
                            required
                            disabled={isLoading}
                          />
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">Confirm Password *</Label>
                        <div className="relative">
                          <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Re-enter password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="pl-10"
                            required
                            disabled={isLoading}
                          />
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>

                      <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                        {isLoading ? (
                          <>
                            <Spinner size="sm" className="mr-2" />
                            Creating Account...
                          </>
                        ) : (
                          "Register"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Register;

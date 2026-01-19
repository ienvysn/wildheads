import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, User, Mail, Lock, Phone, Calendar, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { authApi } from "@/services/api";
import { usePatientStore } from "@/store";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setPatientId } = usePatientStore();
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPatientId, setGeneratedPatientId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    address: "",
    password: "",
    confirmPassword: "",
  });

  // Generate Patient ID
  const generatePatientId = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(100000 + Math.random() * 900000);
    return `PID-${year}-${random}`;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
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

    if (formData.password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Generate Patient ID
      const patientId = generatePatientId();
      setGeneratedPatientId(patientId);
      setPatientId(patientId);

      // Register user
      const response = await authApi.register({
        username: formData.email.split('@')[0], // Use email prefix as username
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: "patient",
        patient_id: patientId,
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth,
        address: formData.address,
      });

      toast({
        title: "Registration Successful!",
        description: `Your Patient ID is: ${patientId}. Please save it for future reference.`,
      });

      // Show success modal with Patient ID
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast({
        title: "Registration Failed",
        description: error.response?.data?.detail || error.response?.data?.email?.[0] || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-20 w-20 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-6">
              <Heart className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-primary-foreground mb-4">Join Aarogya</h1>
            <p className="text-primary-foreground/80 text-lg max-w-md">
              Register now to access world-class healthcare services with AI-powered assistance.
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Right Panel - Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background overflow-y-auto">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                <Heart className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">Aarogya</span>
            </div>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Patient Registration</CardTitle>
              <CardDescription>Create your account to get started</CardDescription>
            </CardHeader>
            <CardContent>
              {generatedPatientId && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-800">
                    Your Patient ID: <span className="font-bold">{generatedPatientId}</span>
                  </p>
                  <p className="text-xs text-green-600 mt-1">
                    Please save this ID for future reference
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name *</Label>
                    <div className="relative">
                      <Input
                        id="firstName"
                        name="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="pl-10"
                        required
                        disabled={isLoading}
                      />
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Phone */}
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

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth">Date of Birth</Label>
                  <div className="relative">
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={isLoading}
                    />
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Address */}
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <Input
                      id="address"
                      name="address"
                      placeholder="123 Main St, City, State"
                      value={formData.address}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={isLoading}
                    />
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="At least 8 characters"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Confirm Password */}
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

                {/* Submit Button */}
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

                {/* Login Link */}
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/login" className="text-primary font-medium hover:underline">
                    Login Here
                  </Link>
                </p>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/" className="hover:text-foreground transition-colors">
              ← Back to Home
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, ShieldCheck, Stethoscope, UserCog, User, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";

import { useAuth, UserRole } from "@/context/AuthContext";

const roleConfig = {
  admin: {
    icon: UserCog,
    label: "Hospital Admin",
    color: "bg-primary/10 border-primary text-primary",
    route: "/admin/dashboard"
  },
  doctor: {
    icon: Stethoscope,
    label: "Doctor",
    color: "bg-success/10 border-success text-success",
    route: "/doctor/dashboard"
  },
  nurse: {
    icon: ShieldCheck,
    label: "Nurse",
    color: "bg-info/10 border-info text-info",
    route: "/nurse/dashboard"
  },
  patient: {
    icon: User,
    label: "Patient",
    color: "bg-warning/10 border-warning text-warning",
    route: "/patient/dashboard"
  },
};

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [skipAnimation, setSkipAnimation] = useState(false);
  const [role, setRole] = useState<UserRole>("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Login with backend
      await login(email, password);

      // After successful login, get user profile to determine role
      // The AuthContext already fetches the profile, so we can access it
      // We'll use a small delay to ensure state is updated
      setTimeout(() => {
        // Get the user data from localStorage or context
        const token = localStorage.getItem("access_token");
        if (token) {
          // Fetch user profile to get actual role
          import("@/services/api").then(({ authApi }) => {
            authApi.getProfile().then((response) => {
              const userRole = response.data.role as UserRole;
              const targetRoute = roleConfig[userRole]?.route || "/";
              navigate(targetRoute);
            }).catch(() => {
              // Fallback to selected role if profile fetch fails
              navigate(roleConfig[role].route);
            });
          });
        }
      }, 200);
    } catch (error) {
      // Error handling is done in AuthContext
      console.error("Login error:", error);
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
            <h1 className="text-4xl font-bold text-primary-foreground mb-4">Arogya</h1>
            <p className="text-primary-foreground/80 text-lg max-w-md">
              Your trusted partner in healthcare management. Access your dashboard securely.
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
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
              <span className="text-2xl font-bold text-foreground">Arogya</span>
            </div>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Role Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Select Your Role</Label>
                  <RadioGroup
                    value={role}
                    onValueChange={(value) => setRole(value as UserRole)}
                    className="grid grid-cols-2 gap-3"
                  >
                    {(Object.keys(roleConfig) as UserRole[]).map((roleKey) => {
                      const config = roleConfig[roleKey];
                      const Icon = config.icon;
                      const isSelected = role === roleKey;

                      return (
                        <Label
                          key={roleKey}
                          htmlFor={roleKey}
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${isSelected
                            ? config.color + " border-current"
                            : "border-border hover:border-muted-foreground/30"
                            }`}
                        >
                          <RadioGroupItem value={roleKey} id={roleKey} className="sr-only" />
                          <Icon className="h-5 w-5" />
                          <span className="text-sm font-medium">{config.label}</span>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label>{role === "patient" ? "Patient ID" : "Email Address"}</Label>
                  <div className="relative">
                    <Input
                      type={role === "patient" ? "text" : "email"}
                      placeholder={role === "patient" ? "PID-2026-001" : "name@arogya.com"}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="remember"
                      checked={rememberMe}
                      onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    />
                    <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                      Remember me
                    </Label>
                  </div>
                  <Button variant="link" className="px-0 text-sm text-primary">
                    Forgot Password?
                  </Button>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>

                {/* Register Link */}
                <p className="text-center text-sm text-muted-foreground">
                  New patient?{" "}
                  <Link to="/register" className="text-primary font-medium hover:underline">
                    Register Here
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

export default Login;

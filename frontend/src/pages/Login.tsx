import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Building2, Stethoscope, User, Lock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import logo from "@/image/arogya.png";

import { useAuth, UserRole } from "@/context/AuthContext";

const roleConfig = {
  admin: {
    icon: Building2,
    label: "Hospital",
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
  const [role, setRole] = useState<UserRole>("patient");
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!usernameOrEmail || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await login(usernameOrEmail, password);

      setTimeout(() => {
        const token = localStorage.getItem("access_token");
        if (token) {
          import("@/services/api").then(({ authApi }) => {
            authApi.getProfile().then((response) => {
              const userRole = response.data.role as UserRole;
              const targetRoute = roleConfig[userRole]?.route || "/";
              navigate(targetRoute);
            }).catch(() => {
              navigate("/");
            });
          });
        }
      }, 200);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 gradient-primary items-center justify-center p-12 relative overflow-hidden">
        <div className="relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="h-24 w-24 rounded-3xl bg-white flex items-center justify-center mx-auto mb-6 shadow-2xl overflow-hidden p-2">
              <img src={logo} alt="Arogya Logo" className="mt-4 max-h-full max-w-full object-contain" />
            </div>
            <h1 className="text-4xl font-bold text-primary-foreground mb-4">Arogya</h1>
            <p className="text-primary-foreground/80 text-lg max-w-md">
              Secure healthcare management platform. Access your personalized dashboard.
            </p>
          </motion.div>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-background">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="lg:hidden flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <div className="h-16 w-16 flex items-center justify-center overflow-hidden">
                <img src={logo} alt="Arogya Logo" className="h-full w-full object-contain" />
              </div>
              <span className="text-2xl font-bold text-foreground">Arogya</span>
            </div>
          </div>

          <Card className="border-0 shadow-lg">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl">Welcome Back</CardTitle>
              <CardDescription>Sign in to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-3">
                  <Label className="text-sm font-medium">I am a...</Label>
                  <RadioGroup
                    value={role}
                    onValueChange={(value) => setRole(value as UserRole)}
                    className="grid grid-cols-4 gap-2"
                  >
                    {(Object.keys(roleConfig) as UserRole[]).map((roleKey) => {
                      const config = roleConfig[roleKey];
                      const Icon = config.icon;
                      const isSelected = role === roleKey;
                      return (
                        <Label
                          key={roleKey}
                          htmlFor={roleKey}
                          className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all ${isSelected
                            ? config.color + " border-current"
                            : "border-border hover:border-muted-foreground/30 hover:bg-muted/50"
                            }`}
                        >
                          <RadioGroupItem value={roleKey} id={roleKey} className="sr-only" />
                          <Icon className="h-5 w-5" />
                          <span className="text-[10px] font-bold uppercase tracking-wider">{config.label}</span>
                        </Label>
                      );
                    })}
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label>Username or Email</Label>
                  <div className="relative">
                    <Input
                      type="text"
                      placeholder="Username, Email or Patient ID"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    You can sign in with your username, email, or patient ID.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Button variant="link" className="px-0 h-auto text-xs text-primary">
                      Forgot Password?
                    </Button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  </div>
                </div>

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

                <p className="text-center text-sm text-muted-foreground">
                  Need an account?{" "}
                  <Link to="/register" className="text-primary font-medium hover:underline">
                    Register Hospital/Doctor
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

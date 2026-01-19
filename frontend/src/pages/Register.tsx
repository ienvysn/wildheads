import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Heart, User, Building, Stethoscope } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<"patient" | "doctor" | "hospital" | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Common Fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Patient Fields
  const [patientName, setPatientName] = useState("");

  // Doctor Fields
  const [doctorName, setDoctorName] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialty, setSpecialty] = useState("");

  // Hospital Fields
  const [hospitalName, setHospitalName] = useState("");
  const [regNumber, setRegNumber] = useState("");

  const handleRoleSelect = (selectedRole: "patient" | "doctor" | "hospital") => {
    setRole(selectedRole);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    let finalRole: "patient" | "doctor" | "admin" = "patient";
    let displayName = "";

    if (role === "hospital") {
      finalRole = "admin";
      displayName = hospitalName;
    } else if (role === "doctor") {
      finalRole = "doctor";
      displayName = doctorName;
    } else {
      finalRole = "patient";
      displayName = patientName;
    }

    // Mock Login
    await login({
      name: displayName,
      email,
      role: finalRole,
    });

    toast({
      title: "Registration Successful",
      description: `Welcome to Arogya, ${displayName}!`,
    });

    // Navigate based on role
    if (role === "hospital") navigate("/admin/dashboard");
    else if (role === "doctor") navigate("/doctor/dashboard");
    else navigate("/patient/dashboard");

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left Banner */}
      <div className="hidden lg:flex flex-col justify-center items-center gradient-primary text-primary-foreground p-12 relative overflow-hidden">
        <div className="relative z-10 text-center max-w-lg">
          <div className="h-20 w-20 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-8">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Join Arogya Service</h1>
          <p className="text-lg opacity-90">
            Connect with the best healthcare ecosystem. Whether you are a patient seeking care, a doctor offering expertise, or a hospital managing operations.
          </p>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      </div>

      {/* Right Form Area */}
      <div className="flex items-center justify-center p-6 bg-background">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center gap-2 justify-center mb-8">
            <Heart className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">Arogya</span>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-bold">Who are you?</h2>
                  <p className="text-muted-foreground">Select your role to get started.</p>
                </div>

                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 text-center">
                  <p className="font-semibold text-primary">Are you a Patient?</p>
                  <p className="text-sm text-muted-foreground">
                    Patient registration is now handled by the hospital directly.
                    Please visit your nearest Arogya center to get your <b>Patient ID</b> and credentials.
                  </p>
                </div>

                <div className="grid gap-4">

                  <Card className="cursor-pointer hover:border-primary transition-all" onClick={() => handleRoleSelect("doctor")}>
                    <CardHeader className="flex flex-row items-center gap-4 py-4">
                      <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                        <Stethoscope className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">I am a Doctor</CardTitle>
                        <CardDescription>Manage patients & consultations</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>

                  <Card className="cursor-pointer hover:border-primary transition-all" onClick={() => handleRoleSelect("hospital")}>
                    <CardHeader className="flex flex-row items-center gap-4 py-4">
                      <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                        <Building className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Hospital Admin</CardTitle>
                        <CardDescription>Register your facility & staff</CardDescription>
                      </div>
                    </CardHeader>
                  </Card>
                </div>

                <p className="text-center text-sm">
                  Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Log in</Link>
                </p>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-2xl font-bold">
                    {role === "patient" && "Patient Registration"}
                    {role === "doctor" && "Doctor Registration"}
                    {role === "hospital" && "Hospital Registration"}
                  </h2>
                  <p className="text-muted-foreground">Please fill in your details.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Role Specific Fields */}
                  {role === "patient" && (
                    <div className="space-y-2">
                      <Label>Full Name</Label>
                      <Input value={patientName} onChange={e => setPatientName(e.target.value)} placeholder="John Doe" required />
                    </div>
                  )}

                  {role === "doctor" && (
                    <>
                      <div className="space-y-2">
                        <Label>Dr. Full Name</Label>
                        <Input value={doctorName} onChange={e => setDoctorName(e.target.value)} placeholder="Dr. Jane Smith" required />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>License Number</Label>
                          <Input value={licenseNumber} onChange={e => setLicenseNumber(e.target.value)} placeholder="MED-12345" required />
                        </div>
                        <div className="space-y-2">
                          <Label>Specialty</Label>
                          <Select value={specialty} onValueChange={setSpecialty}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="cardiology">Cardiology</SelectItem>
                              <SelectItem value="pediatrics">Pediatrics</SelectItem>
                              <SelectItem value="neurology">Neurology</SelectItem>
                              <SelectItem value="orthopedics">Orthopedics</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}

                  {role === "hospital" && (
                    <>
                      <div className="space-y-2">
                        <Label>Hospital Name</Label>
                        <Input value={hospitalName} onChange={e => setHospitalName(e.target.value)} placeholder="City General Hospital" required />
                      </div>
                      <div className="space-y-2">
                        <Label>Registration Number</Label>
                        <Input value={regNumber} onChange={e => setRegNumber(e.target.value)} placeholder="HOS-998877" required />
                      </div>
                    </>
                  )}

                  {/* Common Fields */}
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required />
                  </div>

                  <div className="space-y-2">
                    <Label>Password</Label>
                    <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>

                  <div className="space-y-2">
                    <Label>Confirm Password</Label>
                    <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setStep(1)}>
                      Back
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isLoading}>
                      {isLoading ? <Spinner size="sm" className="mr-2" /> : "Complete Registration"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Register;

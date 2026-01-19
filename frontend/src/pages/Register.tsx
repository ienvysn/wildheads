import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

interface FormData {
  // Step 1: Account
  email: string;
  password: string;
  confirmPassword: string;
  // Step 2: Personal
  fullName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  address: string;
  emergencyContact: string;
  emergencyPhone: string;
  // Step 3: Medical
  allergies: string;
  chronicConditions: string;
  currentMedications: string;
  pastSurgeries: string;
}

const steps = [
  { id: 1, title: "Account", description: "Create your login credentials" },
  { id: 2, title: "Personal", description: "Your personal information" },
  { id: 3, title: "Medical", description: "Medical history (optional)" },
];

const Register = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phone: "",
    address: "",
    emergencyContact: "",
    emergencyPhone: "",
    allergies: "",
    chronicConditions: "",
    currentMedications: "",
    pastSurgeries: "",
  });

  const updateFormData = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.email || !formData.password || !formData.confirmPassword) {
          toast({ title: "Error", description: "Please fill in all fields", variant: "destructive" });
          return false;
        }
        if (formData.password !== formData.confirmPassword) {
          toast({ title: "Error", description: "Passwords do not match", variant: "destructive" });
          return false;
        }
        if (formData.password.length < 8) {
          toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
          return false;
        }
        return true;
      case 2:
        if (!formData.fullName || !formData.dateOfBirth || !formData.gender || !formData.phone) {
          toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (skipMedical = false) => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "Registration Successful!",
      description: "Welcome to MediCare. You can now log in to your account.",
    });
    
    navigate("/patient/dashboard");
    setIsLoading(false);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium transition-all",
                currentStep > step.id
                  ? "bg-success text-success-foreground"
                  : currentStep === step.id
                  ? "gradient-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {currentStep > step.id ? <Check className="h-5 w-5" /> : step.id}
            </div>
            <span className={cn(
              "text-xs mt-1 hidden sm:block",
              currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
            )}>
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={cn(
                "w-12 sm:w-20 h-0.5 mx-2",
                currentStep > step.id ? "bg-success" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => updateFormData("email", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password *</Label>
        <Input
          id="password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={(e) => updateFormData("password", e.target.value)}
        />
        <p className="text-xs text-muted-foreground">
          Must be at least 8 characters with 1 uppercase and 1 number
        </p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm Password *</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => updateFormData("confirmPassword", e.target.value)}
        />
      </div>
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="fullName">Full Name *</Label>
        <Input
          id="fullName"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={(e) => updateFormData("fullName", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => updateFormData("dateOfBirth", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select value={formData.gender} onValueChange={(v) => updateFormData("gender", v)}>
            <SelectTrigger>
              <SelectValue placeholder="Select" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChange={(e) => updateFormData("phone", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="Enter your address"
          value={formData.address}
          onChange={(e) => updateFormData("address", e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="emergencyContact">Emergency Contact</Label>
          <Input
            id="emergencyContact"
            placeholder="Contact name"
            value={formData.emergencyContact}
            onChange={(e) => updateFormData("emergencyContact", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="emergencyPhone">Emergency Phone</Label>
          <Input
            id="emergencyPhone"
            type="tel"
            placeholder="Phone number"
            value={formData.emergencyPhone}
            onChange={(e) => updateFormData("emergencyPhone", e.target.value)}
          />
        </div>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      <div className="p-4 rounded-lg bg-info/10 border border-info/20 text-sm text-info mb-4">
        <p>ℹ️ This information helps us provide better care. You can skip this step and add it later.</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="allergies">Allergies</Label>
        <Textarea
          id="allergies"
          placeholder="List any known allergies"
          value={formData.allergies}
          onChange={(e) => updateFormData("allergies", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="chronicConditions">Chronic Conditions</Label>
        <Textarea
          id="chronicConditions"
          placeholder="List any chronic conditions"
          value={formData.chronicConditions}
          onChange={(e) => updateFormData("chronicConditions", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="currentMedications">Current Medications</Label>
        <Textarea
          id="currentMedications"
          placeholder="List current medications"
          value={formData.currentMedications}
          onChange={(e) => updateFormData("currentMedications", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pastSurgeries">Past Surgeries</Label>
        <Textarea
          id="pastSurgeries"
          placeholder="List any past surgeries"
          value={formData.pastSurgeries}
          onChange={(e) => updateFormData("pastSurgeries", e.target.value)}
        />
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-muted/30">
      <motion.div 
        className="w-full max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-center mb-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <Heart className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground">MediCare</span>
          </Link>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">Create Your Account</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent>
            {renderStepIndicator()}
            
            <AnimatePresence mode="wait">
              {currentStep === 1 && renderStep1()}
              {currentStep === 2 && renderStep2()}
              {currentStep === 3 && renderStep3()}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              {currentStep > 1 ? (
                <Button variant="outline" onClick={handleBack} disabled={isLoading}>
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              ) : (
                <div />
              )}
              
              {currentStep < 3 ? (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => handleSubmit(true)} disabled={isLoading}>
                    Skip
                  </Button>
                  <Button onClick={() => handleSubmit(false)} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="mr-2" />
                        Creating...
                      </>
                    ) : (
                      "Complete Registration"
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Register;

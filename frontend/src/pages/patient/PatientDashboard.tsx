import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { AppointmentCard } from "@/components/dashboard/AppointmentCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Activity,
  Pill,
  CreditCard,
  Lock,
  Search,
  Scale,
  Droplets
} from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const navItems = [
  { label: "Overview", href: "/patient/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Appointments", href: "/patient/appointments", icon: <Calendar className="h-5 w-5" /> },
  { label: "Medical Records", href: "/patient/records", icon: <FileText className="h-5 w-5" /> },
  { label: "Prescriptions", href: "/patient/prescriptions", icon: <Pill className="h-5 w-5" /> },
  { label: "Billing", href: "/patient/billing", icon: <CreditCard className="h-5 w-5" /> },
];

const PatientDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Symptom Popup State
  const [showSymptomPopup, setShowSymptomPopup] = useState(false);
  const [currentSymptom, setCurrentSymptom] = useState("");

  // Report Code State
  const [reportCode, setReportCode] = useState("");

  // Fetch real patient data from localStorage based on the ID used to login
  const patientData = (() => {
    const localPatients = JSON.parse(localStorage.getItem("arogya_patients") || "[]");
    // The 'email' field in AuthContext currently holds the Patient ID for patients
    return localPatients.find((p: any) => p.pid === user?.email || p.patientId === user?.email);
  })();

  const displayVitals = {
    bp: patientData?.bp || "Pending",
    weight: patientData?.weight || "--",
    height: patientData?.height || "--",
    // Default values for fields not yet in admin form but needed for UI balance
    heartRate: "72",
    glucose: "95"
  };

  useEffect(() => {
    // Show popup if not shown in this session (mock)
    const hasCheckedIn = sessionStorage.getItem("arogya_symptom_check");
    if (!hasCheckedIn) {
      // Small delay for better UX
      setTimeout(() => setShowSymptomPopup(true), 1000);
    }
  }, []);

  const handleSymptomSubmit = () => {
    if (!currentSymptom) return;

    toast({
      title: "Symptom Logged",
      description: "We've updated your health profile. A nurse will review this shortly.",
    });
    sessionStorage.setItem("arogya_symptom_check", "true");
    setShowSymptomPopup(false);
  };

  const handleReportAccess = () => {
    if (!reportCode) return;
    toast({
      title: "Accessing Report...",
      description: `Searching for secure report code: ${reportCode}`,
    });
    // Mock simulation
    setTimeout(() => {
      toast({
        title: "Report Found!",
        description: "Redirecting to your secure document viewer.",
        variant: "default"
      });
      navigate("/patient/records");
    }, 1500);
  };

  return (
    <DashboardLayout navItems={navItems}>
      <motion.div
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Hello, {patientData?.name || user?.name || "Patient"}
            </h1>
            <p className="text-muted-foreground">
              Patient ID: <span className="font-mono font-medium text-primary">{patientData?.pid || user?.email}</span>
            </p>
          </div>
          <Button onClick={() => setShowSymptomPopup(true)} variant="outline">
            <Activity className="mr-2 h-4 w-4" />
            Check Symptoms
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Blood Pressure"
            value={displayVitals.bp}
            icon={<Activity className="h-6 w-6" />}
            trend={displayVitals.bp === "Pending" ? "Update Needed" : "Normal"}
            trendUp={true}
            variant={displayVitals.bp === "Pending" ? "warning" : "success"}
          />
          <StatCard
            title="Weight"
            value={displayVitals.weight}
            icon={<Scale className="h-6 w-6" />}
            trend="kg"
            trendUp={true}
          />
          <StatCard
            title="Height"
            value={displayVitals.height}
            icon={<Activity className="h-6 w-6" />}
            trend="cm"
            trendUp={true}
            variant="info"
          />
          <StatCard
            title="Glucose"
            value={displayVitals.glucose}
            icon={<Droplets className="h-6 w-6" />}
            trend="mg/dL"
            trendUp={true}
            variant="primary"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Report Access */}
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2 text-primary">
                  <Lock className="h-5 w-5" />
                  Access Private Report
                </CardTitle>
                <CardDescription>
                  Enter the secure code provided by your doctor or hospital to view specific reports.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter Code (e.g. REP-2026)"
                    value={reportCode}
                    onChange={(e) => setReportCode(e.target.value)}
                    className="bg-background max-w-sm"
                  />
                  <Button onClick={handleReportAccess}>
                    <Search className="h-4 w-4 mr-2" />
                    View Report
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Appointments Section */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Upcoming Appointments</h3>
              <Card className="p-6 text-center text-muted-foreground border-dashed">
                <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No upcoming appointments scheduled.</p>
                <Button variant="link" className="mt-2 h-auto p-0">Book an appointment</Button>
              </Card>
            </div>
          </div>
          <div>
            <ActivityFeed activities={[]} />
          </div>
        </div>

        {/* Symptom Checker Modal */}
        <Dialog open={showSymptomPopup} onOpenChange={setShowSymptomPopup}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>How are you feeling today?</DialogTitle>
              <DialogDescription>
                Briefly describe any symptoms or issues you are facing. This helps your doctor stay updated.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Textarea
                placeholder="E.g., I have a mild headache and fever..."
                value={currentSymptom}
                onChange={(e) => setCurrentSymptom(e.target.value)}
                rows={4}
              />
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setShowSymptomPopup(false)}>Skip</Button>
              <Button onClick={handleSymptomSubmit}>Submit Update</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </motion.div>
    </DashboardLayout>
  );
};

export default PatientDashboard;

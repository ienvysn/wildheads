import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  UserPlus, 
  Clock, 
  Activity,
  Stethoscope,
  ClipboardList,
  User,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Dashboard", href: "/nurse/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Register Patient", href: "/nurse/register", icon: <UserPlus className="h-5 w-5" /> },
  { label: "Queue Management", href: "/nurse/queue", icon: <Clock className="h-5 w-5" /> },
  { label: "Record Vitals", href: "/nurse/vitals", icon: <Activity className="h-5 w-5" /> },
];

const pendingVitals = [
  { id: "1", name: "Sarah Johnson", doctor: "Dr. Smith", time: "9:15 AM" },
  { id: "2", name: "Mike Davis", doctor: "Dr. Brown", time: "9:30 AM" },
  { id: "3", name: "Emma Wilson", doctor: "Dr. Smith", time: "9:45 AM" },
];

const NurseDashboard = () => {
  const { toast } = useToast();

  const handleRecordVitals = (patientName: string) => {
    toast({
      title: "Recording Vitals",
      description: `Opening vitals form for ${patientName}`,
    });
  };

  return (
    <DashboardLayout navItems={navItems} userName="Mary Johnson" userRole="Nurse Station">
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Nurse Station</h1>
          <p className="text-muted-foreground">Good morning, Mary. Here's your workflow for today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard
            title="Check-ins Today"
            value="24"
            icon={<UserPlus className="h-6 w-6" />}
            variant="primary"
          />
          <StatCard
            title="Pending Vitals"
            value="3"
            icon={<Activity className="h-6 w-6" />}
            variant="warning"
          />
          <StatCard
            title="Vitals Recorded"
            value="21"
            icon={<ClipboardList className="h-6 w-6" />}
            variant="success"
          />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <Button size="lg" className="h-auto py-6 flex-col gap-2">
                <UserPlus className="h-8 w-8" />
                <span>Register Walk-in Patient</span>
              </Button>
              <Button size="lg" variant="outline" className="h-auto py-6 flex-col gap-2">
                <Activity className="h-8 w-8" />
                <span>Record Vitals</span>
              </Button>
              <Button size="lg" variant="outline" className="h-auto py-6 flex-col gap-2">
                <Clock className="h-8 w-8" />
                <span>Manage Queue</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Vitals */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Activity className="h-5 w-5 text-warning" />
              Patients Pending Vitals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingVitals.map((patient) => (
              <div
                key={patient.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{patient.name}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Stethoscope className="h-3.5 w-3.5" />
                      <span>{patient.doctor}'s queue</span>
                      <span>•</span>
                      <span>{patient.time}</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleRecordVitals(patient.name)}>
                  Record Vitals
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Doctor Queues Overview */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              Doctor Queue Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Dr. Smith</p>
                  <Badge variant="secondary" className="bg-success/10 text-success">5 in queue</Badge>
                </div>
                <p className="text-sm text-muted-foreground">General Medicine</p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Dr. Brown</p>
                  <Badge variant="secondary" className="bg-warning/10 text-warning">3 in queue</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Cardiology</p>
              </div>
              <div className="p-4 rounded-lg border border-border">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Dr. Wilson</p>
                  <Badge variant="secondary" className="bg-info/10 text-info">7 in queue</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Pediatrics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default NurseDashboard;

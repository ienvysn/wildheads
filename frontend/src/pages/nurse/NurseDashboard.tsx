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
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Dashboard", href: "/nurse/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Register Patient", href: "/nurse/register", icon: <UserPlus className="h-5 w-5" /> },
  { label: "Queue Management", href: "/nurse/queue", icon: <Clock className="h-5 w-5" /> },
  { label: "Record Vitals", href: "/nurse/vitals", icon: <Activity className="h-5 w-5" /> },
];

import { patients } from "@/data/mockData";

const NurseDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleRecordVitals = (patientId: string) => {
    navigate(`/nurse/patient/${patientId}`);
  };

  return (
    <DashboardLayout navItems={navItems}>
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
            value="0"
            icon={<UserPlus className="h-6 w-6" />}
            variant="primary"
          />
          <StatCard
            title="Pending Vitals"
            value="0"
            icon={<Activity className="h-6 w-6" />}
            variant="warning"
          />
          <StatCard
            title="Vitals Recorded"
            value="0"
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
            {patients.map((patient, i) => (
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
                      <span>Dr. Smith's queue</span>
                    </div>
                  </div>
                </div>
                <Button size="sm" onClick={() => handleRecordVitals(patient.id)}>
                  View & Record
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
            <div className="text-sm text-muted-foreground text-center py-4">
              No queue data available
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </DashboardLayout>
  );
};

export default NurseDashboard;

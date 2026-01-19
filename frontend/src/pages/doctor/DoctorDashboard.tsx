import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { PatientQueueCard } from "@/components/dashboard/PatientQueueCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Stethoscope,
  MessageSquare
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Dashboard", href: "/doctor/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Current Queue", href: "/doctor/queue", icon: <Clock className="h-5 w-5" /> },
  { label: "My Patients", href: "/doctor/patients", icon: <Users className="h-5 w-5" /> },
  { label: "Schedule", href: "/doctor/schedule", icon: <Calendar className="h-5 w-5" /> },
];

import { patients } from "@/data/mockData";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Transform mock data for the dashboard view
  const dashboardQueue = patients.map((p, i) => ({
    id: p.id,
    name: p.name,
    time: ["9:15 AM", "9:45 AM", "10:30 AM"][i] || "11:00 AM",
    type: "general" as const,
    complaint: p.history[0] || "General Checkup",
    hasAiScreening: true
  }));

  const handleStartConsultation = (patientId: string) => {
    navigate(`/doctor/patient/${patientId}`);
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
          <h1 className="text-2xl font-bold text-foreground">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome to Arogya Doctor Portal.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-3 gap-4">
          <StatCard
            title="Today's Appointments"
            value="0"
            icon={<Calendar className="h-6 w-6" />}
            variant="primary"
          />
          <StatCard
            title="In Queue"
            value="0"
            icon={<Clock className="h-6 w-6" />}
            variant="warning"
          />
          <StatCard
            title="Completed Today"
            value="0"
            icon={<CheckCircle className="h-6 w-6" />}
            variant="success"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Patient Queue */}
          <div className="lg:col-span-2">
            <PatientQueueCard
              patients={dashboardQueue}
              onStartConsultation={handleStartConsultation}
            />
          </div>

          {/* Quick Actions & Alerts */}
          <div className="space-y-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Users className="h-4 w-4 mr-2" />
                  Search Patient
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Messages
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  My Schedule
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm text-muted-foreground text-center py-4">
                  No alerts at this time.
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default DoctorDashboard;

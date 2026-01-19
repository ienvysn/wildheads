import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AppointmentCard } from "@/components/dashboard/AppointmentCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Receipt,
  MessageSquare,
  Plus,
  Activity,
  Pill,
  FileCheck,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const navItems = [
  { label: "Home", href: "/patient/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Appointments", href: "/patient/appointments", icon: <Calendar className="h-5 w-5" /> },
  { label: "Medical Records", href: "/patient/records", icon: <FileText className="h-5 w-5" /> },
  { label: "Bills & Payments", href: "/patient/billing", icon: <Receipt className="h-5 w-5" /> },
];

const recentActivity = [
  { id: "1", icon: Pill, text: "Prescription ready - Paracetamol 500mg", date: "Jan 18", type: "prescription" },
  { id: "2", icon: FileCheck, text: "Lab results available - CBC Test", date: "Jan 15", type: "lab" },
  { id: "3", icon: Calendar, text: "Appointment completed with Dr. Smith", date: "Jan 12", type: "appointment" },
];

const PatientDashboard = () => {
  const { toast } = useToast();

  const handleBookAppointment = () => {
    toast({
      title: "Book Appointment",
      description: "Opening appointment booking form",
    });
  };

  const handleViewRecords = () => {
    toast({
      title: "Medical Records",
      description: "Opening your medical records",
    });
  };

  return (
    <DashboardLayout navItems={navItems} userName="Sarah Johnson" userRole="Patient Portal">
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Health Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, Sarah. Here's your health overview.</p>
        </div>

        {/* AI Assistant Card */}
        <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary-light to-background">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-xl gradient-primary flex items-center justify-center flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-foreground mb-1">Health Assistant</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Get help with booking appointments, checking symptoms, or viewing your records.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={handleBookAppointment}>
                    Book Appointment
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleViewRecords}>
                    View Records
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Upcoming Appointments */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Upcoming Appointments</h2>
              <Button size="sm" onClick={handleBookAppointment}>
                <Plus className="h-4 w-4 mr-1" />
                Book New
              </Button>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <AppointmentCard
                date="Jan 22, 2026"
                time="10:00 AM"
                doctor="Dr. John Smith"
                department="General Medicine"
                status="confirmed"
                onView={() => toast({ title: "View Details", description: "Opening appointment details" })}
                onCancel={() => toast({ title: "Cancel", description: "Opening cancellation dialog", variant: "destructive" })}
              />
              <AppointmentCard
                date="Feb 5, 2026"
                time="2:30 PM"
                doctor="Dr. Sarah Brown"
                department="Cardiology"
                status="pending"
                onView={() => toast({ title: "View Details", description: "Opening appointment details" })}
              />
            </div>
          </div>

          {/* Health Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Health Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                <p className="text-sm font-medium text-success">Overall Health: Good</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Last checkup: Jan 12, 2026
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Active Prescriptions</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 rounded bg-muted/50">
                    <div className="flex items-center gap-2">
                      <Pill className="h-4 w-4 text-primary" />
                      <span className="text-sm">Paracetamol 500mg</span>
                    </div>
                    <Badge variant="secondary">3 days left</Badge>
                  </div>
                </div>
              </div>

              <Button variant="outline" className="w-full" onClick={handleViewRecords}>
                View Full Records
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.text}</p>
                      <p className="text-xs text-muted-foreground">{activity.date}</p>
                    </div>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2">
            <Calendar className="h-6 w-6" />
            <span>Book Appointment</span>
          </Button>
          <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2">
            <FileText className="h-6 w-6" />
            <span>Download Records</span>
          </Button>
          <Button variant="outline" size="lg" className="h-auto py-4 flex-col gap-2">
            <Receipt className="h-6 w-6" />
            <span>Pay Bills</span>
          </Button>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default PatientDashboard;

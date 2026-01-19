import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Users, FileText, Activity, Clock } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAppointments } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function DoctorDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: appointments, isLoading } = useAppointments();
  const { toast } = useToast();

  const totalAppointments = appointments?.length || 0;
  const uniquePatients = new Set((appointments || []).map((apt: any) => apt.patient)).size;

  const stats = [
    {
      title: "Today's Appointments",
      value: totalAppointments.toString(),
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Patients",
      value: uniquePatients.toString(),
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending Reports",
      value: "8",
      icon: FileText,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Avg. Consultation",
      value: "25 min",
      icon: Clock,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Doctor Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Dr. {user?.first_name || user?.username} {user?.last_name || ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => navigate("/")}>
                Home
              </Button>
              <Button variant="ghost" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Today's Schedule */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>Your appointments for today</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-2">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : appointments && appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.slice(0, 5).map((apt: any, index: number) => (
                    <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium">
                          {apt.patient_detail?.user?.first_name || "Patient"} {apt.patient_detail?.user?.last_name || ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(apt.appointment_date || Date.now()).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (apt.patient_detail?.id) {
                            navigate(`/doctor/patient/${apt.patient_detail.id}`);
                          } else {
                            toast({
                              title: "Patient not available",
                              description: "This appointment has no linked patient profile.",
                              variant: "destructive",
                            });
                          }
                        }}
                      >
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No appointments scheduled for today
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and tools</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" onClick={() => toast({ title: "Prescription", description: "Open a patient and create a prescription." })}> 
                <FileText className="mr-2 h-4 w-4" />
                Write Prescription
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => toast({ title: "AI Analysis", description: "Open a patient profile to run analysis." })}>
                <Activity className="mr-2 h-4 w-4" />
                AI Clinical Analysis
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => toast({ title: "Patient Records", description: "Select a patient from today's schedule to view records." })}>
                <Users className="mr-2 h-4 w-4" />
                View Patient Records
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Calendar className="mr-2 h-4 w-4" />
                Manage Schedule
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Patients */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent Patients</CardTitle>
            <CardDescription>Recently consulted patients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {(appointments || []).slice(0, 4).map((apt: any, index: number) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">
                        {`${apt.patient_detail?.user?.first_name || "P"}${apt.patient_detail?.user?.last_name?.[0] || ""}`}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium">
                        {apt.patient_detail?.user?.first_name || "Patient"} {apt.patient_detail?.user?.last_name || ""}
                      </p>
                      <p className="text-sm text-muted-foreground">Appointment</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {apt.appointment_date ? new Date(apt.appointment_date).toLocaleDateString() : ""}
                    </p>
                    <Button size="sm" variant="ghost" className="mt-1">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

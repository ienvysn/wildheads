import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, AlertCircle, CheckCircle, Clock, FileText, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useAppointments } from "@/hooks/useApi";
import { useToast } from "@/hooks/use-toast";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

export default function NurseDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: appointments } = useAppointments();
  const { toast } = useToast();

  const patientQueue = (appointments || []).slice(0, 4).map((apt: any, index: number) => ({
    id: apt.id || index,
    name: `${apt.patient_detail?.user?.first_name || "Patient"} ${apt.patient_detail?.user?.last_name || ""}`.trim(),
    room: apt.room || "N/A",
    status: "waiting",
    priority: "normal",
  }));

  const stats = [
    {
      title: "Patients in Queue",
      value: String(patientQueue.length),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Vitals Recorded",
      value: "24",
      icon: Activity,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Pending Tasks",
      value: "5",
      icon: AlertCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Completed Today",
      value: "32",
      icon: CheckCircle,
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "normal": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const navItems = [
    { label: "Dashboard", href: "/nurse/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: "Patients", href: "/nurse/patients", icon: <Users className="h-5 w-5" /> },
  ];

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nurse Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, Nurse {user?.first_name || user?.username}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          {/* Patient Queue */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Queue</CardTitle>
              <CardDescription>Patients waiting for care</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patientQueue.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No patients in queue</p>
                ) : patientQueue.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {patient.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">Room {patient.room}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(patient.priority)} variant="secondary">
                        {patient.priority}
                      </Badge>
                      <Badge className={getStatusColor(patient.status)} variant="secondary">
                        {patient.status}
                      </Badge>
                      <Button size="sm" variant="outline" onClick={() => navigate(`/nurse/patient/${patient.id}`)}>Attend</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common nursing tasks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/nurse/patients")}>
                <Activity className="mr-2 h-4 w-4" />
                Record Vitals
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => toast({ title: "Notes", description: "Select a patient to update notes." })}>
                <FileText className="mr-2 h-4 w-4" />
                Update Patient Notes
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => toast({ title: "Emergency", description: "Use internal emergency workflow." })}>
                <AlertCircle className="mr-2 h-4 w-4" />
                Report Emergency
              </Button>
              <Button className="w-full justify-start" variant="outline" onClick={() => toast({ title: "Medication Schedule", description: "Schedule feature coming soon." })}>
                <Clock className="mr-2 h-4 w-4" />
                Medication Schedule
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Today's Tasks */}
        <Card>
          <CardHeader>
            <CardTitle>Today's Tasks</CardTitle>
            <CardDescription>Scheduled tasks and reminders</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { task: "Administer medication - Room 101", time: "10:00 AM", status: "pending" },
                { task: "Check vitals - Room 102", time: "10:30 AM", status: "completed" },
                { task: "Wound dressing - Room 103", time: "11:00 AM", status: "pending" },
                { task: "Blood sample collection - Room 104", time: "11:30 AM", status: "pending" },
              ].map((task, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`h-2 w-2 rounded-full ${task.status === "completed" ? "bg-green-500" : "bg-orange-500"}`} />
                    <div>
                      <p className="font-medium">{task.task}</p>
                      <p className="text-sm text-muted-foreground">{task.time}</p>
                    </div>
                  </div>
                  {task.status === "pending" && (
                    <Button size="sm" variant="outline">
                      Mark Done
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

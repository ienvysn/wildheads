import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Activity, Heart, Pill, FlaskConical } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { AIHealthChat } from "@/components/patient/AIHealthChat";
import { useAppointments, usePrescriptions, useTestResults } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";

export default function PatientDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
  const { data: prescriptions, isLoading: prescriptionsLoading } = usePrescriptions();
  const { data: testResults, isLoading: resultsLoading } = useTestResults();

  const healthMetrics = [
    {
      title: "Blood Pressure",
      value: "120/80",
      unit: "mmHg",
      status: "normal",
      icon: Heart,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Heart Rate",
      value: "72",
      unit: "bpm",
      status: "normal",
      icon: Activity,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Temperature",
      value: "98.6",
      unit: "°F",
      status: "normal",
      icon: Activity,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Oxygen Level",
      value: "98",
      unit: "%",
      status: "normal",
      icon: Activity,
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
              <h1 className="text-2xl font-bold">Patient Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {user?.first_name || user?.username} {user?.last_name || ""}
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
        {/* Health Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {healthMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card key={index}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.value} <span className="text-sm font-normal text-muted-foreground">{metric.unit}</span>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">{metric.status}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* AI Health Assistant */}
          <div className="lg:col-span-2">
            <AIHealthChat />
          </div>

          {/* Quick Info */}
          <div className="space-y-6">
            {/* Upcoming Appointments */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Upcoming Appointments
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointmentsLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : appointments && appointments.length > 0 ? (
                  <div className="space-y-3">
                    {appointments.slice(0, 3).map((apt: any, index: number) => (
                      <div key={index} className="border-b pb-2 last:border-0">
                        <p className="font-medium text-sm">Dr. {apt.doctor || "Smith"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(apt.date || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No upcoming appointments</p>
                )}
                <Button className="w-full mt-4" variant="outline" size="sm">
                  Book Appointment
                </Button>
              </CardContent>
            </Card>

            {/* Prescriptions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Pill className="h-5 w-5" />
                  Active Prescriptions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {prescriptionsLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : prescriptions && prescriptions.length > 0 ? (
                  <div className="space-y-3">
                    {prescriptions.slice(0, 3).map((rx: any, index: number) => (
                      <div key={index} className="border-b pb-2 last:border-0">
                        <p className="font-medium text-sm">{rx.medicine_name || "Medication"}</p>
                        <p className="text-xs text-muted-foreground">{rx.dosage || "As prescribed"}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No active prescriptions</p>
                )}
                <Button className="w-full mt-4" variant="outline" size="sm">
                  View All
                </Button>
              </CardContent>
            </Card>

            {/* Lab Results */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5" />
                  Recent Lab Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resultsLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : testResults && testResults.length > 0 ? (
                  <div className="space-y-3">
                    {testResults.slice(0, 3).map((result: any, index: number) => (
                      <div key={index} className="border-b pb-2 last:border-0">
                        <p className="font-medium text-sm">{result.test_name || "Blood Test"}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(result.date || Date.now()).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent results</p>
                )}
                <Button className="w-full mt-4" variant="outline" size="sm" onClick={() => navigate("/patient/records")}>
                  View All Records
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

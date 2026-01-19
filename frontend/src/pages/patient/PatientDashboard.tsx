import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Activity, Heart, LayoutDashboard, Pill, FlaskConical, Download } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { AIHealthChat } from "@/components/patient/AIHealthChat";
import { useAppointments, usePrescriptions, useTestResults } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: appointments, isLoading: appointmentsLoading } = useAppointments();
  const { data: prescriptions, isLoading: prescriptionsLoading } = usePrescriptions();
  const { data: testResults, isLoading: resultsLoading } = useTestResults();

  const [personalRecord, setPersonalRecord] = useState<any>(null);

  useEffect(() => {
    if (user?.username) {
      fetch(`http://localhost:5000/api/patients/${user.username}`)
        .then(res => res.json())
        .then(data => {
          if (!data.error) setPersonalRecord(data);
        })
        .catch(err => console.error("Error fetching patient record:", err));
    }
  }, [user]);

  const downloadPDF = (base64Data: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const navItems = [
    { label: "Dashboard", href: "/patient/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "Medical Records", href: "/patient/records", icon: <FileText className="h-4 w-4" /> },
  ];

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
    <DashboardLayout navItems={navItems}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Patient Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome, {user?.first_name || user?.username} {user?.last_name || ""}
          </p>
        </div>

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

            {/* Quick Info & Reports */}
            <div className="space-y-6">
              {/* Personal Report Card */}
              {personalRecord && (
                <Card className="border-primary/20 bg-primary/5">
                  <CardHeader>
                    <CardTitle className="text-primary flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Your Medical Report
                    </CardTitle>
                    <CardDescription>Latest report updated by the hospital</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg border shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded bg-red-50 flex items-center justify-center">
                          <FileText className="h-6 w-6 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-medium truncate max-w-[120px]">{personalRecord.fileName}</p>
                          <p className="text-[10px] text-muted-foreground">{new Date(personalRecord.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" onClick={() => downloadPDF(personalRecord.fileData, personalRecord.fileName)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                    {personalRecord.fileData && (
                      <div className="aspect-[4/3] w-full border rounded-lg overflow-hidden bg-white">
                        <iframe
                          src={personalRecord.fileData}
                          className="w-full h-full"
                          title="Report Preview"
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
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
    </DashboardLayout>
  );
}

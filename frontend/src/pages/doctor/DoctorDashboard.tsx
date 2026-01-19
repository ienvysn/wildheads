import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, FileText, Activity, Clock, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAppointments } from "@/hooks/useApi";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export default function DoctorDashboard() {
  const { user } = useAuth();
  const { data: appointments, isLoading } = useAppointments();

  const navItems = [
    { label: "Dashboard", href: "/doctor/dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: "View Records", href: "/doctor/dashboard", icon: <FileText className="h-4 w-4" /> },
  ];

  const [searchPid, setSearchPid] = useState("");
  const [foundPatient, setFoundPatient] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchPid) return;
    setIsSearching(true);
    setFoundPatient(null);
    try {
      const res = await fetch(`http://localhost:5000/api/patients/${searchPid}`);
      if (res.ok) {
        const data = await res.json();
        setFoundPatient(data);
      } else {
        alert("Patient not found");
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const downloadPDF = (base64Data: string, fileName: string) => {
    const link = document.createElement("a");
    link.href = base64Data;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stats = [
    {
      title: "Today's Appointments",
      value: "12",
      icon: Calendar,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      title: "Total Patients",
      value: "156",
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
    <DashboardLayout navItems={navItems}>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Doctor Dashboard</h1>
          <p className="text-muted-foreground">
            Dr. {user?.first_name || user?.username} {user?.last_name || ""}
          </p>
        </div>

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
                          <p className="font-medium">Patient #{apt.patient || index + 1}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(apt.date || Date.now()).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <Button size="sm" variant="outline">
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

            {/* Patient Search & Report View */}
            <Card>
              <CardHeader>
                <CardTitle>Retrieve Patient Report</CardTitle>
                <CardDescription>Enter Patient ID to view medical history and reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Enter Patient ID (e.g., PID-2026-1234)"
                    value={searchPid}
                    onChange={(e) => setSearchPid(e.target.value)}
                  />
                  <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? "Searching..." : "Search"}
                  </Button>
                </div>

                {foundPatient && (
                  <div className="mt-4 p-4 border rounded-lg bg-muted/30 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-bold text-lg">{foundPatient.name}</p>
                        <p className="text-sm text-muted-foreground">{foundPatient.pid}</p>
                      </div>
                      <Badge variant="outline">{foundPatient.age} yrs / {foundPatient.gender}</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <p><span className="text-muted-foreground">BP:</span> {foundPatient.bp || "N/A"}</p>
                      <p><span className="text-muted-foreground">Weight:</span> {foundPatient.weight || "N/A"} kg</p>
                    </div>
                    <div className="p-2 bg-white rounded border text-sm italic">
                      {foundPatient.symptoms || "No symptoms recorded"}
                    </div>
                    {foundPatient.fileData && (
                      <Button
                        variant="default"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => downloadPDF(foundPatient.fileData, foundPatient.fileName)}
                      >
                        <Download className="h-4 w-4" /> Download Report PDF
                      </Button>
                    )}
                  </div>
                )}
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
                {[
                  { name: "John Doe", condition: "Follow-up checkup", time: "2 hours ago" },
                  { name: "Jane Smith", condition: "Fever and cold", time: "4 hours ago" },
                  { name: "Mike Johnson", condition: "Blood pressure check", time: "Yesterday" },
                  { name: "Sarah Williams", condition: "Diabetes consultation", time: "2 days ago" },
                ].map((patient, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">
                          {patient.name.split(" ").map((n) => n[0]).join("")}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-muted-foreground">{patient.condition}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{patient.time}</p>
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
    </DashboardLayout>
  );
}

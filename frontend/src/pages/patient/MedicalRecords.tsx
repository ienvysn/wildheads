import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { patients } from "@/data/mockData";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, Activity, LayoutDashboard, Receipt } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const navItems = [
    { label: "Home", href: "/patient/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: "Appointments", href: "/patient/appointments", icon: <Calendar className="h-5 w-5" /> },
    { label: "Medical Records", href: "/patient/records", icon: <FileText className="h-5 w-5" /> },
    { label: "Bills & Payments", href: "/patient/billing", icon: <Receipt className="h-5 w-5" /> },
];

const MedicalRecords = () => {
    const { user } = useAuth();
    const { toast } = useToast();

    // In a real app, filtering would happen on backend or via ID in user context
    // For demo, we just pick the first patient or match by name if possible
    const patient = patients.find(p => p.email === user?.email) || patients[0];

    const handleDownload = (title: string) => {
        toast({
            title: "Download Started",
            description: `Downloading ${title}...`,
        });
    };

    return (
        <DashboardLayout navItems={navItems}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                <div>
                    <h1 className="text-2xl font-bold text-foreground">My Medical Records</h1>
                    <p className="text-muted-foreground">Access your health history and reports online.</p>
                </div>

                {!patient ? (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            No records found for your account.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {patient.reports.length === 0 ? (
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    You have no medical reports yet.
                                </CardContent>
                            </Card>
                        ) : (
                            patient.reports.map((report) => (
                                <Card key={report.id} className="hover:shadow-md transition-shadow">
                                    <CardContent className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                        <div className="flex items-start gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <FileText className="h-6 w-6 text-primary" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Badge variant="outline">{report.type}</Badge>
                                                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                        <Calendar className="h-3 w-3" />
                                                        {report.date}
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold text-lg">{report.title}</h3>
                                                <p className="text-sm text-muted-foreground">Report ID: {report.id}</p>
                                            </div>
                                        </div>

                                        <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={() => handleDownload(report.title)}>
                                            <Download className="h-4 w-4" />
                                            Download PDF
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    );
};

export default MedicalRecords;

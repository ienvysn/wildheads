import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, LayoutDashboard, Receipt } from "lucide-react";
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

    // Fetch real patient data from localStorage based on the ID used to login
    const patientData = (() => {
        const localPatients = JSON.parse(localStorage.getItem("arogya_patients") || "[]");
        return localPatients.find((p: any) => p.pid === user?.email || p.patientId === user?.email);
    })();

    const handleDownload = (title: string) => {
        toast({
            title: "Download Started",
            description: `Downloading ${title}...`,
        });
        // In a real app, this would use proper blob/url logic
    };

    // Since we don't have a backend to store reports array yet, we'll simulate 'Initial Registration Report'
    // if the patient exists.
    const hasInitialReport = !!patientData;

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

                {!patientData ? (
                    <Card>
                        <CardContent className="p-6 text-center text-muted-foreground">
                            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                            No patient records found associated with this login ID.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {!hasInitialReport ? (
                            <Card>
                                <CardContent className="p-6 text-center text-muted-foreground">
                                    You have no medical reports yet.
                                </CardContent>
                            </Card>
                        ) : (
                            // Display the Initial Hospital Registration Report
                            <Card className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <FileText className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Badge variant="outline">Registration</Badge>
                                                <span className="text-sm text-muted-foreground flex items-center gap-1">
                                                    <Calendar className="h-3 w-3" />
                                                    {new Date().toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-lg">Hospital Admission & Vitals Report</h3>
                                            <p className="text-sm text-muted-foreground">ID: {patientData.pid}_REG_001</p>
                                        </div>
                                    </div>

                                    <Button variant="outline" className="w-full sm:w-auto gap-2" onClick={() => handleDownload("Hospital Admission Report")}>
                                        <Download className="h-4 w-4" />
                                        Download PDF
                                    </Button>
                                </CardContent>
                            </Card>
                        )}

                        {/* Placeholder for future specific uploads if we add report array to localStorage later */}
                    </div>
                )}
            </motion.div>
        </DashboardLayout>
    );
};

export default MedicalRecords;

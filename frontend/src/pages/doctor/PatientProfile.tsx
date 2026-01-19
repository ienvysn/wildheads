import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePatient } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Activity, ArrowLeft, Brain, FileCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const PatientProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const patientId = id ? parseInt(id, 10) : undefined;
    const { data: patient } = usePatient(patientId);

    if (!patient) {
        return (
            <DashboardLayout navItems={[]} >
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <h2 className="text-2xl font-bold">Patient Not Found</h2>
                    <Button onClick={() => navigate("/doctor/dashboard")} className="mt-4">Back to Dashboard</Button>
                </div>
            </DashboardLayout>
        );
    }

    // Common Nav items for Doctor (should ideally be shared constant)
    const navItems = [
        { label: "Dashboard", href: "/doctor/dashboard", icon: <Activity className="h-5 w-5" /> },
        { label: "Patients", href: "/doctor/patients", icon: <FileText className="h-5 w-5" /> }, // Future page
    ];

    const handleAnalyze = () => {
        toast({
            title: "AI Analysis Started",
            description: "Analyzing latest patient data for new insights...",
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
                {/* Header with Back Button */}
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">
                            {patient.user?.first_name} {patient.user?.last_name}
                        </h1>
                        <p className="text-muted-foreground">
                            Patient ID: {patient.user?.username || patient.id} • {patient.gender || "N/A"}
                        </p>
                    </div>
                    <Button className="ml-auto gap-2" onClick={handleAnalyze}>
                        <Brain className="h-4 w-4" />
                        Analyze with AI
                    </Button>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column: Patient Details */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Medical Profile</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-muted/50 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Blood Group</p>
                                        <p className="font-semibold">{patient.blood_group || "N/A"}</p>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Date of Birth</p>
                                        <p className="font-semibold">{patient.date_of_birth || "N/A"}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-primary" />
                                        Notes
                                    </h4>
                                    <div className="text-sm text-muted-foreground">No clinical notes available.</div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Contact</h4>
                                    <p className="text-sm">{patient.contact_number || "N/A"}</p>
                                    <p className="text-sm">{patient.user?.email || "N/A"}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Reports & AI Summaries */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <FileCheck className="h-5 w-5 text-primary" />
                            Attached Reports
                        </h2>

                        <p className="text-muted-foreground">No reports available.</p>
                    </div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
};

export default PatientProfile;

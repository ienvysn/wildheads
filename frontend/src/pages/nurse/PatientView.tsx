import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getPatientById } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Activity, Clipboard } from "lucide-react";
import { motion } from "framer-motion";

const NursePatientView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const patient = getPatientById(id || "");

    const navItems = [
        { label: "Dashboard", href: "/nurse/dashboard", icon: <User className="h-5 w-5" /> },
        { label: "Record Vitals", href: "/nurse/vitals", icon: <Activity className="h-5 w-5" /> },
    ];

    if (!patient) {
        return (
            <DashboardLayout navItems={navItems}>
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <h2 className="text-2xl font-bold">Patient Not Found</h2>
                    <Button onClick={() => navigate("/nurse/dashboard")} className="mt-4">Back</Button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout navItems={navItems}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">{patient.name}</h1>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary">{patient.gender}</Badge>
                            <Badge variant="secondary">{patient.age} yrs</Badge>
                            <Badge variant="secondary">{patient.bloodGroup}</Badge>
                        </div>
                    </div>
                </div>

                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Nurse Overview of Med History - Restricted view compared to Doctor */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Medical Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <span className="text-sm font-semibold block text-muted-foreground uppercase tracking-wider">Allergies</span>
                                    <p className="text-destructive font-bold">{patient.allergies.join(", ")}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-semibold block text-muted-foreground uppercase tracking-wider">Conditions</span>
                                    <p>{patient.history.join(", ")}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reports - Short Description ONLY */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clipboard className="h-5 w-5" />
                                Recent Reports (Nurse View)
                            </CardTitle>
                            <CardDescription>Simplified summaries for quick reference.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {patient.reports.length === 0 ? <p className="text-muted-foreground">No reports.</p> : (
                                patient.reports.map(report => (
                                    <div key={report.id} className="p-4 bg-muted/30 rounded-lg border">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-semibold">{report.title}</h4>
                                            <span className="text-xs text-muted-foreground">{report.date}</span>
                                        </div>
                                        <p className="text-sm text-foreground/80 bg-background p-3 rounded border-l-2 border-primary">
                                            {report.nurseSummary}
                                        </p>
                                    </div>
                                ))
                            )}
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </DashboardLayout>
    );
};

export default NursePatientView;

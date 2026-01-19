import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { getPatientById } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Activity, AlertTriangle, ArrowLeft, Brain, FileCheck } from "lucide-react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

const PatientProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const patient = getPatientById(id || "");

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

    const handleOpenPdf = (reportTitle: string) => {
        toast({
            title: "Opening PDF Report",
            description: `Viewing ${reportTitle}. In a real app, this opens the PDF viewer.`,
        });
    };

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
                        <h1 className="text-3xl font-bold text-foreground">{patient.name}</h1>
                        <p className="text-muted-foreground">Patient ID: {patient.id} • {patient.gender} • {patient.age} years</p>
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
                                        <p className="font-semibold">{patient.bloodGroup}</p>
                                    </div>
                                    <div className="p-3 bg-muted/50 rounded-lg">
                                        <p className="text-xs text-muted-foreground">Allergies</p>
                                        <p className="font-semibold text-destructive">{patient.allergies.join(", ")}</p>
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <Activity className="h-4 w-4 text-primary" />
                                        Chronic History
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {patient.history.map((condition, i) => (
                                            <Badge key={i} variant="secondary">{condition}</Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="text-sm font-semibold mb-2">Contact</h4>
                                    <p className="text-sm">{patient.phone}</p>
                                    <p className="text-sm">{patient.email}</p>
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

                        {patient.reports.length === 0 ? (
                            <p className="text-muted-foreground">No reports available.</p>
                        ) : (
                            <div className="space-y-4">
                                {patient.reports.map((report) => (
                                    <Card key={report.id} className="overflow-hidden border-l-4 border-l-primary">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant={report.riskLevel === "High" ? "destructive" : report.riskLevel === "Medium" ? "outline" : "secondary"}>
                                                            Risk: {report.riskLevel}
                                                        </Badge>
                                                        <span className="text-xs text-muted-foreground">{report.date}</span>
                                                    </div>
                                                    <CardTitle className="text-lg">{report.title}</CardTitle>
                                                    <CardDescription>{report.type}</CardDescription>
                                                </div>
                                                <Button variant="outline" size="sm" onClick={() => handleOpenPdf(report.title)}>
                                                    <FileText className="h-4 w-4 mr-2" />
                                                    View PDF
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <Accordion type="single" collapsible>
                                                <AccordionItem value="ai-summary" className="border-b-0">
                                                    <AccordionTrigger className="hover:no-underline py-2">
                                                        <div className="flex items-center gap-2 text-primary font-semibold">
                                                            <Brain className="h-4 w-4" />
                                                            AI Summary & Insights
                                                        </div>
                                                    </AccordionTrigger>
                                                    <AccordionContent className="text-sm leading-relaxed bg-primary/5 p-4 rounded-lg mt-2">
                                                        {report.aiSummary}

                                                        {report.symptoms && report.symptoms.length > 0 && (
                                                            <div className="mt-3 pt-3 border-t border-primary/10">
                                                                <span className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Reported Symptoms</span>
                                                                <div className="flex flex-wrap gap-2 mt-1">
                                                                    {report.symptoms.map(s => <span key={s} className="text-xs bg-background px-2 py-1 rounded border shadow-sm">{s}</span>)}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </DashboardLayout>
    );
};

export default PatientProfile;

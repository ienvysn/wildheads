import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePatient } from "@/hooks/useApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Activity, Clipboard } from "lucide-react";
import { motion } from "framer-motion";
import { useLabTests, useCreateTestResult } from "@/hooks/useApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const NursePatientView = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const patientId = id ? parseInt(id, 10) : undefined;
    const { data: patient } = usePatient(patientId);
    const { data: labTests } = useLabTests();
    const createTestResult = useCreateTestResult();
    const [selectedTest, setSelectedTest] = useState<string>("");
    const [resultNotes, setResultNotes] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);

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
                        <h1 className="text-2xl font-bold text-foreground">
                          {patient.user?.first_name} {patient.user?.last_name}
                        </h1>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                            <Badge variant="secondary">{patient.gender || "N/A"}</Badge>
                            <Badge variant="secondary">{patient.date_of_birth || "N/A"}</Badge>
                            <Badge variant="secondary">{patient.blood_group || "N/A"}</Badge>
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
                                    <span className="text-sm font-semibold block text-muted-foreground uppercase tracking-wider">Contact</span>
                                    <p className="font-bold">{patient.contact_number || "N/A"}</p>
                                </div>
                                <div>
                                    <span className="text-sm font-semibold block text-muted-foreground uppercase tracking-wider">Address</span>
                                    <p>{patient.address || "N/A"}</p>
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
                            <p className="text-muted-foreground">No reports.</p>
                        </CardContent>
                    </Card>

                    {/* Upload Lab Report */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Lab Report</CardTitle>
                            <CardDescription>Attach report for this patient</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Lab Test</Label>
                                <Select value={selectedTest} onValueChange={setSelectedTest}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select lab test" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {(labTests || []).map((test: any) => (
                                            <SelectItem key={test.id} value={String(test.id)}>
                                                {test.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Result Notes</Label>
                                <Textarea value={resultNotes} onChange={(e) => setResultNotes(e.target.value)} placeholder="Result summary..." />
                            </div>

                            <div className="space-y-2">
                                <Label>Report File</Label>
                                <Input type="file" accept=".pdf,.png,.jpg,.jpeg" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                            </div>

                            <Button
                                onClick={() => {
                                    if (!patientId || !selectedTest || !file) {
                                        return;
                                    }
                                    const formData = new FormData();
                                    formData.append("patient", String(patientId));
                                    formData.append("test", selectedTest);
                                    formData.append("result_data", resultNotes || "");
                                    formData.append("file_attachment", file);
                                    createTestResult.mutate(formData);
                                }}
                                disabled={!patientId || !selectedTest || !file || createTestResult.isLoading}
                            >
                                {createTestResult.isLoading ? "Uploading..." : "Upload Report"}
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </motion.div>
        </DashboardLayout>
    );
};

export default NursePatientView;

import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, User, FileText, Copy, Upload, File } from "lucide-react";

// Mock existing patients - Start empty as requested
const initialPatients: any[] = [];

const AdminPatients = () => {
    const { toast } = useToast();
    const [patients, setPatients] = useState(initialPatients);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [generatedId, setGeneratedId] = useState("");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        age: "",
        gender: "",
        contact: "",
        weight: "",
        height: "",
        bp: "",
        history: "",
        symptoms: "",
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFile(e.target.files[0]);
        }
    };

    const handleCreatePatient = () => {
        // Basic validation
        if (!formData.name || !formData.age || !formData.gender || !uploadedFile) {
            toast({
                title: "Missing Information",
                description: "Please fill in required details and upload the patient PDF.",
                variant: "destructive"
            });
            return;
        }

        const newPid = `PID-2026-00${patients.length + 1}`;
        setGeneratedId(newPid);

        const newPatient = {
            id: patients.length + 1,
            name: formData.name,
            pid: newPid,
            age: parseInt(formData.age),
            contact: formData.contact || "N/A",
            gender: formData.gender,
        };

        setPatients([...patients, newPatient]);

        toast({
            title: "Patient Registered",
            description: `ID: ${newPid} | File: ${uploadedFile.name} uploaded.`,
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied", description: "Patient ID copied to clipboard." });
    };

    return (
        <DashboardLayout navItems={[
            { label: "Dashboard", href: "/admin/dashboard", icon: <User className="h-4 w-4" /> },
            { label: "Patient Management", href: "/admin/patients", icon: <User className="h-4 w-4" /> },
        ]}>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold">Patient Management</h1>
                        <p className="text-muted-foreground">Register patients, upload reports, and generate access IDs.</p>
                    </div>
                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) {
                            setGeneratedId("");
                            setUploadedFile(null);
                            setFormData({ name: "", age: "", gender: "", contact: "", weight: "", height: "", bp: "", history: "", symptoms: "" });
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Register New Patient
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>New Patient Registration</DialogTitle>
                            </DialogHeader>

                            {!generatedId ? (
                                <div className="grid gap-6 py-4">
                                    {/* Personal Info */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Full Name *</Label>
                                            <Input placeholder="e.g. John Doe" value={formData.name} onChange={e => handleInputChange("name", e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Gender *</Label>
                                            <Select value={formData.gender} onValueChange={val => handleInputChange("gender", val)}>
                                                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="Male">Male</SelectItem>
                                                    <SelectItem value="Female">Female</SelectItem>
                                                    <SelectItem value="Other">Other</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Age *</Label>
                                            <Input type="number" placeholder="e.g. 30" value={formData.age} onChange={e => handleInputChange("age", e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Contact Number</Label>
                                            <Input placeholder="e.g. +1 234 567 890" value={formData.contact} onChange={e => handleInputChange("contact", e.target.value)} />
                                        </div>
                                    </div>

                                    {/* Vitals */}
                                    <div className="space-y-2">
                                        <Label className="font-semibold text-primary">Vitals & Health Metrics</Label>
                                        <div className="grid grid-cols-3 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs">Weight (kg)</Label>
                                                <Input placeholder="e.g. 70" value={formData.weight} onChange={e => handleInputChange("weight", e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Height (cm)</Label>
                                                <Input placeholder="e.g. 175" value={formData.height} onChange={e => handleInputChange("height", e.target.value)} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs">Blood Pressure</Label>
                                                <Input placeholder="e.g. 120/80" value={formData.bp} onChange={e => handleInputChange("bp", e.target.value)} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Clinical Info */}
                                    <div className="space-y-2">
                                        <Label>Symptoms / Complaint</Label>
                                        <Textarea placeholder="Describe current symptoms..." value={formData.symptoms} onChange={e => handleInputChange("symptoms", e.target.value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Medical History (Optional)</Label>
                                        <Textarea placeholder="Past conditions, allergies..." value={formData.history} onChange={e => handleInputChange("history", e.target.value)} />
                                    </div>

                                    {/* File Upload */}
                                    <div className="space-y-2">
                                        <Label>Upload Patient Report (PDF) *</Label>
                                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
                                            <Input
                                                type="file"
                                                accept=".pdf"
                                                className="hidden"
                                                id="file-upload"
                                                onChange={handleFileChange}
                                            />
                                            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Upload className="h-5 w-5 text-primary" />
                                                </div>
                                                {uploadedFile ? (
                                                    <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                                        <File className="h-4 w-4" />
                                                        {uploadedFile.name}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <span className="text-sm font-medium">Click to upload report</span>
                                                        <span className="text-xs text-muted-foreground">PDF files only (Max 10MB)</span>
                                                    </>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    <DialogFooter className="pt-4">
                                        <Button onClick={handleCreatePatient} className="w-full sm:w-auto">Generate Patient ID</Button>
                                    </DialogFooter>
                                </div>
                            ) : (
                                <div className="py-8 flex flex-col items-center space-y-6 text-center">
                                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center shadow-sm">
                                        <FileText className="h-8 w-8 text-green-600" />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-bold text-green-700">Registration Complete!</h3>
                                        <p className="text-muted-foreground max-w-sm mx-auto">
                                            The patient account has been created. Please share these credentials with the patient.
                                        </p>
                                    </div>

                                    <Card className="w-full max-w-sm border-2 border-green-100 bg-green-50/50">
                                        <CardContent className="pt-6 space-y-4">
                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Patient ID</p>
                                                <div className="flex items-center justify-center gap-2">
                                                    <code className="text-2xl font-mono font-bold text-primary">{generatedId}</code>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-green-100" onClick={() => copyToClipboard(generatedId)}>
                                                        <Copy className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="h-px bg-green-200/50" />

                                            <div className="space-y-1">
                                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Default Password</p>
                                                <code className="text-lg font-mono font-medium">arogya123</code>
                                            </div>
                                        </CardContent>
                                    </Card>

                                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                        Back to List
                                    </Button>
                                </div>
                            )}
                        </DialogContent>
                    </Dialog>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Registered Patients</CardTitle>
                        <CardDescription>Total {patients.length} active records</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Patient ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Age/Gender</TableHead>
                                    <TableHead>Contact</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {patients.map((patient) => (
                                    <TableRow key={patient.id}>
                                        <TableCell className="font-mono">{patient.pid}</TableCell>
                                        <TableCell className="font-medium">{patient.name}</TableCell>
                                        <TableCell>{patient.age} / {patient.gender}</TableCell>
                                        <TableCell>{patient.contact}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm">View History</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
};

export default AdminPatients;

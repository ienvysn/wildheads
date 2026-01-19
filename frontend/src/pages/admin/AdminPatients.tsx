import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Plus, User, FileText, Copy, Upload, File, Search, History, Download, Edit, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AdminPatients = () => {
    const { toast } = useToast();
    const [patients, setPatients] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<"new" | "existing">("existing");
    const [searchQuery, setSearchQuery] = useState("");
    const [generatedId, setGeneratedId] = useState("");
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [selectedPatient, setSelectedPatient] = useState<any>(null);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editingPatientId, setEditingPatientId] = useState<number | null>(null);

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

    // Load patients from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem("hospital_patients");
        if (saved) {
            setPatients(JSON.parse(saved));
        }
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setUploadedFile(e.target.files[0]);
        }
    };

    const handleCreatePatient = () => {
        if (!formData.name || !formData.age || !formData.gender || !uploadedFile) {
            toast({
                title: "Missing Information",
                description: "Please fill in required details and upload the patient PDF.",
                variant: "destructive"
            });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            const newPid = `PID-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

            const newPatient = {
                id: Date.now(),
                ...formData,
                pid: newPid,
                fileName: uploadedFile.name,
                fileData: base64String, // Store the actual PDF data
                createdAt: new Date().toISOString(),
            };

            const updatedPatients = [newPatient, ...patients];
            setPatients(updatedPatients);
            localStorage.setItem("hospital_patients", JSON.stringify(updatedPatients));
            setGeneratedId(newPid);

            toast({
                title: "Patient Registered",
                description: `ID: ${newPid} | File: ${uploadedFile.name} uploaded.`,
            });
        };
        reader.readAsDataURL(uploadedFile);
    };

    const downloadPDF = (base64Data: string, fileName: string) => {
        const link = document.createElement("a");
        link.href = base64Data;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Downloading", description: "Your report is being downloaded." });
    };

    const handleDeletePatient = (id: number) => {
        const updatedPatients = patients.filter(p => p.id !== id);
        setPatients(updatedPatients);
        localStorage.setItem("hospital_patients", JSON.stringify(updatedPatients));
        toast({
            title: "Patient Deleted",
            description: "The patient record has been removed.",
            variant: "destructive"
        });
    };

    const handleEditPatient = (patient: any) => {
        setEditingPatientId(patient.id);
        setFormData({
            name: patient.name,
            age: patient.age,
            gender: patient.gender,
            contact: patient.contact || "",
            weight: patient.weight || "",
            height: patient.height || "",
            bp: patient.bp || "",
            history: patient.history || "",
            symptoms: patient.symptoms || "",
        });
        setIsEditOpen(true);
    };

    const handleUpdatePatient = () => {
        if (!formData.name || !formData.age || !formData.gender) {
            toast({
                title: "Missing Information",
                description: "Name, Age, and Gender are required.",
                variant: "destructive"
            });
            return;
        }

        const updatedPatients = patients.map(p => {
            if (p.id === editingPatientId) {
                return {
                    ...p,
                    ...formData,
                };
            }
            return p;
        });

        setPatients(updatedPatients);
        localStorage.setItem("hospital_patients", JSON.stringify(updatedPatients));
        setIsEditOpen(false);
        setEditingPatientId(null);
        toast({
            title: "Patient Updated",
            description: `Record for ${formData.name} has been updated.`,
        });
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied", description: "Patient ID copied to clipboard." });
    };

    const filteredPatients = patients.filter(p =>
        p.pid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const openHistory = (patient: any) => {
        setSelectedPatient(patient);
        setIsHistoryOpen(true);
    };

    return (
        <DashboardLayout navItems={[
            { label: "Dashboard", href: "/admin/dashboard", icon: <User className="h-4 w-4" /> },
            { label: "Patient Management", href: "/admin/patients", icon: <User className="h-4 w-4" /> },
        ]}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">Patient Management</h1>
                        <p className="text-muted-foreground">Manage your hospital's patient database and records.</p>
                    </div>
                    <div className="flex bg-muted rounded-lg p-1">
                        <Button
                            variant={activeTab === "existing" ? "default" : "ghost"}
                            onClick={() => setActiveTab("existing")}
                            className="gap-2"
                        >
                            <Search className="h-4 w-4" /> Existing Patients
                        </Button>
                        <Button
                            variant={activeTab === "new" ? "default" : "ghost"}
                            onClick={() => {
                                setActiveTab("new");
                                setGeneratedId("");
                                setUploadedFile(null);
                                setFormData({ name: "", age: "", gender: "", contact: "", weight: "", height: "", bp: "", history: "", symptoms: "" });
                            }}
                            className="gap-2"
                        >
                            <Plus className="h-4 w-4" /> New Patient
                        </Button>
                    </div>
                </div>

                {activeTab === "new" ? (
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader>
                            <CardTitle>Register New Patient</CardTitle>
                            <CardDescription>Enter patient details and upload medical history report.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {!generatedId ? (
                                <div className="grid gap-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Full Name *</Label>
                                            <Input placeholder="John Doe" value={formData.name} onChange={e => handleInputChange("name", e.target.value)} />
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
                                            <Input type="number" placeholder="30" value={formData.age} onChange={e => handleInputChange("age", e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Contact Number</Label>
                                            <Input placeholder="+1 234 567 890" value={formData.contact} onChange={e => handleInputChange("contact", e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs">Weight (kg)</Label>
                                            <Input placeholder="70" value={formData.weight} onChange={e => handleInputChange("weight", e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Height (cm)</Label>
                                            <Input placeholder="175" value={formData.height} onChange={e => handleInputChange("height", e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs">Blood Pressure</Label>
                                            <Input placeholder="120/80" value={formData.bp} onChange={e => handleInputChange("bp", e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Current Symptoms</Label>
                                        <Textarea placeholder="Describe symptoms..." value={formData.symptoms} onChange={e => handleInputChange("symptoms", e.target.value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Medical History</Label>
                                        <Textarea placeholder="Past conditions..." value={formData.history} onChange={e => handleInputChange("history", e.target.value)} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Upload PDF Report *</Label>
                                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 cursor-pointer">
                                            <Input type="file" accept=".pdf" className="hidden" id="reg-upload" onChange={handleFileChange} />
                                            <label htmlFor="reg-upload" className="cursor-pointer flex flex-col items-center gap-2 w-full">
                                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                                    <Upload className="h-5 w-5 text-primary" />
                                                </div>
                                                {uploadedFile ? (
                                                    <span className="text-sm font-medium text-green-600">{uploadedFile.name}</span>
                                                ) : (
                                                    <span className="text-sm">Click to upload PDF report</span>
                                                )}
                                            </label>
                                        </div>
                                    </div>

                                    <Button onClick={handleCreatePatient} size="lg" className="w-full">Create Patient Record</Button>
                                </div>
                            ) : (
                                <div className="py-6 flex flex-col items-center space-y-4 text-center">
                                    <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                                        <FileText className="h-8 w-8 text-green-600" />
                                    </div>
                                    <h3 className="text-2xl font-bold">Registration Successful</h3>
                                    <Card className="w-full border-2 border-green-100 bg-green-50/50">
                                        <CardContent className="pt-6 space-y-4 text-center">
                                            <p className="text-xs font-bold uppercase text-muted-foreground">Assigned Patient ID</p>
                                            <div className="flex items-center justify-center gap-2">
                                                <code className="text-3xl font-mono font-bold text-primary">{generatedId}</code>
                                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(generatedId)}><Copy className="h-4 w-4" /></Button>
                                            </div>
                                            <div className="h-px bg-green-200" />
                                            <p className="text-sm font-medium">Password: <code className="bg-white px-2 py-0.5 rounded border">arogya123</code></p>
                                        </CardContent>
                                    </Card>
                                    <Button onClick={() => setActiveTab("existing")} variant="outline" className="w-full">View Database</Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Patient Database</CardTitle>
                                    <CardDescription>Showing all patients registered in the system.</CardDescription>
                                </div>
                                <div className="relative max-w-sm">
                                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search by ID or Name..."
                                        className="pl-9"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Registered</TableHead>
                                            <TableHead>Patient ID</TableHead>
                                            <TableHead>Full Name</TableHead>
                                            <TableHead>Age/Gender</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredPatients.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                    No patients found.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            filteredPatients.map((p) => (
                                                <TableRow key={p.id}>
                                                    <TableCell className="text-xs text-muted-foreground">
                                                        {new Date(p.createdAt).toLocaleDateString()}
                                                    </TableCell>
                                                    <TableCell className="font-mono font-bold text-primary">{p.pid}</TableCell>
                                                    <TableCell className="font-medium">{p.name}</TableCell>
                                                    <TableCell>{p.age} / {p.gender}</TableCell>
                                                    <TableCell className="text-right flex justify-end gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-2"
                                                            onClick={() => openHistory(p)}
                                                        >
                                                            <History className="h-3 w-3" /> History
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-2 text-blue-600 hover:text-blue-700"
                                                            onClick={() => handleEditPatient(p)}
                                                        >
                                                            <Edit className="h-3 w-3" /> Edit
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="gap-2 text-red-600 hover:text-red-700"
                                                            onClick={() => handleDeletePatient(p.id)}
                                                        >
                                                            <Trash2 className="h-3 w-3" /> Delete
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* History Detail Dialog */}
                <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
                    <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-2xl">
                                <FileText className="h-6 w-6 text-primary" />
                                Patient Medical Record
                            </DialogTitle>
                        </DialogHeader>

                        {selectedPatient && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 py-4">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-muted rounded-lg">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Patient ID</p>
                                            <p className="text-lg font-mono font-bold text-primary">{selectedPatient.pid}</p>
                                        </div>
                                        <div className="p-3 bg-muted rounded-lg">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Registration Date</p>
                                            <p className="text-lg font-medium">{new Date(selectedPatient.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold border-b pb-1">Personal Details</h4>
                                        <div className="grid grid-cols-2 gap-y-2 text-sm">
                                            <p className="text-muted-foreground">Full Name:</p>
                                            <p className="font-medium">{selectedPatient.name}</p>
                                            <p className="text-muted-foreground">Age / Gender:</p>
                                            <p className="font-medium">{selectedPatient.age} / {selectedPatient.gender}</p>
                                            <p className="text-muted-foreground">Contact:</p>
                                            <p className="font-medium">{selectedPatient.contact || "Not provided"}</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold border-b pb-1 text-primary">Vitals at Registration</h4>
                                        <div className="grid grid-cols-3 gap-2 text-center">
                                            <div className="p-2 border rounded">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Weight</p>
                                                <p className="font-bold">{selectedPatient.weight || "--"} kg</p>
                                            </div>
                                            <div className="p-2 border rounded">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Height</p>
                                                <p className="font-bold">{selectedPatient.height || "--"} cm</p>
                                            </div>
                                            <div className="p-2 border rounded">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">BP</p>
                                                <p className="font-bold">{selectedPatient.bp || "--"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="font-bold border-b pb-1">Clinical Information</h4>
                                        <div className="space-y-2">
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground">SYMPTOMS</p>
                                                <p className="text-sm bg-muted/50 p-2 rounded italic">"{selectedPatient.symptoms || "No symptoms noted"}"</p>
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-muted-foreground">HISTORY</p>
                                                <p className="text-sm bg-muted/50 p-2 rounded break-words">{selectedPatient.history || "No prior history recorded"}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 h-full flex flex-col">
                                    <h4 className="font-bold border-b pb-1 flex justify-between items-center">
                                        Admission Report (PDF Preview)
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-7 text-xs gap-1"
                                            onClick={() => downloadPDF(selectedPatient.fileData, selectedPatient.fileName)}
                                        >
                                            <Download className="h-3 w-3" /> Download
                                        </Button>
                                    </h4>
                                    <div className="flex-1 min-h-[400px] border-2 border-dashed rounded-xl bg-muted/30 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden group">
                                        {selectedPatient.fileData ? (
                                            <iframe
                                                src={selectedPatient.fileData}
                                                className="w-full h-full rounded-lg border shadow-sm"
                                                title="PDF Preview"
                                            />
                                        ) : (
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="w-full max-w-[280px] aspect-[1/1.41] bg-white shadow-2xl rounded p-4 flex flex-col gap-3">
                                                    <div className="h-3 w-3/4 bg-muted rounded animate-pulse" />
                                                    <div className="h-2 w-1/2 bg-muted/50 rounded" />
                                                    <div className="space-y-1 pt-4">
                                                        <div className="h-1.5 w-full bg-muted/30 rounded" />
                                                        <div className="h-1.5 w-full bg-muted/30 rounded" />
                                                        <div className="h-1.5 w-3/4 bg-muted/30 rounded" />
                                                    </div>
                                                </div>
                                                <p className="text-sm text-muted-foreground italic">Legacy record: No preview data available</p>
                                            </div>
                                        )}
                                        <div className="mt-4 w-full px-4 text-center">
                                            <Badge variant="secondary" className="mb-2 font-mono truncate max-w-full">{selectedPatient.fileName}</Badge>
                                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Secure Cloud Storage Link Active</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <DialogFooter className="mt-4">
                            <Button className="w-full" variant="outline" onClick={() => setIsHistoryOpen(false)}>Close Record</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Edit Patient Dialog */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Edit Patient Record</DialogTitle>
                        <DialogDescription>Modify details for the selected patient record.</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Full Name *</Label>
                                <Input value={formData.name} onChange={e => handleInputChange("name", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Gender *</Label>
                                <Select value={formData.gender} onValueChange={val => handleInputChange("gender", val)}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Age *</Label>
                                <Input type="number" value={formData.age} onChange={e => handleInputChange("age", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Contact Number</Label>
                                <Input value={formData.contact} onChange={e => handleInputChange("contact", e.target.value)} />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Weight (kg)</Label>
                                <Input value={formData.weight} onChange={e => handleInputChange("weight", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Height (cm)</Label>
                                <Input value={formData.height} onChange={e => handleInputChange("height", e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Blood Pressure</Label>
                                <Input value={formData.bp} onChange={e => handleInputChange("bp", e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Current Symptoms</Label>
                            <Textarea value={formData.symptoms} onChange={e => handleInputChange("symptoms", e.target.value)} />
                        </div>

                        <div className="space-y-2">
                            <Label>Medical History</Label>
                            <Textarea value={formData.history} onChange={e => handleInputChange("history", e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
                        <Button onClick={handleUpdatePatient}>Update Record</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </DashboardLayout>
    );
};

export default AdminPatients;

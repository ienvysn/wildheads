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
import { Plus, User, FileText, Copy } from "lucide-react";
import { authApi } from "@/services/api";
import { usePatients } from "@/hooks/useApi";

const AdminPatients = () => {
    const { toast } = useToast();
    const { data: patientsData, isLoading, refetch } = usePatients();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [generatedId, setGeneratedId] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        gender: "",
        contact: "",
        dateOfBirth: "",
        history: "",
        symptoms: "",
    });

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleCreatePatient = async () => {
        // Basic validation
        if (!formData.name || !formData.email || !formData.gender || !formData.dateOfBirth) {
            toast({
                title: "Missing Information",
                description: "Please fill in required details.",
                variant: "destructive"
            });
            return;
        }

        const newPid = `PID-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
        setIsSubmitting(true);
        try {
            const [firstName, ...lastParts] = formData.name.trim().split(" ");
            const lastName = lastParts.join(" ");
            await authApi.register({
                username: newPid,
                email: formData.email,
                password: "arogya123",
                role: "patient",
                first_name: firstName || formData.name,
                last_name: lastName || "",
                date_of_birth: formData.dateOfBirth,
                gender: formData.gender,
                contact_number: formData.contact,
                address: "",
            });
            setGeneratedId(newPid);
            await refetch();
            toast({
                title: "Patient Registered",
                description: `ID: ${newPid} | Default password: arogya123`,
            });
        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.response?.data?.detail || error.response?.data?.email?.[0] || "Unable to create patient",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
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
                            setFormData({ name: "", email: "", gender: "", contact: "", dateOfBirth: "", history: "", symptoms: "" });
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
                                            <Label>Email *</Label>
                                            <Input placeholder="e.g. john@example.com" value={formData.email} onChange={e => handleInputChange("email", e.target.value)} />
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
                                            <Label>Date of Birth *</Label>
                                            <Input type="date" value={formData.dateOfBirth} onChange={e => handleInputChange("dateOfBirth", e.target.value)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Contact Number</Label>
                                            <Input placeholder="e.g. +1 234 567 890" value={formData.contact} onChange={e => handleInputChange("contact", e.target.value)} />
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


                                    <DialogFooter className="pt-4">
                                        <Button onClick={handleCreatePatient} className="w-full sm:w-auto" disabled={isSubmitting}>
                                            {isSubmitting ? "Registering..." : "Generate Patient ID"}
                                        </Button>
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
                        <CardDescription>Total {patientsData?.length || 0} active records</CardDescription>
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
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center text-muted-foreground">Loading patients...</TableCell>
                                    </TableRow>
                                ) : (patientsData || []).map((patient: any) => (
                                    <TableRow key={patient.id}>
                                        <TableCell className="font-mono">{patient.user?.username || patient.id}</TableCell>
                                        <TableCell className="font-medium">{patient.user?.first_name} {patient.user?.last_name}</TableCell>
                                        <TableCell>{patient.date_of_birth || "N/A"} / {patient.gender || "N/A"}</TableCell>
                                        <TableCell>{patient.contact_number || "N/A"}</TableCell>
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

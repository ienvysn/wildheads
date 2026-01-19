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
import { Plus, Users, LayoutDashboard } from "lucide-react";
import { authApi } from "@/services/api";
import { usePatients } from "@/hooks/useApi";
import { useNavigate } from "react-router-dom";

const NursePatients = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: patientsData, isLoading, refetch } = usePatients();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [generatedKey, setGeneratedKey] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    gender: "",
    contact: "",
    dateOfBirth: "",
    notes: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreatePatient = async () => {
    if (!formData.name || !formData.email || !formData.gender || !formData.dateOfBirth) {
      toast({
        title: "Missing Information",
        description: "Please fill in required details.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const [firstName, ...lastParts] = formData.name.trim().split(" ");
      const lastName = lastParts.join(" ");
      const response = await authApi.register({
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
      const patientKey = response.data?.patient_key || response.data?.username || "";
      setGeneratedKey(patientKey);
      await refetch();
      toast({
        title: "Patient Registered",
        description: `Patient Key: ${patientKey} | Default password: arogya123`,
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

  const navItems = [
    { label: "Dashboard", href: "/nurse/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: "Patients", href: "/nurse/patients", icon: <Users className="h-5 w-5" /> },
  ];

  return (
    <DashboardLayout navItems={navItems}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Patient Management</h1>
            <p className="text-muted-foreground">Create patient accounts and provide login keys.</p>
          </div>
          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setGeneratedKey("");
                setFormData({ name: "", email: "", gender: "", contact: "", dateOfBirth: "", notes: "" });
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Patient
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl">
              <DialogHeader>
                <DialogTitle>New Patient</DialogTitle>
              </DialogHeader>

              {!generatedKey ? (
                <div className="grid gap-4 py-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Full Name *</Label>
                      <Input placeholder="e.g. John Doe" value={formData.name} onChange={(e) => handleInputChange("name", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Email *</Label>
                      <Input placeholder="e.g. john@example.com" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Gender *</Label>
                      <Select value={formData.gender} onValueChange={(val) => handleInputChange("gender", val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date of Birth *</Label>
                      <Input type="date" value={formData.dateOfBirth} onChange={(e) => handleInputChange("dateOfBirth", e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Contact Number</Label>
                      <Input placeholder="e.g. +1 234 567 890" value={formData.contact} onChange={(e) => handleInputChange("contact", e.target.value)} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea placeholder="Notes or initial symptoms" value={formData.notes} onChange={(e) => handleInputChange("notes", e.target.value)} />
                  </div>

                  <DialogFooter>
                    <Button onClick={handleCreatePatient} disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Patient"}
                    </Button>
                  </DialogFooter>
                </div>
              ) : (
                <Card>
                  <CardContent className="p-4 space-y-2">
                    <p className="text-sm">Patient Key</p>
                    <p className="text-lg font-mono font-bold">{generatedKey}</p>
                    <p className="text-xs text-muted-foreground">Default password: arogya123</p>
                  </CardContent>
                </Card>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Registered Patients</CardTitle>
            <CardDescription>Total {patientsData?.length || 0} records</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient Key</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Gender</TableHead>
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
                    <TableCell>{patient.gender || "N/A"}</TableCell>
                    <TableCell>{patient.contact_number || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/nurse/patient/${patient.id}`)}>Open</Button>
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

export default NursePatients;

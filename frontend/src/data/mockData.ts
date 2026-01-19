
export interface Report {
    id: string;
    title: string;
    date: string;
    type: "Lab" | "Checkup" | "Emergency" | "Prescription";
    pdfUrl: string; // Simulated link to PDF
    aiSummary: string; // Detailed medical summary for Doctor
    nurseSummary: string; // Simplified summary for Nurse
    riskLevel: "Low" | "Medium" | "High";
    symptoms?: string[];
}

export interface Patient {
    id: string;
    patientId: string; // Hospital-generated ID for login
    name: string;
    email: string; // To link with auth
    age: number;
    gender: "Male" | "Female" | "Other";
    bloodGroup: string;
    height?: string; // e.g., "175 cm"
    weight?: string; // e.g., "70 kg"
    bloodPressure?: string; // e.g., "120/80"
    doctorId: string;
    phone: string;
    history: string[];
    allergies: string[];
    reports: Report[];
}

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    email: string;
}

export const doctors: Doctor[] = [
    { id: "d1", name: "Dr. John Smith", specialty: "Cardiology", email: "doctor@arogya.com" },
    { id: "d2", name: "Dr. Sarah Brown", specialty: "Pediatrics", email: "pediatrics@arogya.com" },
];

export const patients: Patient[] = [];

export const getPatientById = (id: string) => patients.find(p => p.id === id);
export const getPatientsByDoctor = (doctorId: string) => patients.filter(p => p.doctorId === doctorId);

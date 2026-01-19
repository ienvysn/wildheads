
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
    name: string;
    email: string; // To link with auth
    age: number;
    gender: "Male" | "Female" | "Other";
    bloodGroup: string;
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
    { id: "d1", name: "Dr. John Smith", specialty: "Cardiology", email: "doctor@uhcare.com" },
    { id: "d2", name: "Dr. Sarah Brown", specialty: "Pediatrics", email: "pediatrics@uhcare.com" },
];

export const patients: Patient[] = [
    {
        id: "p1",
        name: "Sarah Johnson",
        email: "sarah@example.com",
        age: 45,
        gender: "Female",
        bloodGroup: "O+",
        doctorId: "d1",
        phone: "+1 (555) 123-4567",
        history: ["Hypertension", "Type 2 Diabetes"],
        allergies: ["Penicillin"],
        reports: [
            {
                id: "r1",
                title: "Annual Cardiac Screening",
                date: "2026-01-15",
                type: "Checkup",
                pdfUrl: "#",
                aiSummary: "Patient shows stable BP (130/85) despite history of hypertension. ECG indicates normal sinus rhythm. Slight elevation in LDL cholesterol. Recommended lifestyle changes and continuation of Lisinopril.",
                nurseSummary: "Routine checkup completed. Vitals stable. medication refill ordered.",
                riskLevel: "Medium",
                symptoms: ["Fatigue", "Mild shortness of breath"]
            },
            {
                id: "r2",
                title: "Blood Work Analysis",
                date: "2026-01-10",
                type: "Lab",
                pdfUrl: "#",
                aiSummary: "HBA1C levels at 6.8%, indicating controlled diabetes. Kidney function tests normal. Potassium levels slightly low.",
                nurseSummary: "Blood drawn for lipid profile and HBA1C. No adverse reactions.",
                riskLevel: "Low"
            }
        ]
    },
    {
        id: "p2",
        name: "Mike Davis",
        email: "mike@example.com",
        age: 32,
        gender: "Male",
        bloodGroup: "A-",
        doctorId: "d1",
        phone: "+1 (555) 987-6543",
        history: ["Asthma"],
        allergies: ["None"],
        reports: [
            {
                id: "r3",
                title: "Emergency Visit - Asthma Attack",
                date: "2025-12-20",
                type: "Emergency",
                pdfUrl: "#",
                aiSummary: "Patient admitted with severe wheezing and SpO2 at 88%. Administered nebulizer treatment (Albuterol/Ipratropium). SpO2 recovered to 98% within 30 mins. Prescribed Prednisone taper.",
                nurseSummary: "ER admission for asthma exacerbation. Nebulizer treatment given. Discharged stable.",
                riskLevel: "High",
                symptoms: ["Wheezing", "Chest tightness", "Difficulty breathing"]
            }
        ]
    },
    {
        id: "p3",
        name: "Emma Wilson",
        email: "emma@example.com",
        age: 8,
        gender: "Female",
        bloodGroup: "B+",
        doctorId: "d2",
        phone: "+1 (555) 456-7890",
        history: ["None"],
        allergies: ["Peanuts"],
        reports: [
            {
                id: "r4",
                title: "Growth Check",
                date: "2026-01-18",
                type: "Checkup",
                pdfUrl: "#",
                aiSummary: "Growth percentile at 75th for height and 60th for weight. Development milestones met. Vaccination catch-up scheduled.",
                nurseSummary: "Height/Weight recorded. Vaccination scheduled.",
                riskLevel: "Low"
            }
        ]
    }
];

export const getPatientById = (id: string) => patients.find(p => p.id === id);
export const getPatientsByDoctor = (doctorId: string) => patients.filter(p => p.doctorId === doctorId);

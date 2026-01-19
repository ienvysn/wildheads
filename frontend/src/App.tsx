import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminPatients from "./pages/admin/AdminPatients";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import PatientProfile from "./pages/doctor/PatientProfile";
import NurseDashboard from "./pages/nurse/NurseDashboard";
import NursePatientView from "./pages/nurse/PatientView";
import PatientDashboard from "./pages/patient/PatientDashboard";
import MedicalRecords from "./pages/patient/MedicalRecords";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="patients" element={<AdminPatients />} />
                    <Route path="*" element={<AdminDashboard />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Doctor Routes */}
            <Route
              path="/doctor/*"
              element={
                <ProtectedRoute allowedRoles={["doctor"]}>
                  <Routes>
                    <Route path="dashboard" element={<DoctorDashboard />} />
                    <Route path="patient/:id" element={<PatientProfile />} />
                    <Route path="*" element={<DoctorDashboard />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Nurse Routes */}
            <Route
              path="/nurse/*"
              element={
                <ProtectedRoute allowedRoles={["nurse"]}>
                  <Routes>
                    <Route path="dashboard" element={<NurseDashboard />} />
                    <Route path="patient/:id" element={<NursePatientView />} />
                    <Route path="*" element={<NurseDashboard />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Patient Routes */}
            <Route
              path="/patient/*"
              element={
                <ProtectedRoute allowedRoles={["patient"]}>
                  <Routes>
                    <Route path="dashboard" element={<PatientDashboard />} />
                    <Route path="records" element={<MedicalRecords />} />
                    <Route path="*" element={<PatientDashboard />} />
                  </Routes>
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);


export default App;

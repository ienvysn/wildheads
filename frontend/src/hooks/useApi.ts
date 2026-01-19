import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { medicalApi, pharmacyApi, labApi, billingApi, aiApi } from "@/services/api";
import { useToast } from "@/hooks/use-toast";

// Medical Hooks
export const useAppointments = () => {
    return useQuery({
        queryKey: ["appointments"],
        queryFn: async () => {
            const response = await medicalApi.getAppointments();
            return response.data;
        },
    });
};

export const useCreateAppointment = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: any) => medicalApi.createAppointment(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["appointments"] });
            toast({
                title: "Success",
                description: "Appointment created successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to create appointment",
                variant: "destructive",
            });
        },
    });
};

export const useCreateVitals = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: any) => medicalApi.createVitals(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["vitals"] });
            toast({
                title: "Success",
                description: "Vitals recorded successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to record vitals",
                variant: "destructive",
            });
        },
    });
};

// Pharmacy Hooks
export const useMedicines = () => {
    return useQuery({
        queryKey: ["medicines"],
        queryFn: async () => {
            const response = await pharmacyApi.getMedicines();
            return response.data;
        },
    });
};

export const usePrescriptions = () => {
    return useQuery({
        queryKey: ["prescriptions"],
        queryFn: async () => {
            const response = await pharmacyApi.getPrescriptions();
            return response.data;
        },
    });
};

// Lab Hooks
export const useLabTests = () => {
    return useQuery({
        queryKey: ["labTests"],
        queryFn: async () => {
            const response = await labApi.getLabTests();
            return response.data;
        },
    });
};

export const useTestResults = () => {
    return useQuery({
        queryKey: ["testResults"],
        queryFn: async () => {
            const response = await labApi.getResults();
            return response.data;
        },
    });
};

// Billing Hooks
export const useInvoices = () => {
    return useQuery({
        queryKey: ["invoices"],
        queryFn: async () => {
            const response = await billingApi.getInvoices();
            return response.data;
        },
    });
};

// AI Hooks
export const useAIChat = () => {
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ message, history }: { message: string; history: any[] }) =>
            aiApi.chat(message, history),
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to get AI response",
                variant: "destructive",
            });
        },
    });
};

export const useAIAnalyze = () => {
    const { toast } = useToast();

    return useMutation({
        mutationFn: ({ patientId, data }: { patientId: number; data: any }) =>
            aiApi.analyze(patientId, data),
        onSuccess: () => {
            toast({
                title: "Analysis Complete",
                description: "AI analysis has been generated successfully",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.detail || "Failed to generate analysis",
                variant: "destructive",
            });
        },
    });
};

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserRole = "admin" | "doctor" | "nurse" | "patient";

export interface User {
    id: number;
    username: string;
    email: string;
    role: UserRole;
    first_name?: string;
    last_name?: string;
    patient_id?: string; // For patients
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    // Actions
    setUser: (user: User) => void;
    setTokens: (access: string, refresh: string) => void;
    logout: () => void;
    setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isLoading: false,

            setUser: (user) => set({ user, isAuthenticated: true }),

            setTokens: (access, refresh) => set({
                accessToken: access,
                refreshToken: refresh
            }),

            logout: () => set({
                user: null,
                accessToken: null,
                refreshToken: null,
                isAuthenticated: false
            }),

            setLoading: (loading) => set({ isLoading: loading }),
        }),
        {
            name: 'aarogya-auth-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// UI State Store
interface UIState {
    sidebarOpen: boolean;
    theme: 'light' | 'dark' | 'system';
    notifications: Notification[];

    toggleSidebar: () => void;
    setTheme: (theme: 'light' | 'dark' | 'system') => void;
    addNotification: (notification: Notification) => void;
    removeNotification: (id: string) => void;
}

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    timestamp: Date;
}

export const useUIStore = create<UIState>()(
    persist(
        (set) => ({
            sidebarOpen: true,
            theme: 'system',
            notifications: [],

            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

            setTheme: (theme) => set({ theme }),

            addNotification: (notification) => set((state) => ({
                notifications: [...state.notifications, notification]
            })),

            removeNotification: (id) => set((state) => ({
                notifications: state.notifications.filter(n => n.id !== id)
            })),
        }),
        {
            name: 'aarogya-ui-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

// Patient Data Store
interface PatientState {
    patientId: string | null;
    healthMetrics: HealthMetrics | null;
    appointments: any[];
    prescriptions: any[];
    labResults: any[];

    setPatientId: (id: string) => void;
    setHealthMetrics: (metrics: HealthMetrics) => void;
    setAppointments: (appointments: any[]) => void;
    setPrescriptions: (prescriptions: any[]) => void;
    setLabResults: (results: any[]) => void;
    clearPatientData: () => void;
}

interface HealthMetrics {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    oxygenLevel: number;
    lastUpdated: Date;
}

export const usePatientStore = create<PatientState>()(
    persist(
        (set) => ({
            patientId: null,
            healthMetrics: null,
            appointments: [],
            prescriptions: [],
            labResults: [],

            setPatientId: (id) => set({ patientId: id }),
            setHealthMetrics: (metrics) => set({ healthMetrics: metrics }),
            setAppointments: (appointments) => set({ appointments }),
            setPrescriptions: (prescriptions) => set({ prescriptions }),
            setLabResults: (results) => set({ labResults: results }),
            clearPatientData: () => set({
                patientId: null,
                healthMetrics: null,
                appointments: [],
                prescriptions: [],
                labResults: [],
            }),
        }),
        {
            name: 'aarogya-patient-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

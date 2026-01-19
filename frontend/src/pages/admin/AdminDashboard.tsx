import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { StatCard } from "@/components/dashboard/StatCard";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  Calendar, 
  Receipt, 
  BarChart3, 
  Settings,
  TrendingUp,
  UserPlus,
  Stethoscope,
  DollarSign
} from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "User Management", href: "/admin/users", icon: <Users className="h-5 w-5" /> },
  { label: "Departments", href: "/admin/departments", icon: <Building2 className="h-5 w-5" /> },
  { label: "Appointments", href: "/admin/appointments", icon: <Calendar className="h-5 w-5" /> },
  { label: "Billing", href: "/admin/billing", icon: <Receipt className="h-5 w-5" /> },
  { label: "Reports", href: "/admin/reports", icon: <BarChart3 className="h-5 w-5" /> },
  { label: "Settings", href: "/admin/settings", icon: <Settings className="h-5 w-5" /> },
];

const chartData = [
  { name: "Mon", appointments: 32 },
  { name: "Tue", appointments: 45 },
  { name: "Wed", appointments: 38 },
  { name: "Thu", appointments: 52 },
  { name: "Fri", appointments: 48 },
  { name: "Sat", appointments: 28 },
  { name: "Sun", appointments: 15 },
];

const activities = [
  { id: "1", type: "patient" as const, message: "Dr. Smith completed 12 consultations", time: "2 hours ago" },
  { id: "2", type: "patient" as const, message: "8 new patient registrations today", time: "4 hours ago" },
  { id: "3", type: "billing" as const, message: "3 pending bill payments", time: "5 hours ago" },
  { id: "4", type: "appointment" as const, message: "15 appointments scheduled for tomorrow", time: "6 hours ago" },
];

const AdminDashboard = () => {
  return (
    <DashboardLayout navItems={navItems} userName="Admin User" userRole="Hospital Admin">
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard Overview</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening at the hospital today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Patients"
            value="1,247"
            icon={<Users className="h-6 w-6" />}
            variant="primary"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Today's Appointments"
            value="32"
            icon={<Calendar className="h-6 w-6" />}
            variant="info"
            trend={{ value: 8, isPositive: true }}
          />
          <StatCard
            title="Active Staff"
            value="48"
            icon={<Stethoscope className="h-6 w-6" />}
            variant="success"
          />
          <StatCard
            title="Revenue (Month)"
            value="$45,230"
            icon={<DollarSign className="h-6 w-6" />}
            variant="warning"
            trend={{ value: 15, isPositive: true }}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chart */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Appointment Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: "hsl(var(--background))", 
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px"
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="appointments" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Activity Feed */}
          <ActivityFeed activities={activities} />
        </div>

        {/* Quick Stats */}
        <div className="grid sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">24</p>
                <p className="text-sm text-muted-foreground">New Patients Today</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-info/10 flex items-center justify-center">
                <Stethoscope className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-muted-foreground">Consultations This Week</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminDashboard;

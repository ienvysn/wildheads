import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";

interface AppointmentCardProps {
  date: string;
  time: string;
  doctor: string;
  department: string;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  onView?: () => void;
  onCancel?: () => void;
}

export const AppointmentCard = ({
  date,
  time,
  doctor,
  department,
  status,
  onView,
  onCancel,
}: AppointmentCardProps) => {
  const statusColors = {
    confirmed: "bg-success/10 text-success",
    pending: "bg-warning/10 text-warning",
    completed: "bg-muted text-muted-foreground",
    cancelled: "bg-destructive/10 text-destructive",
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-1 gradient-primary" />
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <Badge variant="secondary" className={statusColors[status]}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{doctor} • {department}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="flex-1" onClick={onView}>
            View Details
          </Button>
          {status === "confirmed" && (
            <Button variant="ghost" size="sm" className="text-destructive" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

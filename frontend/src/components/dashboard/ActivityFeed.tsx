import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, User, Calendar, FileText, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "patient" | "appointment" | "consultation" | "billing";
  message: string;
  time: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
  const icons = {
    patient: User,
    appointment: Calendar,
    consultation: FileText,
    billing: DollarSign,
  };

  const colors = {
    patient: "bg-primary/10 text-primary",
    appointment: "bg-info/10 text-info",
    consultation: "bg-success/10 text-success",
    billing: "bg-warning/10 text-warning",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = icons[activity.type];
            return (
              <div key={activity.id} className="flex items-start gap-3">
                <div className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0",
                  colors[activity.type]
                )}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground">{activity.message}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

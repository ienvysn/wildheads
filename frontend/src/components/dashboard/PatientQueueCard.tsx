import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { User, Clock, ChevronRight } from "lucide-react";

interface Patient {
  id: string;
  name: string;
  time: string;
  type: "general" | "follow-up" | "emergency";
  complaint?: string;
  hasAiScreening?: boolean;
}

interface PatientQueueCardProps {
  patients: Patient[];
  onStartConsultation: (patientId: string) => void;
}

export const PatientQueueCard = ({ patients, onStartConsultation }: PatientQueueCardProps) => {
  const typeColors = {
    general: "bg-primary/10 text-primary",
    "follow-up": "bg-info/10 text-info",
    emergency: "bg-destructive/10 text-destructive",
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Current Queue
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {patients.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No patients in queue</p>
          </div>
        ) : (
          patients.map((patient, index) => (
            <div
              key={patient.id}
              className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
                  {index + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{patient.name}</p>
                    <Badge variant="secondary" className={typeColors[patient.type]}>
                      {patient.type}
                    </Badge>
                    {patient.hasAiScreening && (
                      <Badge variant="secondary" className="bg-ai-light text-ai">
                        AI Pre-screened
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {patient.time} {patient.complaint && `• ${patient.complaint}`}
                  </p>
                </div>
              </div>
              <Button size="sm" onClick={() => onStartConsultation(patient.id)}>
                Start
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
};

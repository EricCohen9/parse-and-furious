import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

interface ErrorAlertProps {
  error: string;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  return (
    <Card className="mb-6 border-destructive/50 bg-destructive/5 text-destructive">
      <CardContent className="p-4 flex items-start gap-3">
        <AlertCircle className="size-4 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold text-sm">Extraction Error</p>
          <p className="text-xs opacity-90">{error}</p>
        </div>
      </CardContent>
    </Card>
  );
}

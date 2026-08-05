import { IconAlertCircle } from "@tabler/icons-react";

interface ErrorAlertProps {
  error: string;
}

export function ErrorAlert({ error }: ErrorAlertProps) {
  return (
    <div className="alert alert-danger mb-4" role="alert">
      <div className="d-flex gap-2">
        <IconAlertCircle size={20} className="shrink-0 mt-1" />
        <div>
          <h4 className="alert-title mb-1">Extraction Error</h4>
          <div className="text-secondary">{error}</div>
        </div>
      </div>
    </div>
  );
}

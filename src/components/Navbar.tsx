import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  return (
    <header className="border-b bg-background sticky top-0 z-50">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-md border bg-muted text-foreground">
            <FileText className="size-4" />
          </div>
          <span className="font-semibold text-sm tracking-tight text-foreground">
            Workers AI Document Parser
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs font-normal">
            Cloudflare Workers AI
          </Badge>
          <Badge variant="secondary" className="text-xs font-normal hidden sm:inline-flex">
            D1 Database
          </Badge>
        </div>
      </div>
    </header>
  );
}

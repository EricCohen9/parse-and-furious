import { IconFileText } from "@tabler/icons-react";

export function Navbar() {
  return (
    <header className="navbar navbar-expand-md d-print-none border-bottom bg-body">
      <div className="container-xl">
        <h1 className="navbar-brand navbar-brand-autodark d-flex align-items-center gap-2 mb-0">
          <IconFileText className="text-primary" size={24} />
          <span>Workers AI Document Parser</span>
        </h1>
        <div className="navbar-nav flex-row order-md-last gap-3 align-items-center">
          <span className="status status-orange font-weight-bold" style={{ fontSize: "0.8rem" }}>
            <span className="status-dot status-dot-animated"></span>
            Cloudflare Workers AI
          </span>
          <span className="status status-blue font-weight-bold" style={{ fontSize: "0.8rem" }}>
            <span className="status-dot"></span>
            D1 Database
          </span>
        </div>
      </div>
    </header>
  );
}

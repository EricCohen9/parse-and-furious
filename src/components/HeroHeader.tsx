export function HeroHeader() {
  return (
    <div className="page-header mb-4">
      <div className="row align-items-center">
        <div className="col">
          <div className="page-pretitle text-secondary">Cloudflare Workers AI + D1 SQLite</div>
          <h2 className="page-title text-foreground">Bank Statement Document Parser</h2>
          <p className="text-secondary mb-0 mt-1 text-muted">
            Upload financial statement PDFs to extract bank metrics, totals, statement periods, and MCA underwriting risk evaluation.
          </p>
        </div>
      </div>
    </div>
  );
}

export function HeroHeader() {
  return (
    <div className="page-header mb-4">
      <div className="row align-items-center">
        <div className="col">
          <h1 className="page-title mb-2">Bank Statement Parser</h1>
          <p className="text-secondary mb-0">
          Upload a bank statement PDF or image to automatically extract bank name, statement period, and totals.
          </p>
        </div>
      </div>
    </div>
  );
}

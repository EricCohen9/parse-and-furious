export function HeroHeader() {
  return (
    <div className="mb-8 text-center space-y-2">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Bank Statement Document Parser
      </h1>
      <p className="text-sm text-muted-foreground max-w-lg mx-auto">
        Upload a bank statement PDF to extract financial metrics, bank name, statement period, and totals. Results are saved to Cloudflare D1.
      </p>
    </div>
  );
}

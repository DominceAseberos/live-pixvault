import { Link, useLocation } from "react-router-dom";
import { PageShell } from "@/components/PageShell";

export default function NotFound() {
  const { pathname } = useLocation();
  return (
    <PageShell>
      <section className="grid min-h-[65vh] place-items-center px-4 py-20">
        <div className="max-w-lg text-center">
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-primary">404 / Route missing</p>
          <h1 className="mt-4 font-display text-5xl font-bold text-foreground">This vault path does not exist.</h1>
          <p className="mt-4 break-all text-sm text-muted-foreground">{pathname}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/" className="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">Return home</Link>
            <Link to="/components" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">Browse components</Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

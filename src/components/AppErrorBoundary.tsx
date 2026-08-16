import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props { children: ReactNode }
interface State { hasError: boolean }

export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State { return { hasError: true }; }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("PIXVAULT render error", error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <main className="grid min-h-screen place-items-center bg-background px-6 text-foreground">
        <section className="max-w-md rounded-2xl border border-border bg-card p-8 text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Interface recovery</p>
          <h1 className="mt-3 font-display text-2xl font-bold">Something failed to render.</h1>
          <p className="mt-3 text-sm text-muted-foreground">Reload the page to reset the local interface state. Your saved resources remain in this browser.</p>
          <button onClick={() => window.location.reload()} className="mt-6 rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background">Reload PIXVAULT</button>
        </section>
      </main>
    );
  }
}

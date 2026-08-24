import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Without this, one render error blanks the entire site. The fallback keeps the
 * visitor's exits available — reload, home, and a direct email link.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Unhandled render error:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6 text-foreground">
        <div className="max-w-md">
          <p className="label-mono text-destructive">Something broke</p>
          <h1 className="mt-3 text-2xl text-destructive">This page failed to render</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            The error has been logged to the console. Reloading usually clears it.
          </p>
          <pre className="readout mt-4 max-h-32 overflow-auto rounded-md border border-destructive/25 bg-destructive/5 p-3 text-2xs text-destructive">
            {error.message}
          </pre>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-md bg-thermal px-5 py-2.5 font-mono text-2xs uppercase tracking-widest text-on-thermal"
            >
              Reload the page
            </button>
            <a
              href={import.meta.env.BASE_URL}
              className="rounded-md border border-interface/30 px-5 py-2.5 font-mono text-2xs uppercase tracking-widest text-interface-type hover:bg-interface/5"
            >
              Go home
            </a>
          </div>
        </div>
      </div>
    );
  }
}

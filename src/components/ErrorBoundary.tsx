import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled exception:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleHardReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#030008] text-white flex items-center justify-center p-6 select-none font-sans">
          <div className="max-w-lg w-full bg-slate-950/80 border border-purple-500/30 rounded-3xl p-8 backdrop-blur-xl shadow-[0_0_50px_rgba(168,85,247,0.2)] text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-5 shadow-lg">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <span className="text-[10px] font-mono text-purple-400 uppercase tracking-[0.25em] font-bold block mb-1">
              ZOYA System Recovery
            </span>
            <h2 className="text-xl font-bold tracking-tight text-white mb-2">
              Session Exception Caught
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed mb-6 font-mono">
              A temporary interface anomaly was intercepted. Your settings and active character data have been protected.
            </p>

            {this.state.error && (
              <div className="bg-black/60 border border-slate-900 rounded-xl p-3 text-left font-mono text-[10px] text-red-400 mb-6 overflow-x-auto max-h-28">
                {this.state.error.message}
              </div>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Resume ZOYA Session
              </button>
              <button
                onClick={this.handleHardReload}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-xs transition-all border border-slate-800 flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

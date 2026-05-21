import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white/20 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-bg-darker border-4 border-double border-gray-200  p-8 space-y-6 text-center">
            <div className="flex justify-center flex-col items-center gap-4">
              <AlertTriangle className="w-16 h-16 text-accent-danger" />
              <h2 className="text-2xl font-bold font-['JetBrains_Mono'] tracking-tight text-accent-danger">
                تعطلت المطبعة مؤقتاً!
              </h2>
            </div>
            <p className="text-gray-900 font-serif text-sm">
              يبدو أن هناك عطلاً مفاجئاً في واجهة العرض.
            </p>
            <div className="text-left font-mono text-xs text-[#555] bg-gray-100 p-2 overflow-x-auto border border-gray-200 max-h-32 overflow-y-auto">
              {this.state.error?.message}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-4 bg-bg-darker active:bg-accent-danger text-gray-900 font-bold transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              أعد تشغيل الصفحة
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}

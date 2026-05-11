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
        <div className="min-h-screen bg-[#f4eee0] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border-4 border-double border-[#1a1a1a] shadow-[16px_16px_0_#1a1a1a] p-8 space-y-6 text-center">
            <div className="flex justify-center flex-col items-center gap-4">
              <AlertTriangle className="w-16 h-16 text-[#8b0000]" />
              <h2 className="text-2xl font-bold newspaper text-[#8b0000]">
                تعطلت المطبعة مؤقتاً!
              </h2>
            </div>
            <p className="text-[#1a1a1a] font-serif text-sm">
              يبدو أن هناك عطلاً مفاجئاً في واجهة العرض.
            </p>
            <div className="text-left font-mono text-xs text-[#555] bg-gray-100 p-2 overflow-x-auto border border-[#1a1a1a] max-h-32 overflow-y-auto">
              {this.state.error?.message}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 bg-[#1a1a1a] hover:bg-[#8b0000] text-white font-bold transition-all flex items-center justify-center gap-2"
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

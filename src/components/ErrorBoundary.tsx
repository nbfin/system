import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "發生了意外錯誤。";
      try {
        // Try to parse if it's a FirestoreErrorInfo JSON string
        const errorInfo = JSON.parse(this.state.error?.message || "");
        if (errorInfo.error && errorInfo.error.includes("insufficient permissions")) {
          errorMessage = "權限不足，無法執行此操作。請聯繫管理員。";
        }
      } catch (e) {
        // Not a JSON error info, use default
      }

      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-2xl border border-slate-200 space-y-6">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold text-slate-800">系統發生錯誤</h1>
              <p className="text-slate-500 text-sm">{errorMessage}</p>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-emerald-700 transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" />
              重新整理頁面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

import React from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from './Button';
import { Card, CardContent } from './Card';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 font-sans">
          <Card className="max-w-md w-full border-error/20 shadow-xl shadow-error/10">
            <CardContent className="p-8 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-error/10 text-error rounded-full flex items-center justify-center mb-6">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Something went wrong</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-8">
                We're sorry, but an unexpected error occurred while rendering this page.
              </p>
              
              <div className="flex gap-4 w-full justify-center">
                <Button variant="outline" onClick={() => window.location.reload()} className="flex-1">
                  <RefreshCw size={18} className="mr-2" />
                  Reload Page
                </Button>
                <Button onClick={() => window.location.href = '/'} className="flex-1 bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-none">
                  <Home size={18} className="mr-2" />
                  Go Home
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-900 rounded-xl w-full text-left overflow-auto text-xs font-mono text-error">
                  <p className="font-bold mb-2">{this.state.error.toString()}</p>
                  <pre>{this.state.errorInfo?.componentStack}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

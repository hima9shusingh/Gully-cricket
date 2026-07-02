import { Link } from 'react-router-dom';
import { Ghost, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 dark:text-slate-500 mb-6 shadow-inner">
        <Ghost size={48} />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">404</h1>
      <h2 className="text-xl font-bold text-slate-700 dark:text-slate-300 mb-4">Page Not Found</h2>
      <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
        Oops! The page you are looking for doesn't exist or has been moved. Check the URL or navigate back to safety.
      </p>
      <Link to="/">
        <Button className="px-8 py-3 rounded-full text-base font-bold shadow-lg shadow-cricket/20 hover:scale-105 transition-transform">
          <Home size={20} className="mr-2" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}

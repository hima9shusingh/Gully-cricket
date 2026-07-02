import { BarChart3 } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <BarChart3 className="text-accent-orange" /> Analytics
        </h1>
        <p className="text-slate-500 mt-2">Deep dive into player and team performances.</p>
      </div>

      <Card className="border-dashed bg-slate-50 dark:bg-slate-900/50">
        <CardContent className="py-16 text-center">
          <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Coming Soon</h2>
          <p className="text-slate-500 max-w-sm mx-auto">
            Advanced analytics, run-rate worms, and heatmaps are currently under development. Stay tuned!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

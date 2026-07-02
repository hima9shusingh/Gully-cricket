import { Settings, Bell, Shield, Paintbrush } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';

export default function SettingsPage() {
  const { theme, toggleTheme } = useStore();

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
          <Settings className="text-cricket" /> Settings
        </h1>
        <p className="text-slate-500 mt-2">Manage your app preferences and account settings.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Paintbrush size={20} className="text-cricket" /> Appearance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white">Dark Mode</h4>
                <p className="text-sm text-slate-500">Toggle dark mode styling</p>
              </div>
              <button 
                onClick={toggleTheme}
                className={`w-12 h-6 rounded-full transition-colors relative ${theme === 'dark' ? 'bg-cricket' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell size={20} className="text-blue-500" /> Notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-500 italic">Push notifications coming soon in v2.0.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Shield size={20} className="text-error" /> Data & Privacy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500 mb-4">All data is currently saved locally on your device.</p>
            <button className="text-error text-sm font-bold hover:underline" onClick={() => {
              if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
                localStorage.clear();
                window.location.reload();
              }
            }}>
              Clear All Data & Reset App
            </button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

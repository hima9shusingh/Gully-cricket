import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Plus, Activity } from 'lucide-react';
import { api } from '../lib/mockData';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function GroundsPage() {
  const { data: grounds, isLoading } = useQuery({
    queryKey: ['grounds'],
    queryFn: api.getGrounds,
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Stadiums & Grounds</h2>
          <p className="text-slate-500">Manage venues and view pitch analytics.</p>
        </div>
        <Button className="w-full md:w-auto gap-2 shadow-lg">
          <Plus size={18} /> Add Ground
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-slate-200 dark:bg-slate-800 h-64 rounded-2xl" />
          ))}
        </div>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {grounds?.map((ground) => (
            <motion.div key={ground.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card hoverEffect className="overflow-hidden">
                <div className="h-32 bg-cricket/10 relative">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent opacity-60" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="font-bold text-xl line-clamp-1">{ground.name}</h3>
                    <p className="text-sm flex items-center gap-1 opacity-90"><MapPin size={14} /> {ground.city}</p>
                  </div>
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <p className="text-xs text-slate-500 uppercase font-bold">Pitch Type</p>
                      <p className="font-medium">{ground.pitchType}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500 uppercase font-bold">Boundaries</p>
                      <p className="font-medium">{ground.boundarySize}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                      <p className="text-xs text-slate-500">Highest</p>
                      <p className="font-bold text-cricket">{ground.stats.highestScore}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                      <p className="text-xs text-slate-500">Average</p>
                      <p className="font-bold text-slate-700 dark:text-slate-300">{ground.stats.averageScore}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg">
                      <p className="text-xs text-slate-500">Lowest</p>
                      <p className="font-bold text-error">{ground.stats.lowestScore}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

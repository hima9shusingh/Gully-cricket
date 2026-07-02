import { motion } from 'framer-motion';
import { PlayCircle, ShieldCheck, Zap, Activity } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Link } from 'react-router-dom';
import Logo from '../components/ui/Logo';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden flex-1 flex flex-col justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-cricket/10 to-transparent dark:from-cricket/5 dark:to-transparent z-0" />
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-center mb-8">
              <Logo iconSize={48} textSize="text-4xl" animated={true} />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 dark:text-white mb-6">
              Track Every Ball.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cricket to-accent-yellow">Win Every Match.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10">
              The ultimate mobile-first cricket scoring experience. Professional grade stats, live scorecards, and team management all in one place.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/live-scoring">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                  Start Scoring Now
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-4">
                  View Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Live Match Preview Widget */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8 flex items-center justify-center gap-2">
            <span className="w-3 h-3 rounded-full bg-error animate-pulse" />
            Live Action
          </h2>
          <div className="max-w-md mx-auto">
            <Card hoverEffect>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-xs font-bold px-2 py-1 bg-error/10 text-error rounded-md uppercase tracking-wider">Live</span>
                  <span className="text-sm text-slate-500">Overs 14.2 / 20</span>
                </div>
                
                <div className="flex justify-between items-center mb-6">
                  <div className="text-center">
                    <h3 className="font-bold text-xl">CSK</h3>
                    <p className="text-2xl font-black mt-1">124/3</p>
                  </div>
                  <span className="font-medium text-slate-400">vs</span>
                  <div className="text-center">
                    <h3 className="font-bold text-xl">MI</h3>
                    <p className="text-sm text-slate-500 mt-1">Yet to bat</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3 flex justify-between text-sm">
                  <div>
                    <span className="text-slate-500">CRR:</span>
                    <strong className="ml-1">8.75</strong>
                  </div>
                  <div>
                    <span className="text-slate-500">Striker:</span>
                    <strong className="ml-1">Dhoni (42*)</strong>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
            <p className="text-slate-600 dark:text-slate-400">Built for players, captains, and passionate fans.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <FeatureCard 
              icon={Activity}
              title="Real-time Scoring"
              desc="Lightning fast ball-by-ball scoring designed for one-handed use on the field."
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Pro Tournaments"
              desc="Manage entire tournaments, points tables, and Net Run Rate automatically."
            />
            <FeatureCard 
              icon={Zap}
              title="Advanced Analytics"
              desc="Wagon wheels, pitch maps, and run-rate graphs to analyze performance."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6 grayscale opacity-80">
            <Logo iconSize={24} textSize="text-xl" />
          </div>
          <p className="text-sm">© 2026 GullyCricket Pro. Built for the love of cricket.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <Card hoverEffect className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border-transparent hover:border-cricket/30 transition-colors">
      <CardContent className="p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl bg-cricket/10 text-cricket flex items-center justify-center mb-6">
          <Icon size={32} />
        </div>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-slate-600 dark:text-slate-400">{desc}</p>
      </CardContent>
    </Card>
  );
}

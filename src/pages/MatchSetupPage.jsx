import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ChevronLeft, Plus, Trash2, Trophy, Coins, Users } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export default function MatchSetupPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { createMatch, startMatch, addTeam, addPlayer, tournaments } = useStore();

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      teamA: { name: '', players: Array(11).fill({ name: '' }) },
      teamB: { name: '', players: Array(11).fill({ name: '' }) },
      tournamentId: '',
      ground: 'Local Ground',
      overs: '20',
      tossWinner: '',
      tossDecision: '',
      strikerId: '',
      nonStrikerId: '',
      bowlerId: ''
    }
  });

  const formData = watch();

  const { fields: teamAPlayers, append: appendA, remove: removeA } = useFieldArray({ control, name: "teamA.players" });
  const { fields: teamBPlayers, append: appendB, remove: removeB } = useFieldArray({ control, name: "teamB.players" });

  const handleNext = () => {
    if (step === 1 && (!formData.teamA.name || !formData.teamB.name)) return;
    if (step === 2 && (formData.teamA.players.length < 2 || formData.teamB.players.length < 2 || formData.teamA.players.some(p => !p.name || !p.name.trim()) || formData.teamB.players.some(p => !p.name || !p.name.trim()))) return;
    if (step === 3 && (!formData.tossWinner || !formData.tossDecision)) return;
    setStep(s => Math.min(s + 1, 4));
  };
  const handleBack = () => setStep(s => s - 1);

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // 1. Save Teams
      const teamAData = { teamName: data.teamA.name, logo: `https://ui-avatars.com/api/?name=${data.teamA.name}&background=random` };
      const teamBData = { teamName: data.teamB.name, logo: `https://ui-avatars.com/api/?name=${data.teamB.name}&background=random` };
      
      const newTeamA = await addTeam(teamAData);
      const newTeamB = await addTeam(teamBData);

      // 2. Save Players
      const squadA = await Promise.all(data.teamA.players.map(p => 
        addPlayer({ name: p.name, teamId: newTeamA._id })
      ));
      const squadB = await Promise.all(data.teamB.players.map(p => 
        addPlayer({ name: p.name, teamId: newTeamB._id })
      ));

      // 3. Determine Batting/Bowling Teams
      let battingTeam, bowlingTeam, battingSquad, bowlingSquad;
      if ((data.tossWinner === 'Team A' && data.tossDecision === 'bat') || (data.tossWinner === 'Team B' && data.tossDecision === 'bowl')) {
        battingTeam = newTeamA; bowlingTeam = newTeamB;
        battingSquad = squadA; bowlingSquad = squadB;
      } else {
        battingTeam = newTeamB; bowlingTeam = newTeamA;
        battingSquad = squadB; bowlingSquad = squadA;
      }

      // 4. Create Match
      const oversTotal = data.overs === 'custom' ? parseInt(data.customOvers) : parseInt(data.overs);
      const matchData = {
        teamA: newTeamA._id,
        teamB: newTeamB._id,
        tournament: data.tournamentId || undefined,
        oversLimit: oversTotal,
        ground: data.ground,
        tossWinner: data.tossWinner === 'Team A' ? newTeamA._id : newTeamB._id,
        tossDecision: data.tossDecision,
        battingFirst: battingTeam._id
      };
      const createdMatch = await createMatch(matchData);

      // 5. Start Match with Openers
      const strikerId = battingSquad[parseInt(data.strikerId) || 0]._id;
      const nonStrikerId = battingSquad[parseInt(data.nonStrikerId) || 1]._id;
      
      if (strikerId === nonStrikerId) {
        alert("Striker and Non-Striker must be different players");
        return;
      }
      
      const startPayload = {
        striker: strikerId,
        nonStriker: nonStrikerId,
        currentBowler: bowlingSquad[parseInt(data.bowlerId) || 0]._id
      };
      
      await startMatch(createdMatch._id, startPayload);
      navigate('/live-scoring');
    } catch (err) {
      console.error("Failed to setup match:", err);
      alert("Error setting up match. Check console.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-8">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Match Setup</h2>
        <p className="text-slate-500">Configure your match parameters to begin scoring.</p>
        
        {/* Progress Bar */}
        <div className="flex gap-2 mt-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${step >= i ? 'bg-cricket' : 'bg-slate-200 dark:bg-slate-800'}`} />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} onKeyDown={(e) => {
        if (e.key === 'Enter' && step < 4) {
          e.preventDefault();
        }
      }}>
        <AnimatePresence mode="wait">
          
          {/* STEP 1: Basic Info */}
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Trophy size={20} className="text-cricket" /> Basic Details</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2">Team A Name</label>
                      <input {...register("teamA.name", { required: true })} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900" placeholder="e.g. Royal Strikers" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Team B Name</label>
                      <input {...register("teamB.name", { required: true })} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900" placeholder="e.g. Thunder Kings" />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-bold mb-2">Overs</label>
                      <select {...register("overs")} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                        <option value="2">2</option>
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="custom">Custom</option>
                      </select>
                      {formData.overs === 'custom' && (
                        <input {...register("customOvers", { required: true })} type="number" min="1" className="w-full mt-2 p-3 rounded-xl border border-cricket/50 bg-white dark:bg-slate-900" placeholder="Enter Overs" />
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Tournament</label>
                      <select {...register("tournamentId")} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
                        <option value="">None (Friendly Match)</option>
                        {(tournaments || []).map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold mb-2">Ground</label>
                      <input {...register("ground")} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 2: Squads */}
          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-cricket">{formData.teamA.name || 'Team A'} Squad</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {teamAPlayers.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <input {...register(`teamA.players.${index}.name`, { required: true })} className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm" placeholder={`Player ${index + 1}`} />
                        <Button type="button" variant="ghost" size="icon" className="text-error shrink-0" onClick={() => removeA(index)}><Trash2 size={16} /></Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="w-full mt-2 border-dashed" onClick={() => appendA({ name: '' })}>
                      <Plus size={16} className="mr-1" /> Add Player
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-blue-500">{formData.teamB.name || 'Team B'} Squad</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {teamBPlayers.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <input {...register(`teamB.players.${index}.name`, { required: true })} className="flex-1 p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-sm" placeholder={`Player ${index + 1}`} />
                        <Button type="button" variant="ghost" size="icon" className="text-error shrink-0" onClick={() => removeB(index)}><Trash2 size={16} /></Button>
                      </div>
                    ))}
                    <Button type="button" variant="outline" size="sm" className="w-full mt-2 border-dashed" onClick={() => appendB({ name: '' })}>
                      <Plus size={16} className="mr-1" /> Add Player
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Toss */}
          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Coins size={20} className="text-accent-yellow" /> The Toss</CardTitle></CardHeader>
                <CardContent className="space-y-8 text-center py-8">
                  <div>
                    <h3 className="text-lg font-bold mb-4">Who won the toss?</h3>
                    <div className="flex justify-center gap-4">
                      <Button type="button" variant={formData.tossWinner === 'Team A' ? 'primary' : 'outline'} onClick={() => setValue('tossWinner', 'Team A')} className="w-40 h-16">
                        {formData.teamA.name || 'Team A'}
                      </Button>
                      <Button type="button" variant={formData.tossWinner === 'Team B' ? 'primary' : 'outline'} onClick={() => setValue('tossWinner', 'Team B')} className="w-40 h-16">
                        {formData.teamB.name || 'Team B'}
                      </Button>
                    </div>
                  </div>

                  {formData.tossWinner && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <h3 className="text-lg font-bold mb-4 text-slate-500">Elected to</h3>
                      <div className="flex justify-center gap-4">
                        <Button type="button" variant={formData.tossDecision === 'bat' ? 'primary' : 'outline'} onClick={() => setValue('tossDecision', 'bat')} className="w-32">
                          Bat First
                        </Button>
                        <Button type="button" variant={formData.tossDecision === 'bowl' ? 'primary' : 'outline'} onClick={() => setValue('tossDecision', 'bowl')} className="w-32">
                          Bowl First
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* STEP 4: Openers */}
          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
               <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Users size={20} className="text-cricket" /> Select Openers</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {(() => {
                    const isTeamABatting = (formData.tossWinner === 'Team A' && formData.tossDecision === 'bat') || (formData.tossWinner === 'Team B' && formData.tossDecision === 'bowl');
                    const battingSquad = isTeamABatting ? formData.teamA.players : formData.teamB.players;
                    const bowlingSquad = isTeamABatting ? formData.teamB.players : formData.teamA.players;
                    const battingTeamName = isTeamABatting ? formData.teamA.name : formData.teamB.name;
                    const bowlingTeamName = isTeamABatting ? formData.teamB.name : formData.teamA.name;

                    return (
                      <>
                        <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl mb-6">
                          <p className="text-center font-bold text-lg"><span className="text-cricket">{battingTeamName}</span> is batting first</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="space-y-4">
                            <h4 className="font-bold border-b border-slate-200 dark:border-slate-800 pb-2">Batting Openers</h4>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Striker</label>
                              <select {...register("strikerId", { required: true })} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <option value="">Select Striker...</option>
                                {battingSquad.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
                              </select>
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Non-Striker</label>
                              <select {...register("nonStrikerId", { required: true })} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <option value="">Select Non-Striker...</option>
                                {battingSquad.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
                              </select>
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h4 className="font-bold border-b border-slate-200 dark:border-slate-800 pb-2">Opening Bowler</h4>
                            <div>
                              <label className="block text-xs font-bold text-slate-500 mb-1">Bowler ({bowlingTeamName})</label>
                              <select {...register("bowlerId", { required: true })} className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                                <option value="">Select Bowler...</option>
                                {bowlingSquad.map((p, i) => <option key={i} value={i}>{p.name}</option>)}
                              </select>
                            </div>
                          </div>
                        </div>
                      </>
                    )
                  })()}
                </CardContent>
              </Card>
            </motion.div>
          )}

        </AnimatePresence>

        {/* Wizard Footer Controls */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={handleBack} disabled={step === 1}>
            <ChevronLeft size={18} className="mr-1" /> Back
          </Button>
          
          {step < 4 ? (
            <Button 
              type="button" 
              onClick={handleNext}
              disabled={
                (step === 1 && (!formData.teamA.name || !formData.teamB.name)) || 
                (step === 2 && (
                  formData.teamA.players.length < 2 || 
                  formData.teamB.players.length < 2 ||
                  formData.teamA.players.some(p => !p.name || !p.name.trim()) || 
                  formData.teamB.players.some(p => !p.name || !p.name.trim())
                )) ||
                (step === 3 && (!formData.tossWinner || !formData.tossDecision))
              }
            >
              Next Step <ChevronRight size={18} className="ml-1" />
            </Button>
          ) : (
            <Button type="submit" variant="primary" isLoading={isSubmitting} disabled={isSubmitting} className="bg-cricket hover:bg-cricket-dark text-white px-8">
              Start Match <ChevronRight size={18} className="ml-1" />
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

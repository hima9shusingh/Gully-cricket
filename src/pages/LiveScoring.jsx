import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Flag, UserMinus, Activity } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { socket, connectSocket, joinMatchRoom, leaveMatchRoom } from '../lib/socket';

export default function LiveScoring() {
  const { currentMatch, addEvent, undo, setNewBowler, startSecondInnings, endMatch, tournaments } = useStore();

  const [activeModal, setActiveModal] = useState(null); // 'dismissal', 'newBatsman', 'newBowler', 'inningsBreak', 'matchComplete'
  const [selectedDismissal, setSelectedDismissal] = useState('');
  const [dismissedBatsmanId, setDismissedBatsmanId] = useState(null);
  const [nextBatsman, setNextBatsman] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const lastPromptedOversRef = useRef(-1);

  useEffect(() => {
    connectSocket();
    if (currentMatch) {
      joinMatchRoom(currentMatch._id);
      ['score_updated', 'wicket_fallen', 'innings_completed', 'match_completed', 'new_batsman_selected', 'new_bowler_selected', 'over_completed'].forEach(evt => {
        socket.on(evt, (updatedMatch) => {
          useStore.getState().setCurrentMatch(updatedMatch);
        });
      });
    }
    return () => {
      if (currentMatch) leaveMatchRoom(currentMatch._id);
      ['score_updated', 'wicket_fallen', 'innings_completed', 'match_completed', 'new_batsman_selected', 'new_bowler_selected', 'over_completed'].forEach(evt => {
        socket.off(evt);
      });
    };
  }, [currentMatch?._id]);

  // Check state to trigger modals
  useEffect(() => {
    if (!currentMatch) return;
    
    if (currentMatch.status === 'Completed' && activeModal !== 'matchComplete') {
      setActiveModal('matchComplete');
    } else if (currentMatch.status === 'Innings Break' && activeModal !== 'inningsBreak') {
      setActiveModal('inningsBreak');
    } else if (currentMatch.balls > 0 && currentMatch.balls % 6 === 0 && currentMatch.status === 'Live') {
      // Over completed, check if bowler needs changing. 
      if (lastPromptedOversRef.current !== currentMatch.balls) {
        setActiveModal('newBowler');
        lastPromptedOversRef.current = currentMatch.balls;
      }
    } else if (currentMatch.balls % 6 !== 0) {
      lastPromptedOversRef.current = -1;
    }
  }, [currentMatch, activeModal]);

  if (!currentMatch) return null;

  const {
    teamA, teamB, battingFirst,
    currentStriker: striker, currentNonStriker: nonStriker, currentBowler,
    runs: score, wickets, overs: oversDisplay, oversLimit: oversTotal,
    tournament, ballHistory: timeline, currentInnings: innings, target, partnership,
  } = currentMatch;

  const teamABatsFirst = battingFirst === teamA._id || battingFirst?._id === teamA._id;
  
  let battingTeam, bowlingTeam;
  if (innings === 1) {
     battingTeam = teamABatsFirst ? teamA : teamB;
     bowlingTeam = teamABatsFirst ? teamB : teamA;
  } else {
     battingTeam = teamABatsFirst ? teamB : teamA;
     bowlingTeam = teamABatsFirst ? teamA : teamB;
  }

  const tournamentId = tournament?._id;
  // Fallbacks for squads (for UI mapping)
  const battingSquad = battingTeam?.players || [];
  const bowlingSquad = bowlingTeam?.players || [];

  const activeTournament = (tournaments || []).find(t => t.id === tournamentId);
  const tournamentName = activeTournament ? activeTournament.name : 'Friendly Match';

  const ballsBowled = currentMatch.balls;
  const oversBowled = (ballsBowled / 6) + ((ballsBowled % 6) / 10);
  const crr = oversBowled > 0 ? (score / oversBowled).toFixed(2) : '0.00';
  
  let ballsRemaining = (oversTotal * 6) - ballsBowled;
  const rrr = (innings === 2 && ballsRemaining > 0 && target) ? ((target - score) / (ballsRemaining / 6)).toFixed(2) : '0.00';

  const handleAction = async (actionFn) => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      await actionFn();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRun = (runs) => handleAction(() => addEvent({ type: 'run', value: runs }));
  
  const handleWicket = () => setActiveModal('dismissal');
  
  const submitWicket = (nextBatsmanId) => {
    handleAction(async () => {
      await addEvent({ type: 'wicket', dismissalType: selectedDismissal, nextBatsmanId, dismissedBatsmanId });
      setActiveModal(null);
      setSelectedDismissal('');
      setNextBatsman(null);
      setDismissedBatsmanId(null);
    });
  };

  const submitNewBowler = (bowlerId) => {
    handleAction(async () => {
      await setNewBowler(bowlerId);
      setActiveModal(null);
    });
  };

  const handleStartSecondInnings = (strikerId, nonStrikerId, bowlerId) => {
    handleAction(async () => {
      await startSecondInnings(strikerId, nonStrikerId, bowlerId);
      setActiveModal(null);
    });
  };

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto bg-slate-50 dark:bg-slate-950 font-sans -mx-4 md:mx-auto -mt-4 md:mt-0 relative">
      
      {/* Modals */}
      <AnimatePresence>
        {activeModal === 'newBowler' && (
          <Modal title="Select New Bowler">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-4 max-h-[40vh] overflow-y-auto pr-2">
                {bowlingSquad.filter(p => (p._id || p.id) !== (currentBowler?._id || currentBowler?.id)).map(p => (
                  <Button key={p._id || p.id} variant="outline" onClick={() => submitNewBowler(p._id || p.id)} className="h-12 truncate">{p.name || p.playerName}</Button>
                ))}
              </div>
          </Modal>
        )}

        {activeModal === 'dismissal' && (
          <Modal title="Dismissal Type" onClose={() => setActiveModal(null)}>
            <div className="grid grid-cols-2 gap-2">
              {['Bowled', 'Caught', 'LBW', 'Run Out', 'Stumped', 'Hit Wicket'].map(type => (
                <Button key={type} variant="outline" onClick={() => { setSelectedDismissal(type); setActiveModal('newBatsman'); }} className="h-12">{type}</Button>
              ))}
            </div>
          </Modal>
        )}

        {activeModal === 'newBatsman' && (
          <Modal title="Wicket Details" onClose={() => { setActiveModal(null); setSelectedDismissal(''); setDismissedBatsmanId(null); setNextBatsman(null); }}>
             {selectedDismissal === 'Run Out' && (
               <div className="mb-4">
                 <p className="font-bold mb-2">Who got out?</p>
                 <div className="grid grid-cols-2 gap-2">
                   <Button variant={dismissedBatsmanId === (striker?._id || striker?.id) ? "primary" : "outline"} onClick={() => setDismissedBatsmanId(striker?._id || striker?.id)} className="h-12">{striker?.name} (Striker)</Button>
                   <Button variant={dismissedBatsmanId === (nonStriker?._id || nonStriker?.id) ? "primary" : "outline"} onClick={() => setDismissedBatsmanId(nonStriker?._id || nonStriker?.id)} className="h-12">{nonStriker?.name} (Non-Striker)</Button>
                 </div>
               </div>
             )}
             
             <div>
               <p className="font-bold mb-2">Select New Batsman:</p>
               {(() => {
                 const availableBatsmen = battingSquad.filter(p => {
                   const pid = String(p._id || p.id);
                   const sid = String(striker?._id || striker?.id);
                   const nsid = String(nonStriker?._id || nonStriker?.id);
                   if (pid === sid || pid === nsid) return false;
                   const isOut = (currentMatch.outPlayers || []).some(outP => String(outP._id || outP.id || outP) === pid);
                   return !isOut;
                 });
                 
                 if (availableBatsmen.length === 0) {
                   return <div className="text-center p-4 text-error font-bold">All Players are Out</div>;
                 }
                 
                 return (
                   <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[40vh] overflow-y-auto pr-2">
                     {availableBatsmen.map(p => (
                       <Button key={p._id || p.id} variant="outline" onClick={() => setNextBatsman(p._id || p.id)} className={nextBatsman === (p._id || p.id) ? "border-error text-error bg-error/10 h-12 truncate" : "h-12 truncate"}>{p.name || p.playerName}</Button>
                     ))}
                   </div>
                 );
               })()}
             </div>
             
             <Button className="w-full mt-4" disabled={!nextBatsman || (selectedDismissal === 'Run Out' && !dismissedBatsmanId)} onClick={() => submitWicket(nextBatsman)}>Confirm Wicket</Button>
          </Modal>
        )}

        {activeModal === 'inningsBreak' && (
          <Modal title="Innings Break">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold">{(teamABatsFirst ? teamA : teamB)?.name} scored {currentMatch.firstInningsScore}/{currentMatch.firstInningsWickets}</h2>
              <p className="text-slate-500 mt-2">Target for {(teamABatsFirst ? teamB : teamA)?.name} is {currentMatch.target}</p>
            </div>
            {/* Quick Openers Select for Innings 2 */}
            <form onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const strikerId = fd.get('striker');
              const nonStrikerId = fd.get('nonStriker');
              if (strikerId === nonStrikerId) return alert('Striker and Non-Striker must be different players');
              handleStartSecondInnings(strikerId, nonStrikerId, fd.get('bowler'));
            }}>
              <div className="space-y-3 mb-6 text-left">
                <select name="striker" className="w-full p-3 rounded-xl border" required>
                   <option value="">Select Striker...</option>
                   {battingSquad.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>)}
                </select>
                <select name="nonStriker" className="w-full p-3 rounded-xl border" required>
                   <option value="">Select Non-Striker...</option>
                   {battingSquad.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>)}
                </select>
                <select name="bowler" className="w-full p-3 rounded-xl border" required>
                   <option value="">Select Opening Bowler...</option>
                   {bowlingSquad.map(p => <option key={p._id || p.id} value={p._id || p.id}>{p.name}</option>)}
                </select>
              </div>
              <Button type="submit" className="w-full">Start 2nd Innings</Button>
            </form>
          </Modal>
        )}

        {activeModal === 'matchComplete' && (
          <Modal title="Match Complete">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-2xl font-bold text-cricket">{currentMatch.result}</h2>
            </div>
            <Button className="w-full" onClick={() => { endMatch(); window.location.href='/dashboard'; }}>Back to Dashboard</Button>
          </Modal>
        )}
      </AnimatePresence>

      {/* Header Score Area */}
      <div className="bg-cricket text-white p-6 md:rounded-b-3xl shadow-lg relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 opacity-10 w-32 h-32 -mr-8 -mt-8">
           <Activity size={128} />
        </div>
        
        <div className="flex justify-between items-center mb-4 text-cricket-100 text-xs font-medium relative z-10 uppercase tracking-wider">
          <span className="truncate max-w-[60%]">{tournamentName}</span>
          <span>Innings {innings}</span>
        </div>
        
        <div className="flex justify-between items-end relative z-10">
          <div className="flex-1">
            <h2 className="text-xl font-bold opacity-90 truncate max-w-[200px]">{battingTeam?.name}</h2>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-black tracking-tighter">{score}</span>
              <span className="text-2xl font-bold text-cricket-200">/ {wickets}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold">{oversDisplay} <span className="text-sm font-normal opacity-80">/ {oversTotal}</span></div>
            <div className="text-sm mt-1 bg-white/20 px-3 py-1 rounded-full inline-block backdrop-blur-sm">
              CRR: {crr}
            </div>
          </div>
        </div>

        {innings === 2 && (
          <div className="mt-4 pt-3 border-t border-white/20 text-sm font-medium flex items-center justify-between">
            <div>
              <span className="mr-3">Target: {target}</span>
              <span>RRR: {rrr}</span>
            </div>
            <span>Need {target - score} from {ballsRemaining}</span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 pb-48">
        
        {/* Timeline */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-xs font-bold text-slate-500 whitespace-nowrap mr-2">Timeline:</span>
          {(timeline || []).filter(b => b.innings === innings).slice(-12).map((event, i) => {
             let chipType = 'dot';
             let chipValue = event.runs || 0;
             if (event.isWicket) { chipType = 'wicket'; chipValue = 'W'; }
             else if (event.isWide) { chipType = 'wide'; chipValue = 'Wd'; }
             else if (event.isNoBall) { chipType = 'noBall'; chipValue = 'Nb'; }
             else if (event.isBye) { chipType = 'bye'; }
             else if (event.isLegBye) { chipType = 'legBye'; }
             else if (event.runs === 4) { chipType = 'four'; }
             else if (event.runs === 6) { chipType = 'six'; }
             else if (event.runs > 0) { chipType = 'one'; }
             
             return <BallChip key={event._id || i} type={chipType} value={chipValue} />;
          })}
          {(!timeline || timeline.length === 0) && <span className="text-sm text-slate-400 italic">Match starting...</span>}
          <div className="w-8 h-8 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex-shrink-0 ml-auto" />
        </div>

        {/* Players Area */}
        <div className="grid gap-4">
          <Card>
            <CardContent className="p-0">
              <PlayerRow name={striker?.name} runs={striker?.runs} balls={striker?.balls} isStriker />
              <div className="h-[1px] bg-slate-100 dark:bg-slate-800" />
              <PlayerRow name={nonStriker?.name} runs={nonStriker?.runs} balls={nonStriker?.balls} />
              
              <div className="bg-slate-50 dark:bg-slate-800/50 p-2 text-center text-xs text-slate-500 font-medium">
                Partnership: {partnership?.runs ?? 0} ({partnership?.balls ?? 0})
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="p-4 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 shrink-0">
                    B
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate">{currentBowler?.name || 'Unknown Bowler'}</h4>
                    <p className="text-xs text-slate-500">{Math.floor((currentBowler?.ballsBowled || 0) / 6)}.{(currentBowler?.ballsBowled || 0) % 6}-0-{currentBowler?.runsConceded || 0}-{currentBowler?.wickets || 0}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-xs text-slate-500 block">Eco</span>
                  <span className="font-bold">
                    {(currentBowler?.ballsBowled || 0) > 0 ? ((currentBowler?.runsConceded || 0) / ((currentBowler?.ballsBowled || 1) / 6)).toFixed(1) : '0.0'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <ActionButton label="Wicket" color="bg-error" icon={UserMinus} onClick={handleWicket} disabled={isSubmitting} />
          <ActionButton label="Wide" color="bg-blue-500" onClick={() => handleAction(() => addEvent({ type: 'wide' }))} disabled={isSubmitting} />
          <ActionButton label="No Ball" color="bg-accent-orange" onClick={() => handleAction(() => addEvent({ type: 'noBall' }))} disabled={isSubmitting} />
          <ActionButton label="Bye" color="bg-slate-500" onClick={() => handleAction(() => addEvent({ type: 'bye', value: 1 }))} disabled={isSubmitting} />
        </div>
      </div>

      {/* Sticky Bottom Scoring Panel */}
      <div className="fixed bottom-0 left-0 right-0 md:relative md:mt-auto bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 p-4 pb-safe z-40">
        <div className="max-w-lg mx-auto">
          {/* Main Score Grid */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            <ScoreButton value="0" onClick={() => handleRun(0)} disabled={isSubmitting} />
            <ScoreButton value="1" onClick={() => handleRun(1)} disabled={isSubmitting} />
            <ScoreButton value="2" onClick={() => handleRun(2)} disabled={isSubmitting} />
            <ScoreButton value="3" onClick={() => handleRun(3)} disabled={isSubmitting} />
            <ScoreButton value="4" onClick={() => handleRun(4)} disabled={isSubmitting} color="text-blue-500 border-blue-200 bg-blue-50 dark:bg-blue-900/20" />
            <ScoreButton value="6" onClick={() => handleRun(6)} disabled={isSubmitting} color="text-accent-orange border-orange-200 bg-orange-50 dark:bg-orange-900/20" />
            
            {/* Utility Buttons taking up remaining space */}
            <div className="col-span-2 grid grid-cols-2 gap-3">
              <Button variant="outline" onClick={() => handleAction(() => undo())} disabled={isSubmitting} className="h-full rounded-2xl font-bold flex flex-col gap-1 text-slate-500 border-slate-200">
                <RotateCcw size={18} />
                <span className="text-[10px]">Undo</span>
              </Button>
              <Button variant="primary" onClick={() => {
                handleAction(async () => {
                  if (currentMatch.currentInnings === 1) {
                    await useStore.getState().endInnings();
                  } else {
                    setActiveModal('matchComplete');
                  }
                });
              }} disabled={isSubmitting} className="h-full rounded-2xl font-bold flex flex-col gap-1 shadow-lg shadow-cricket/30">
                <Flag size={18} />
                <span className="text-[10px]">End Inn</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponents

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl"
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-bold text-lg">{title}</h3>
          {onClose && <button onClick={onClose} className="text-slate-400 hover:text-slate-900">✕</button>}
        </div>
        <div className="p-6">
          {children}
        </div>
      </motion.div>
    </div>
  );
}

function BallChip({ type, value }) {
  const styles = {
    dot: 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
    one: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700',
    four: 'bg-blue-500 text-white shadow-sm shadow-blue-500/20',
    six: 'bg-accent-orange text-white shadow-sm shadow-orange-500/20',
    wicket: 'bg-error text-white shadow-sm shadow-error/20',
    wide: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 border border-blue-200',
    noBall: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300 border border-orange-200',
    bye: 'bg-slate-600 text-white shadow-sm',
    legBye: 'bg-slate-500 text-white shadow-sm',
  };

  const labels = { dot: '0', one: value, four: '4', six: '6', wicket: 'W', wide: 'Wd', noBall: 'Nb', bye: `${value}B`, legBye: `${value}Lb` };

  return (
    <motion.div 
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${styles[type] || styles.dot}`}
    >
      {labels[type]}
    </motion.div>
  );
}

function PlayerRow({ name, runs = 0, balls = 0, isStriker }) {
  const sr = balls > 0 ? ((runs / balls) * 100).toFixed(1) : '0.0';
  
  return (
    <div className={`p-4 flex justify-between items-center ${isStriker ? 'bg-cricket/5 dark:bg-cricket/10' : ''}`}>
      <div className="flex items-center gap-3 w-1/2 min-w-0">
        {isStriker ? <span className="w-2 h-2 rounded-full bg-cricket shrink-0" /> : <span className="w-2 h-2 shrink-0" />}
        <h4 className={`font-bold text-sm truncate ${isStriker ? 'text-cricket' : ''}`}>{name || 'Unknown'}</h4>
      </div>
      <div className="flex justify-between w-1/2 text-right shrink-0">
        <div className="w-1/3">
          <span className="font-bold text-lg">{runs}</span>
        </div>
        <div className="w-1/3 text-slate-500 mt-1">
          <span className="text-xs">({balls})</span>
        </div>
        <div className="w-1/3 text-slate-500 mt-1">
          <span className="text-xs">{sr}</span>
        </div>
      </div>
    </div>
  );
}

function ActionButton({ label, color, icon: Icon, onClick, disabled }) {
  return (
    <Button 
      onClick={onClick}
      disabled={disabled}
      className={`${color} text-white h-16 rounded-2xl flex flex-col gap-1 border-none shadow-sm hover:opacity-90 transition-opacity p-0`}
    >
      {Icon && <Icon size={18} />}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </Button>
  );
}

function ScoreButton({ value, color = "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700", onClick, disabled }) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.9 }}
      className={`h-16 rounded-2xl border-2 text-2xl font-black flex items-center justify-center shadow-sm disabled:opacity-50 ${color}`}
    >
      {value}
    </motion.button>
  );
}

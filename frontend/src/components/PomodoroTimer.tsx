import React, { useState, useEffect, useRef } from 'react';
import { Task } from '../types';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Coffee, 
  Brain, 
  Flame, 
  CheckCircle2, 
  Sparkles,
  Volume2
} from 'lucide-react';
import { playChime } from '../utils/sound';
import confetti from 'canvas-confetti';

interface PomodoroTimerProps {
  tasks: Task[];
  onTaskCompleted?: (taskId: string) => void;
}

type Mode = 'work' | 'shortBreak' | 'longBreak';

const MODE_TIMES: Record<Mode, number> = {
  work: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const PomodoroTimer: React.FC<PomodoroTimerProps> = ({ tasks }) => {
  const [mode, setMode] = useState<Mode>('work');
  const [timeLeft, setTimeLeft] = useState(MODE_TIMES.work);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>('');
  const [completedSessions, setCompletedSessions] = useState<number>(() => {
    return parseInt(localStorage.getItem('unitask_pomodoro_streak') || '0', 10);
  });

  const timerRef = useRef<number | null>(null);

  // Switch modes
  const handleModeChange = (newMode: Mode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_TIMES[newMode]);
  };

  // Timer countdown effect
  useEffect(() => {
    if (isRunning) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsRunning(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const handleSessionComplete = () => {
    playChime('pomodoro');
    if (mode === 'work') {
      const nextStreak = completedSessions + 1;
      setCompletedSessions(nextStreak);
      localStorage.setItem('unitask_pomodoro_streak', nextStreak.toString());

      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 }
      });

      // Browser Notification if permitted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🎓 Pomodoro Focus Complete!', {
          body: 'Great job! Time for a 5-minute restorative study break.',
          icon: '/favicon.ico'
        });
      }

      // Auto switch to short break
      handleModeChange('shortBreak');
    } else {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('⏰ Break Ended', {
          body: 'Ready to dive back into your academic tasks?',
          icon: '/favicon.ico'
        });
      }
      handleModeChange('work');
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    playChime('click');
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(MODE_TIMES[mode]);
  };

  // Format MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Progress for circle
  const total = MODE_TIMES[mode];
  const progress = ((total - timeLeft) / total) * 100;

  // Uncompleted tasks list
  const activeTasks = tasks.filter(t => t.status !== 'completed');

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Main Glass Panel */}
      <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden text-center">
        
        {/* Glow ambient circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Mode Selector Buttons */}
        <div className="inline-flex items-center gap-1.5 p-1 rounded-2xl bg-slate-900/60 border border-white/10 relative z-10">
          <button
            onClick={() => handleModeChange('work')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'work'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" /> Focus (25m)
          </button>
          <button
            onClick={() => handleModeChange('shortBreak')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'shortBreak'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coffee className="w-4 h-4" /> Short Break (5m)
          </button>
          <button
            onClick={() => handleModeChange('longBreak')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              mode === 'longBreak'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Coffee className="w-4 h-4" /> Long Break (15m)
          </button>
        </div>

        {/* Circular Display */}
        <div className="my-8 relative flex items-center justify-center">
          <div className="w-64 h-64 sm:w-72 sm:h-72 rounded-full glass-card border border-white/15 flex flex-col items-center justify-center relative shadow-2xl">
            
            {/* SVG Ring */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                className="stroke-slate-800"
                strokeWidth="6"
                fill="none"
              />
              <circle
                cx="50%"
                cy="50%"
                r="44%"
                className={`transition-all duration-1000 ${
                  mode === 'work'
                    ? 'stroke-indigo-500'
                    : mode === 'shortBreak'
                    ? 'stroke-emerald-400'
                    : 'stroke-purple-400'
                }`}
                strokeWidth="6"
                strokeDasharray="276"
                strokeDashoffset={276 - (276 * progress) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Time inside circle */}
            <span className="text-5xl sm:text-6xl font-black text-white tracking-wider font-mono">
              {timeFormatted}
            </span>
            <span className="text-xs uppercase font-bold text-slate-400 mt-2 tracking-widest">
              {mode === 'work' ? 'Study Focus' : 'Rest Break'}
            </span>
          </div>
        </div>

        {/* Active Task Selector */}
        <div className="max-w-md mx-auto mb-6 relative z-10">
          <label className="block text-xs font-semibold text-slate-400 mb-1.5">
            Currently Focusing On:
          </label>
          <select
            value={selectedTaskId}
            onChange={e => setSelectedTaskId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl glass-input text-xs font-medium cursor-pointer"
          >
            <option value="" className="bg-slate-900 text-white">General Study / Lecture Review</option>
            {activeTasks.map(t => (
              <option key={t.id} value={t.id} className="bg-slate-900 text-white">
                [{t.category.toUpperCase()}] {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Play / Pause / Reset Controls */}
        <div className="flex items-center justify-center gap-4 relative z-10">
          <button
            onClick={toggleTimer}
            className={`px-8 py-3.5 rounded-2xl font-bold text-sm shadow-xl flex items-center gap-2 transition-all active:scale-95 ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30'
                : 'bg-gradient-to-r from-indigo-500 via-purple-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-600/30'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" /> Start Focus
              </>
            )}
          </button>

          <button
            onClick={resetTimer}
            className="p-3.5 rounded-2xl glass-card text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Stats Streak Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        
        <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white">{completedSessions} Sessions</h4>
            <p className="text-xs text-slate-400">Total Pomodoro cycles finished</p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-3xl border border-white/10 shadow-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-xl font-bold text-white">
              {Math.round((completedSessions * 25) / 60 * 10) / 10} Hours
            </h4>
            <p className="text-xs text-slate-400">Deep academic focus time logged</p>
          </div>
        </div>

      </div>

    </div>
  );
};

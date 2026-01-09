
import React from 'react';
import { Phase, Task } from '../types';

interface Props {
  tasks: Task[];
}

const DoubleDiamondProgress: React.FC<Props> = ({ tasks }) => {
  const phases = [Phase.DISCOVER, Phase.DEFINE, Phase.DEVELOP, Phase.DELIVER];
  
  const getPhasePoints = (phase: Phase) => 
    tasks.filter(t => t.phase === phase).reduce((acc, curr) => acc + curr.points, 0);

  const totalPoints = tasks.reduce((acc, curr) => acc + curr.points, 0);

  const getColors = (idx: number) => {
    switch (idx) {
      case 0: return { bg: 'bg-blue-500', text: 'text-white' };
      case 1: return { bg: 'bg-[#8B5CF6]', text: 'text-white' };
      case 2: return { bg: 'bg-[#F97316]', text: 'text-white' };
      case 3: return { bg: 'bg-[#10B981]', text: 'text-white' };
      default: return { bg: 'bg-gray-500', text: 'text-white' };
    }
  };

  return (
    <div className="w-full py-10 px-8 bg-white">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black text-[#1F1F23] tracking-tight">Fluxo Estratégico</h3>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Estimativa de esforço por etapa</p>
        </div>
        <div className="text-right">
          <span className="text-xs font-black text-blue-600 bg-blue-50 px-5 py-2 rounded-full border border-blue-100 shadow-sm inline-block">
             Soma: {totalPoints} dias úteis
          </span>
        </div>
      </div>
      
      <div className="flex w-full h-48 items-center justify-between px-10 relative">
        {phases.map((phase, idx) => {
          const points = getPhasePoints(phase);
          const percentage = totalPoints > 0 ? (points / totalPoints) * 100 : 0;
          const colors = getColors(idx);
          
          return (
            <div key={phase} className="flex flex-col items-center">
              <div className={`
                w-24 h-24 transform rotate-45 flex items-center justify-center transition-all duration-500 shadow-xl relative
                ${colors.bg}
              `}>
                <div className="-rotate-45 text-[10px] font-black text-center leading-tight relative z-10 flex flex-col items-center">
                  <span className={`${colors.text} uppercase text-[8px] tracking-wider mb-0.5`}>
                    {phase}
                  </span>
                  <span className={`${colors.text} text-xl`}>
                    {points}p
                  </span>
                </div>
              </div>
              
              <div className="mt-14 text-[10px] font-bold text-gray-400">
                {Math.round(percentage)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DoubleDiamondProgress;

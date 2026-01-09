
import React, { useState } from 'react';
import { Task, Phase } from '../types';

interface Props {
  task: Task;
}

const TaskCard: React.FC<Props> = ({ task }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const text = `${task.title}\n\n${task.description}\n\nEntregável: ${task.deliverable}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const getPhaseStyles = (phase: Phase) => {
    switch (phase) {
      case Phase.DISCOVER: return {
        bar: 'bg-blue-500',
        tagBg: 'bg-blue-50',
        tagText: 'text-blue-700',
        tagBorder: 'border-blue-100'
      };
      case Phase.DEFINE: return {
        bar: 'bg-[#8B5CF6]',
        tagBg: 'bg-violet-50',
        tagText: 'text-violet-700',
        tagBorder: 'border-violet-100'
      };
      case Phase.DEVELOP: return {
        bar: 'bg-[#F97316]',
        tagBg: 'bg-orange-50',
        tagText: 'text-orange-700',
        tagBorder: 'border-orange-100'
      };
      case Phase.DELIVER: return {
        bar: 'bg-[#10B981]',
        tagBg: 'bg-emerald-50',
        tagText: 'text-emerald-700',
        tagBorder: 'border-emerald-100'
      };
      default: return {
        bar: 'bg-gray-500',
        tagBg: 'bg-gray-50',
        tagText: 'text-gray-700',
        tagBorder: 'border-gray-100'
      };
    }
  };

  const styles = getPhaseStyles(task.phase);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex overflow-hidden relative group">
      {/* Barra lateral colorida */}
      <div className={`w-1.5 shrink-0 ${styles.bar}`} />
      
      <div className="p-6 w-full flex flex-col">
        {/* Top Row: ID and Tags */}
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-black text-gray-400 tracking-widest uppercase">{task.id}</span>
          <div className="flex gap-2">
            <span className={`text-[9px] font-black px-3 py-1 rounded-md border uppercase tracking-wider ${styles.tagBg} ${styles.tagText} ${styles.tagBorder}`}>
              {task.phase}
            </span>
            <span className="text-[9px] font-black px-3 py-1 rounded-md bg-[#1F1F23] text-white uppercase tracking-wider">
              {task.points} PTS
            </span>
          </div>
        </div>

        {/* Title and Copy Icon */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <h4 className="text-base font-bold text-[#1F1F23] leading-tight">
            {task.title}
          </h4>
          <button 
            onClick={copyToClipboard}
            className="shrink-0 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-400 transition-colors"
            title="Copiar História"
          >
            {copied ? (
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
              </svg>
            )}
          </button>
        </div>

        {/* Description Box */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <p className="text-xs text-gray-600 leading-relaxed font-medium italic">
            "{task.description}"
          </p>
          <div className="mt-3 pt-3 border-t border-gray-200 flex items-center gap-2">
            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Entregável:</span>
            <span className="text-[10px] font-bold text-gray-500 uppercase">{task.deliverable}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;

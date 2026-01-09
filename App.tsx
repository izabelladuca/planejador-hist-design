
import React, { useState, useCallback } from 'react';
import { Seniority, GeneratorParams, BacklogResponse, Task, Phase, PlanningStrategy } from './types';
import { generateBacklog } from './services/geminiService';
import DoubleDiamondProgress from './components/DoubleDiamondProgress';
import TaskCard from './components/TaskCard';

// Ícone de Planner/Clipboard para substituir a mascote
const PlannerIcon = ({ className }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.5" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <path d="M9 12h6" />
    <path d="M9 16h6" />
    <path d="M12 8h.01" />
  </svg>
);

const App: React.FC = () => {
  const [params, setParams] = useState<GeneratorParams>({
    productName: '',
    context: '',
    targetAudience: '',
    constraints: '',
    metrics: '',
    deadline: 15,
    seniority: Seniority.MID,
    planningStrategy: PlanningStrategy.IDEAL
  });
  const [loading, setLoading] = useState(false);
  const [backlog, setBacklog] = useState<BacklogResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copyAllSuccess, setCopyAllSuccess] = useState(false);

  const handleGenerate = async () => {
    if (!params.context.trim() || !params.productName.trim()) {
      setError("Por favor, preencha ao menos o Produto e a Descrição da iniciativa.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await generateBacklog(params);
      setBacklog(result);
    } catch (err) {
      console.error(err);
      setError("Falha ao criar histórias para a iniciativa. Verifique sua conexão ou tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleNewInitiative = () => {
    setBacklog(null);
    setParams({
      productName: '',
      context: '',
      targetAudience: '',
      constraints: '',
      metrics: '',
      deadline: 15,
      seniority: Seniority.MID,
      planningStrategy: PlanningStrategy.IDEAL
    });
  };

  const copyAllToClipboard = async () => {
    if (!backlog) return;
    
    const headers = ['Título', 'Descrição'];
    const rows = backlog.tasks.map(task => {
      const fullDescription = `${task.description}\n\nEntregável: ${task.deliverable}`;
      const escapedTitle = task.title.replace(/"/g, '""');
      const escapedDesc = fullDescription.replace(/"/g, '""');
      return `"${escapedTitle}"\t"${escapedDesc}"`;
    });

    const content = [headers.join('\t'), ...rows].join('\n');
    
    try {
      await navigator.clipboard.writeText(content);
      setCopyAllSuccess(true);
      setTimeout(() => setCopyAllSuccess(false), 2000);
    } catch (err) {
      console.error('Falha ao copiar backlog completo', err);
    }
  };

  const tasksByPhase = (phase: Phase) => 
    backlog?.tasks.filter(t => t.phase === phase) || [];

  return (
    <div className="min-h-screen flex flex-col bg-[#F3F4F6]">
      {/* Header */}
      <header className="bg-[#1F1F23] text-white border-b border-white/10 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#8B5CF6] rounded-2xl flex items-center justify-center shadow-xl shadow-violet-500/20 relative overflow-hidden group">
               <div className="absolute inset-0 opacity-20 triangle-pattern bg-white"></div>
               <PlannerIcon className="w-7 h-7 text-white relative z-10" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight leading-none">Planejador de histórias</h1>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#8B5CF6] font-black mt-1">Cogna Design Team</p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-4 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Left Panel: Inputs */}
        <aside className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-2xl shadow-gray-200/50 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            
            <h2 className="text-lg font-black text-[#1F1F23] mb-8 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              Parâmetros da Iniciativa
            </h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Produto / Squad</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#8B5CF6] outline-none transition-all font-bold"
                  placeholder="Ex: Portal do Aluno / Squad Onboarding"
                  value={params.productName}
                  onChange={(e) => setParams({ ...params, productName: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Objetivo Principal (O quê?)</label>
                <textarea
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-4 text-sm focus:border-[#8B5CF6] outline-none transition-all min-h-[100px] font-medium leading-relaxed"
                  placeholder="Descreva o problema ou a oportunidade de design..."
                  value={params.context}
                  onChange={(e) => setParams({ ...params, context: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Público-Alvo (Quem?)</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#8B5CF6] outline-none transition-all font-medium"
                  placeholder="Ex: Alunos de graduação EAD"
                  value={params.targetAudience}
                  onChange={(e) => setParams({ ...params, targetAudience: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Restrições / Requisitos</label>
                <input
                  type="text"
                  className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#8B5CF6] outline-none transition-all font-medium"
                  placeholder="Ex: Mobile First, Acessibilidade WCAG 2.1"
                  value={params.constraints}
                  onChange={(e) => setParams({ ...params, constraints: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Métricas (KPIs)</label>
                  <input
                    type="text"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#8B5CF6] outline-none transition-all font-medium"
                    placeholder="Ex: NPS, Taxa"
                    value={params.metrics}
                    onChange={(e) => setParams({ ...params, metrics: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Estratégia</label>
                  <select
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#8B5CF6] outline-none cursor-pointer font-bold appearance-none"
                    value={params.planningStrategy}
                    onChange={(e) => setParams({ ...params, planningStrategy: e.target.value as PlanningStrategy })}
                  >
                    <option value={PlanningStrategy.IDEAL}>Plano Ideal</option>
                    <option value={PlanningStrategy.OPTIMIZED}>Plano Otimizado</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Deadline (Dias)</label>
                  <input
                    type="number"
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#8B5CF6] outline-none font-bold"
                    value={params.deadline}
                    min={1}
                    max={90}
                    onChange={(e) => setParams({ ...params, deadline: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Senioridade</label>
                  <select
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl p-3 text-sm focus:border-[#8B5CF6] outline-none cursor-pointer font-bold appearance-none"
                    value={params.seniority}
                    onChange={(e) => setParams({ ...params, seniority: e.target.value as Seniority })}
                  >
                    <option value={Seniority.JUNIOR}>Junior</option>
                    <option value={Seniority.MID}>Pleno</option>
                    <option value={Seniority.SENIOR}>Senior</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border-2 border-red-100 text-red-600 text-xs rounded-xl font-bold flex items-center gap-2">
                   <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path></svg>
                   {error}
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className={`
                    w-full py-5 rounded-2xl font-black text-xs tracking-[0.2em] uppercase transition-all relative overflow-hidden
                    ${loading 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-[#8B5CF6] text-white hover:bg-[#7C3AED] shadow-2xl shadow-violet-500/30 hover:-translate-y-1 active:scale-[0.98]'
                    }
                  `}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Gerando Backlog...
                    </span>
                  ) : 'Decompor Histórias'}
                </button>

                <button
                  onClick={handleNewInitiative}
                  className="w-full py-3 text-blue-500 hover:text-blue-600 font-bold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
                  </svg>
                  Nova iniciativa
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Right Panel: Result */}
        <div className="lg:col-span-8 space-y-10">
          {!backlog && !loading && (
            <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] border-4 border-dashed border-gray-100 text-gray-400 p-16 text-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-8 text-gray-300">
                <PlannerIcon className="w-12 h-12" />
              </div>
              <h3 className="text-2xl font-black text-[#1F1F23]/40 mb-3 tracking-tight">Seu backlog estratégico começa aqui</h3>
              <p className="max-w-xs text-sm font-medium leading-relaxed text-gray-400">Insira os detalhes da PI Planning ao lado para gerar um backlog atômico estruturado pela metodologia oficial Cogna.</p>
            </div>
          )}

          {loading && (
             <div className="h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-[2.5rem] p-16 relative overflow-hidden shadow-sm">
               <div className="absolute inset-0 triangle-pattern opacity-[0.03] scale-150"></div>
               <div className="relative w-32 h-32 mb-10">
                  <div className="absolute inset-0 border-8 border-violet-100 rounded-full"></div>
                  <div className="absolute inset-0 border-8 border-[#8B5CF6] rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <PlannerIcon className="w-12 h-12 text-[#8B5CF6] animate-pulse" />
                  </div>
               </div>
               <h3 className="text-2xl font-black text-[#1F1F23] mb-3 tracking-tight">Sincronizando Metodologia...</h3>
               <p className="text-sm text-gray-400 text-center max-w-sm font-medium leading-relaxed">Aplicando padrões de escrita e visibilidade de gestão Cogna Design.</p>
             </div>
          )}

          {backlog && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              {/* Progress Visualization */}
              <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 overflow-hidden">
                <DoubleDiamondProgress tasks={backlog.tasks} />
              </div>

              {/* Backlog Lists */}
              <div className="space-y-16">
                {[Phase.DISCOVER, Phase.DEFINE, Phase.DEVELOP, Phase.DELIVER].map(phase => {
                  const tasks = tasksByPhase(phase);
                  if (tasks.length === 0) return null;

                  return (
                    <div key={phase} className="space-y-6">
                      <div className="flex items-center justify-between border-b-2 border-gray-100 pb-4">
                        <div className="flex items-center gap-4">
                           <span className={`w-3 h-3 rounded-full ${
                             phase === Phase.DISCOVER ? 'bg-blue-500' :
                             phase === Phase.DEFINE ? 'bg-[#8B5CF6]' :
                             phase === Phase.DEVELOP ? 'bg-[#F97316]' : 'bg-[#10B981]'
                           }`}></span>
                           <h3 className="text-base font-black text-[#1F1F23] uppercase tracking-[0.3em]">{phase}</h3>
                        </div>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full">{tasks.length} Histórias</span>
                      </div>
                      <div className="flex flex-col gap-6 w-full">
                        {tasks.map(task => (
                          <TaskCard key={task.id} task={task} />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-center pt-10 pb-20">
                <button 
                  onClick={copyAllToClipboard}
                  className={`
                    flex items-center gap-3 text-xs font-black px-10 py-5 rounded-2xl shadow-2xl transition-all hover:-translate-y-1 uppercase tracking-widest
                    ${copyAllSuccess 
                      ? 'bg-[#10B981] text-white' 
                      : 'bg-[#1F1F23] text-white hover:bg-[#2D2D34]'
                    }
                  `}
                >
                  {copyAllSuccess ? (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                      Copiado para Planilha!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                      </svg>
                      Copiar Todas as histórias
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex justify-center mb-8 gap-10 grayscale opacity-30 group">
             <div className="flex flex-col items-center">
               <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-[#8B5CF6] transition-colors">Design Ops</span>
             </div>
             <div className="flex flex-col items-center">
               <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-[#F97316] transition-colors">PI Planning</span>
             </div>
             <div className="flex flex-col items-center">
               <span className="text-[10px] font-black uppercase tracking-widest group-hover:text-[#10B981] transition-colors">Frente de IA</span>
             </div>
          </div>
          <p className="text-[10px] text-gray-400 font-black tracking-[0.4em] uppercase">
            Cogna Design Framework &bull; 2026
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;

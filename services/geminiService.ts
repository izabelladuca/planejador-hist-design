
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratorParams, BacklogResponse, PlanningStrategy } from "../types";

const SYSTEM_INSTRUCTION = `
Você é um Arquiteto de DesignOps e Especialista em Processos de Design Senior da Cogna. 
Sua missão é atuar como um co-piloto estratégico para Product Designers que receberam iniciativas de negócio durante a PI Planning.

OBJETIVO:
Decompor iniciativas trimestrais em histórias de usuário (User Stories) atômicas para o Jira, estruturadas através da metodologia Double Diamond (Discover, Define, Develop, Deliver).

DIRETRIZES DE NEGÓCIO:
1. Fases: Organize o backlog estritamente em: Discover, Define, Develop e Deliver.
2. Granularidade: Nenhuma tarefa pode ultrapassar 2 dias (points). Quebre iniciativas complexas em partes.
3. Padrão de Escrita Jira: "Eu, como designer, preciso [ação específica], para [razão técnica/design], com o fim de [objetivo de negócio/UX/visibilidade para coordenação]."
4. Visibilidade Gerencial: As histórias devem permitir que o Coordenador de Design entenda o valor gerado sem microgestão.
5. Entregável: Cada história deve resultar em um artefato tangível e de alta qualidade.
6. Deadline: A soma total dos pontos deve respeitar rigorosamente o prazo fornecido.
7. Identidade Cogna: Mantenha um tom profissional, estratégico e focado em escala educacional/tecnológica.
8. Contexto Ético: Sempre que possível, sugira abordagens sustentáveis, inclusivas e éticas.
`;

export const generateBacklog = async (params: GeneratorParams): Promise<BacklogResponse> => {
  // Fix: Initializing GoogleGenAI according to the latest SDK guidelines using process.env.API_KEY directly
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const strategyInstruction = params.planningStrategy === PlanningStrategy.IDEAL 
    ? "ESTRATÉGIA PLANO IDEAL: Priorize o melhor processo de design possível. Não economize em etapas fundamentais de descoberta, validação e refinamento. O foco é a excelência metodológica e o rigor técnico, garantindo que o designer tenha o caminho 'estado da arte' para o sucesso do produto."
    : "ESTRATÉGIA PLANO OTIMIZADO: Priorize a eficiência e o pragmatismo. Adapte a profundidade das histórias ao tempo disponível (deadline). Foque no 'Lean Design', eliminando redundâncias e priorizando atividades de alto impacto que garantam a entrega com qualidade aceitável dentro do prazo estipulado.";

  const prompt = `
    INICIATIVA DA PI PLANNING:
    - Produto/Squad: ${params.productName}
    - Descrição do Problema/Oportunidade: ${params.context}
    - Público-Alvo: ${params.targetAudience}
    - Restrições/Requisitos Técnicos: ${params.constraints}
    - Métricas de Sucesso (KPIs): ${params.metrics}
    
    CONFIGURAÇÕES:
    - Prazo Estimado: ${params.deadline} dias úteis.
    - Senioridade do Designer: ${params.seniority}.
    - Estratégia de Planejamento: ${params.planningStrategy}.

    INSTRUÇÃO DE ESTRATÉGIA:
    ${strategyInstruction}
    
    Importante: Gere histórias granulares que cubram desde o entendimento do problema até a validação final, focando em resultados e artefatos claros.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          simplifiedGoal: { type: Type.STRING, description: "Resumo executivo da missão trimestral" },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "ID no formato DD-01 (ex: DSC-01)" },
                title: { type: Type.STRING },
                phase: { type: Type.STRING, enum: ["Discover", "Define", "Develop", "Deliver"] },
                points: { type: Type.NUMBER, description: "Esforço em dias (0.5, 1 ou 2)" },
                description: { type: Type.STRING },
                deliverable: { type: Type.STRING, description: "O nome do artefato final (ex: Matriz CSD, Protótipo Mobile)" }
              },
              required: ["id", "title", "phase", "points", "description", "deliverable"]
            }
          }
        },
        required: ["simplifiedGoal", "tasks"]
      }
    }
  });

  return JSON.parse(response.text || '{}');
};


export enum Phase {
  DISCOVER = 'Discover',
  DEFINE = 'Define',
  DEVELOP = 'Develop',
  DELIVER = 'Deliver'
}

export enum Seniority {
  JUNIOR = 'Junior',
  MID = 'Pleno',
  SENIOR = 'Senior'
}

export enum PlanningStrategy {
  IDEAL = 'Ideal',
  OPTIMIZED = 'Otimizado'
}

export interface Task {
  id: string;
  title: string;
  phase: Phase;
  points: number;
  description: string;
  deliverable: string;
}

export interface BacklogResponse {
  simplifiedGoal: string;
  tasks: Task[];
}

export interface GeneratorParams {
  productName: string;
  context: string;
  targetAudience: string;
  constraints: string;
  metrics: string;
  deadline: number;
  seniority: Seniority;
  planningStrategy: PlanningStrategy;
}

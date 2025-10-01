// Web3 Project Launch Simulator - Type Definitions
export interface ProjectData {
  id: string;
  name: string;
  description: string;
  category: ProjectCategory;
  blockchain: 'BNB' | 'BSC' | 'Ethereum' | 'Polygon';
  currentStage: ProjectStage;
  score: number;
  decisions: Decision[];
  metrics: ProjectMetrics;
  createdAt: string;
  completedAt?: string;
}

export interface Decision {
  id: string;
  stage: ProjectStage;
  question: string;
  options: DecisionOption[];
  selectedOption?: string;
  impact: DecisionImpact;
}

export interface DecisionOption {
  id: string;
  text: string;
  consequences: {
    score: number;
    funding: number;
    community: number;
    technical: number;
    marketing: number;
  };
  description: string;
}

export interface DecisionImpact {
  funding: number;
  community: number;
  technical: number;
  marketing: number;
  overall: number;
}

export interface ProjectMetrics {
  funding: number; // 0-100
  community: number; // 0-100
  technical: number; // 0-100
  marketing: number; // 0-100
  credibility: number; // 0-100
  successProbability: number; // 0-100
}

export type ProjectCategory = 
  | 'DeFi'
  | 'NFT'
  | 'GameFi'
  | 'Infrastructure'
  | 'DApp'
  | 'Metaverse'
  | 'DAO'
  | 'Bridge';

export type ProjectStage = 
  | 'ideation'
  | 'planning'
  | 'development'
  | 'testing'
  | 'pre-launch'
  | 'launch'
  | 'growth'
  | 'scaling';

export interface SimulatorState {
  currentProject: ProjectData | null;
  stage: ProjectStage;
  isCompleted: boolean;
  totalScore: number;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  userId: string;
  username: string;
  totalScore: number;
  projectsCompleted: number;
  averageScore: number;
  favoriteCategory: ProjectCategory;
  rank: number;
}

// BNB/BSC Specific Features
export interface BSCProjectFeatures {
  usesPancakeSwap: boolean;
  integrationWithBNB: boolean;
  gasFeeOptimization: boolean;
  crossChainCompatibility: boolean;
  bscValidatorSupport: boolean;
}

export interface MarketSimulation {
  bnbPrice: number;
  gasFees: number;
  networkCongestion: number;
  tvlOnBSC: number;
  competitorProjects: number;
  marketSentiment: 'bullish' | 'bearish' | 'neutral';
}
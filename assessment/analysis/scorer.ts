export type Pillar = {
  name: string; weight: number;
};
export const PILLARS: Pillar[] = [
  { name:"Protocol/Security", weight:20 },
  { name:"Infrastructure/Scalability", weight:15 },
  { name:"Compliance/Privacy", weight:10 },
  { name:"Tokenomics/Treasury Ops", weight:10 },
  { name:"Product UX & Learning", weight:15 },
  { name:"DevEx (SDK/Docs/Tooling)", weight:10 },
  { name:"Community & Growth", weight:10 },
  { name:"Governance & Transparency", weight:10 }
];

export function criPercent(levels: number[]) {
  const sum = PILLARS.reduce((acc,p,i)=> acc + (p.weight * (levels[i]/4)), 0);
  return Math.round(sum);
}
import { ethers } from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers";
import fs from "fs";

const PILLARS_ORDER = [
  "Protocol/Security",
  "Infrastructure/Scalability",
  "Compliance/Privacy",
  "Tokenomics/Treasury Ops",
  "Product UX & Learning",
  "DevEx (SDK/Docs/Tooling)",
  "Community & Growth",
  "Governance & Transparency"
];

function levelsFromScores(scores:any[]): number[] {
  const map = new Map(scores.map((s:any)=> [s.pillar, s.level]));
  return PILLARS_ORDER.map(p => Number(map.get(p) ?? 0));
}

// mesmo sortKeys do hashCanonical
function sortKeys(obj:any):any{
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj && typeof obj === "object") {
    return Object.keys(obj).sort().reduce((acc,k)=>{
      acc[k] = sortKeys(obj[k]); return acc;
    }, {} as any);
  }
  return obj;
}

async function main() {
  const address = process.env.CONTRACT_ADDRESS!;
  const reportPath = "report.json";   // JSON final
  const uri = process.env.REPORT_URI!;                   // ipfs://...

  const raw = JSON.parse(fs.readFileSync(reportPath,"utf-8"));
  const canon = sortKeys({
    assessment_date: raw.assessment_date || new Date().toISOString().slice(0,10),
    cri_percent: raw.cri_percent,
    pillar_scores: (raw.pillar_scores||[]).map((s:any)=> s.level),
    questionnaire_version: raw.questionnaire_version || 1,
    num_questions: Math.min(raw.num_questions||15, 15),
    report_uri: uri,
    top_risks: raw.top_risks||[],
    next_steps_14d: raw.next_steps_14d||[]
  });
  const contentHash = keccak256(toUtf8Bytes(JSON.stringify(canon)));

  // TODO: Fix contract interface - temporarily commented for build
  /*
  const factory = await ethers.getContractFactory("CTDHUB_BINNOAI");
  const c = factory.attach(address);

  const user = process.env.USER_ADDRESS!; // endereço do avaliado (wallet)
  const assessmentDate = Math.floor(Date.now()/1000);
  const criPercent = Number(raw.cri_percent);
  const questionnaireVersion = Number(raw.questionnaire_version || 1);
  const numQuestions = Math.min(Number(raw.num_questions || 15), 15);
  const levels8 = levelsFromScores(raw.pillar_scores);

  const tx = await c.recordAssessment({
    user,
    assessmentDate,
    criPercent,
    questionnaireVersion,
    numQuestions,
    pillarLevels: levels8,
    contentHash,
    uri
  });
  console.log("recordAssessment tx:", tx.hash);
  */
  
  console.log("Assessment recording temporarily disabled for build");
  // const rc = await tx.wait();
  // console.log("confirmed in:", rc?.blockNumber);
}

main().catch((e)=>{ console.error(e); process.exit(1); });
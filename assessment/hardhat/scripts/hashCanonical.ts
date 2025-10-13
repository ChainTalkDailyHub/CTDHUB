import { keccak256, toUtf8Bytes } from "ethers";
import fs from "fs";

// ordena chaves recursivamente
function sortKeys(obj:any):any{
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj && typeof obj === "object") {
    return Object.keys(obj).sort().reduce((acc,k)=>{
      acc[k] = sortKeys(obj[k]); return acc;
    }, {} as any);
  }
  return obj;
}

const jsonPath = process.argv[2] || "report.json";
const raw = JSON.parse(fs.readFileSync(jsonPath,"utf-8"));
const canon = sortKeys(raw);
const canonStr = JSON.stringify(canon);
const hash = keccak256(toUtf8Bytes(canonStr));
console.log("contentHash:", hash);
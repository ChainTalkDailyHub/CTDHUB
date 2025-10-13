export function sortKeys(obj:any):any{
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj && typeof obj === "object") {
    return Object.keys(obj).sort().reduce((acc,k)=>{
      acc[k] = sortKeys(obj[k]); return acc;
    }, {} as any);
  }
  return obj;
}
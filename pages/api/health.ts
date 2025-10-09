import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  
  if (_req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  res.status(200).json({
    ok: true,
    timestamp: new Date().toISOString(),
    node: process.version,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    hasSupabase: !!process.env.SUPABASE_URL && !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      NETLIFY: !!process.env.NETLIFY,
      SITE_URL: process.env.SITE_URL || 'not-set'
    },
    functions: {
      'binno-final-analysis': 'available',
      'analysis-reports': 'available'
    }
  });
}
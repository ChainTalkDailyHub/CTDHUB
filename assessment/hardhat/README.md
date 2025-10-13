# CTDHUB-BINNOAI (Hardhat, BNB)

## Passos
1) `cp .env.example .env` e preencha `PRIVATE_KEY`, `BSCSCAN_API_KEY`, `BSC_RPC`.
2) `npm i` • `npm run build`
3) Deploy: `npm run deploy:bsc` → anote o endereço (CONTRACT_ADDRESS).
4) Verify: export CONTRACT_ADDRESS, ADMIN_ADDRESS, INIT_WRITER_ADDRESS e rode `npm run verify:bsc`.
5) Gere o JSON final do relatório (`report.json` com {cri_percent, pillar_scores[8], top_risks, next_steps_14d, questionnaire_version, num_questions, assessment_date}).
6) Calcule o `contentHash`: `npm run hash -- report.json`
7) Grave on-chain (defina `REPORT_URI` ipfs://..., `USER_ADDRESS`, `CONTRACT_ADDRESS` no .env) e rode `npm run record:bsc`.

### Ordem dos pilares (levels[8]):
0 Security, 1 Infra/Scale, 2 Compliance, 3 Tokenomics/Treasury,
4 Product UX/Learning, 5 DevEx, 6 Community/Growth, 7 Governance/Transparency

### Limite de perguntas
- Off-chain: trave o questionário em ≤15 perguntas.
- On-chain: `recordAssessment` rejeita `numQuestions > 15`.
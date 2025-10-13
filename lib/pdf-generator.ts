// CTDHUB PDF Generator - Análise AI Real
// Tema atualizado com dados completos da análise AI

interface AIAnalysisData {
  executive_summary: string;
  performance_badge?: string;
  major_strengths?: {
    strategic_vision?: {
      title: string;
      points: string[];
      badge: string;
    };
    technical_mastery?: {
      title: string;
      points: string[];
      badge: string;
    };
    business_excellence?: {
      title: string;
      points: string[];
      badge: string;
    };
  };
  areas_of_excellence?: string;
  elite_recommendations?: {
    immediate_opportunities?: string[];
    strategic_development?: string[];
  };
  continued_excellence?: {
    advanced_research?: string;
    leadership_opportunities?: string;
  };
  final_assessment?: string;
  overall_score?: number;
  // Legacy support
  score?: number;
  strengths?: string[];
  weaknesses?: string[];
  improvements?: string[];
  next_actions?: string[];
  learning_resources?: string[];
  risks?: string[];
  copy_paste_detected?: boolean;
  copy_paste_explanation?: string;
}

interface UserAnswer {
  question_id?: string;
  question?: string;
  question_text?: string;
  user_response: string;
  timestamp?: number;
}

interface BlockchainData {
  walletAddress?: string;
  transactionHash?: string;
  verified?: boolean;
  network?: string;
}

export function generateEnhancedPDFHTML(
  analysisData: AIAnalysisData, 
  userAnswers: UserAnswer[], 
  blockchainData?: BlockchainData,
  sessionId?: string
): string {
  const currentDate = new Date();
  const dateStr = currentDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = currentDate.toLocaleTimeString('en-US');
  
  // Extract project name from first answer
  const projectName = userAnswers[0]?.user_response?.split('.')[0]?.split(',')[0]?.trim() || 'Web3 Project';
  const score = analysisData.score || 0;
  
  // Score-based styling
  const getScoreColor = (score: number) => {
    if (score >= 70) return '#00D4AA'; // Green
    if (score >= 50) return '#FFCC33'; // Yellow
    return '#FF5555'; // Red
  };

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return '🚀';
    if (score >= 70) return '💪';
    if (score >= 50) return '📈';
    if (score >= 30) return '⚠️';
    return '🔴';
  };

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CTDHUB - BINNO AI Analysis Report</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: #000000;
            color: #F2F2F2;
            line-height: 1.6;
            padding: 0;
        }

        .pdf-container {
            width: 210mm;
            min-height: 297mm;
            background: #000000;
            margin: 0 auto;
            position: relative;
            box-shadow: 0 0 40px rgba(255, 204, 51, 0.2);
        }

        /* HEADER CTDHUB */
        .pdf-header {
            background: linear-gradient(135deg, #FFCC33 0%, #FFC700 50%, #FFCC33 100%);
            height: 140px;
            padding: 30px 40px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: relative;
            overflow: hidden;
            box-shadow: 0 8px 32px rgba(255, 204, 51, 0.4);
        }

        .pdf-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><defs><pattern id="circuit" patternUnits="userSpaceOnUse" width="40" height="40"><path d="M10 10h20v20h-20z" fill="none" stroke="%23000" stroke-width="0.5" opacity="0.1"/><circle cx="20" cy="20" r="2" fill="%23000" opacity="0.1"/></pattern></defs><rect width="100%" height="100%" fill="url(%23circuit)"/></svg>');
            opacity: 0.3;
        }

        .header-left {
            display: flex;
            align-items: center;
            gap: 25px;
            z-index: 2;
            position: relative;
        }

        .logo-section {
            display: flex;
            align-items: center;
            gap: 15px;
        }

        .main-logo {
            height: 80px;
            width: auto;
            object-fit: contain;
            background: transparent;
            filter: drop-shadow(0 4px 12px rgba(0,0,0,0.3));
        }

        .logo-fallback {
            height: 80px;
            width: 200px;
            background: rgba(0,0,0,0.15);
            border-radius: 16px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 800;
            font-size: 24px;
            color: #000;
            letter-spacing: 2px;
            border: 3px solid #000;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        .header-info {
            color: #000;
        }

        .header-info h1 {
            font-size: 32px;
            font-weight: 900;
            margin-bottom: 8px;
            text-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .header-info .subtitle {
            font-size: 18px;
            font-weight: 600;
            opacity: 0.8;
            margin-bottom: 8px;
        }

        .binno-badge {
            background: rgba(0,0,0,0.2);
            color: #000;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 700;
            display: inline-block;
            margin-bottom: 4px;
            border: 1px solid #000;
        }

        .header-right {
            text-align: right;
            color: #000;
            z-index: 2;
            position: relative;
        }

        .score-display {
            background: rgba(0,0,0,0.15);
            padding: 20px;
            border-radius: 16px;
            border: 3px solid #000;
            text-align: center;
            min-width: 120px;
        }

        .score-number {
            font-size: 36px;
            font-weight: 900;
            color: ${getScoreColor(score)};
            text-shadow: 0 2px 8px rgba(0,0,0,0.3);
            margin-bottom: 5px;
        }

        .score-label {
            font-size: 14px;
            font-weight: 600;
            opacity: 0.8;
        }

        /* CONTENT */
        .pdf-content {
            padding: 40px;
            background: linear-gradient(180deg, #000000 0%, #0A0A0A 100%);
            min-height: calc(297mm - 280px);
        }

        .analysis-title {
            font-size: 28px;
            font-weight: 800;
            color: #FFCC33;
            text-align: center;
            margin-bottom: 40px;
            text-shadow: 0 0 20px rgba(255, 204, 51, 0.6);
            border-bottom: 2px solid #2A2A2A;
            padding-bottom: 20px;
        }

        .project-info {
            background: linear-gradient(135deg, #1a1a1a 0%, #0E0E0E 100%);
            padding: 25px;
            border-radius: 16px;
            border: 2px solid #2A2A2A;
            border-left: 4px solid #8BE9FD;
            margin-bottom: 30px;
        }

        .project-info h3 {
            color: #8BE9FD;
            font-size: 18px;
            margin-bottom: 15px;
            font-weight: 700;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 20px;
            margin-bottom: 20px;
        }

        .info-item {
            background: rgba(255, 204, 51, 0.1);
            padding: 15px;
            border-radius: 12px;
            border: 1px solid #2A2A2A;
        }

        .info-item strong {
            color: #FFCC33;
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
        }

        /* EXECUTIVE SUMMARY */
        .executive-summary {
            background: linear-gradient(135deg, #1a1a1a 0%, #0E0E0E 100%);
            padding: 30px;
            border-radius: 16px;
            border: 2px solid #2A2A2A;
            border-left: 4px solid #FFCC33;
            margin-bottom: 30px;
            position: relative;
        }

        .executive-summary::before {
            content: '${getScoreEmoji(score)}';
            position: absolute;
            top: -15px;
            right: 20px;
            font-size: 30px;
            background: #000;
            padding: 5px 15px;
            border-radius: 20px;
            border: 2px solid #FFCC33;
        }

        .executive-summary h3 {
            color: #FFCC33;
            font-size: 20px;
            margin-bottom: 15px;
            font-weight: 700;
        }

        .executive-summary p {
            font-size: 16px;
            line-height: 1.7;
            color: #F2F2F2;
        }

        /* ANALYSIS SECTIONS */
        .analysis-section {
            background: linear-gradient(135deg, #1a1a1a 0%, #0E0E0E 100%);
            padding: 25px;
            border-radius: 16px;
            border: 2px solid #2A2A2A;
            margin-bottom: 25px;
            position: relative;
        }

        .strengths-section {
            border-left: 4px solid #00D4AA;
        }

        .weaknesses-section {
            border-left: 4px solid #FF5555;
        }

        .improvements-section {
            border-left: 4px solid #8BE9FD;
        }

        .analysis-section h3 {
            font-size: 18px;
            margin-bottom: 20px;
            font-weight: 700;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .strengths-section h3 { color: #00D4AA; }
        .weaknesses-section h3 { color: #FF5555; }
        .improvements-section h3 { color: #8BE9FD; }

        .analysis-list {
            list-style: none;
            padding: 0;
        }

        .analysis-list li {
            padding: 12px 0;
            border-bottom: 1px solid #2A2A2A;
            position: relative;
            padding-left: 25px;
        }

        .analysis-list li:last-child {
            border-bottom: none;
        }

        .analysis-list li::before {
            content: '▶';
            position: absolute;
            left: 0;
            color: #FFCC33;
            font-size: 12px;
        }

        /* STUDY PLAN */
        .study-plan {
            background: linear-gradient(135deg, #1a1a1a 0%, #0E0E0E 100%);
            padding: 30px;
            border-radius: 16px;
            border: 2px solid #2A2A2A;
            border-left: 4px solid #BD93F9;
            margin-bottom: 30px;
        }

        .study-plan h3 {
            color: #BD93F9;
            font-size: 20px;
            margin-bottom: 25px;
            font-weight: 700;
        }

        .study-item {
            background: rgba(189, 147, 249, 0.1);
            padding: 20px;
            border-radius: 12px;
            border: 1px solid #2A2A2A;
            margin-bottom: 20px;
        }

        .study-item h4 {
            color: #BD93F9;
            font-size: 16px;
            margin-bottom: 15px;
            font-weight: 600;
        }

        .study-details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 15px;
        }

        .study-detail {
            font-size: 14px;
        }

        .study-detail strong {
            color: #8BE9FD;
            font-weight: 600;
        }

        .resources-list {
            margin-top: 10px;
        }

        .resources-list li {
            font-size: 13px;
            color: #F2F2F2;
            margin-bottom: 5px;
            padding-left: 15px;
            position: relative;
        }

        .resources-list li::before {
            content: '📚';
            position: absolute;
            left: 0;
        }

        /* NEXT ACTIONS */
        .next-actions {
            background: linear-gradient(135deg, #1a1a1a 0%, #0E0E0E 100%);
            padding: 25px;
            border-radius: 16px;
            border: 2px solid #2A2A2A;
            border-left: 4px solid #50FA7B;
            margin-bottom: 30px;
        }

        .next-actions h3 {
            color: #50FA7B;
            font-size: 18px;
            margin-bottom: 20px;
            font-weight: 700;
        }

        .actions-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
        }

        .action-item {
            background: rgba(80, 250, 123, 0.1);
            padding: 15px;
            border-radius: 12px;
            border: 1px solid #2A2A2A;
            font-size: 14px;
        }

        /* BLOCKCHAIN INFO */
        .blockchain-section {
            background: linear-gradient(135deg, #1a1a1a 0%, #0E0E0E 100%);
            padding: 25px;
            border-radius: 16px;
            border: 2px solid #2A2A2A;
            border-left: 4px solid #F1FA8C;
            margin-bottom: 30px;
        }

        .blockchain-section h3 {
            color: #F1FA8C;
            font-size: 18px;
            margin-bottom: 20px;
            font-weight: 700;
        }

        /* FOOTER */
        .pdf-footer {
            background: #0A0A0A;
            padding: 25px 40px;
            border-top: 2px solid #2A2A2A;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: #666;
        }

        .footer-left {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .footer-right {
            text-align: right;
        }

        /* EXCELLENCE STYLES */
        .strength-category {
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid rgba(34, 197, 94, 0.4);
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 20px;
        }

        .strength-category h3 {
            color: #22c55e;
            font-size: 16px;
            margin-bottom: 15px;
            font-weight: 600;
        }

        .excellence-badge {
            background: linear-gradient(135deg, #FFCC33 0%, #FFA500 100%);
            color: #000;
            padding: 6px 12px;
            border-radius: 15px;
            font-weight: 600;
            font-size: 10px;
            display: inline-block;
            margin-top: 10px;
        }

        .success-highlight {
            background: rgba(34, 197, 94, 0.1);
            border-left: 3px solid #22c55e;
            padding: 15px;
            border-radius: 8px;
            margin: 15px 0;
        }

        .recommendation-category {
            margin-bottom: 20px;
        }

        .recommendation-category h3 {
            color: #8BE9FD;
            font-size: 16px;
            margin-bottom: 10px;
            font-weight: 600;
        }

        .performance-badge {
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            font-size: 12px;
            display: inline-block;
            margin-bottom: 15px;
            box-shadow: 0 4px 15px rgba(34, 197, 94, 0.3);
        }

        /* PRINT STYLES */
        @media print {
            body { background: white !important; }
            .pdf-container { box-shadow: none; }
            .analysis-section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="pdf-container">
        <!-- HEADER -->
        <div class="header-left">
            <div class="logo-section">
                <img src="/images/CTDHUB.png" alt="CTDHUB Logo" class="main-logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div class="logo-fallback" style="display:none;">CTDHUB</div>
            </div>
            <div class="header-info">
                <h1>CTDHUB</h1>
                <div class="subtitle">BINNO AI Analysis</div>
                <div class="binno-badge">Powered by Binno</div>
                <div style="font-size: 12px; opacity: 0.7;">${dateStr} • ${timeStr}</div>
            </div>
            <div class="header-right">
                <div class="score-display">
                    <div class="score-number">${score}%</div>
                    <div class="score-label">SCORE</div>
                </div>
            </div>
        </div>

        <!-- CONTENT -->
        <div class="pdf-content">
            <h2 class="analysis-title">📊 BinnoAI Comprehensive Analysis</h2>
            
            ${analysisData.performance_badge ? `
            <div class="performance-badge">${analysisData.performance_badge}</div>
            ` : ''}

            <!-- PROJECT INFO -->
            <div class="project-info">
                <h3>🚀 Project Information</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Project:</strong>
                        ${projectName}
                    </div>
                    <div class="info-item">
                        <strong>Questions:</strong>
                        ${userAnswers.length} answered
                    </div>
                    <div class="info-item">
                        <strong>Session:</strong>
                        ${sessionId || 'N/A'}
                    </div>
                </div>
            </div>

            <!-- EXECUTIVE SUMMARY -->
            <div class="executive-summary">
                <h3>📋 Executive Summary</h3>
                <p>${analysisData.executive_summary}</p>
            </div>

            <!-- NEW STRUCTURED ANALYSIS -->
            ${analysisData.major_strengths ? `
            <div class="analysis-section">
                <h2 class="analysis-title">🏆 Major Strengths Demonstrated</h2>
                
                ${analysisData.major_strengths.strategic_vision ? `
                <div class="strength-category">
                    <h3>${analysisData.major_strengths.strategic_vision.title}</h3>
                    <ul class="analysis-list">
                        ${analysisData.major_strengths.strategic_vision.points.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                    <span class="excellence-badge">${analysisData.major_strengths.strategic_vision.badge}</span>
                </div>
                ` : ''}
                
                ${analysisData.major_strengths.technical_mastery ? `
                <div class="strength-category">
                    <h3>${analysisData.major_strengths.technical_mastery.title}</h3>
                    <ul class="analysis-list">
                        ${analysisData.major_strengths.technical_mastery.points.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                    <span class="excellence-badge">${analysisData.major_strengths.technical_mastery.badge}</span>
                </div>
                ` : ''}
                
                ${analysisData.major_strengths.business_excellence ? `
                <div class="strength-category">
                    <h3>${analysisData.major_strengths.business_excellence.title}</h3>
                    <ul class="analysis-list">
                        ${analysisData.major_strengths.business_excellence.points.map(point => `<li>${point}</li>`).join('')}
                    </ul>
                    <span class="excellence-badge">${analysisData.major_strengths.business_excellence.badge}</span>
                </div>
                ` : ''}
            </div>
            ` : ''}

            <!-- AREAS OF EXCELLENCE -->
            ${analysisData.areas_of_excellence ? `
            <div class="analysis-section">
                <h2 class="analysis-title">🎖️ Areas of Excellence</h2>
                <div class="success-highlight">
                    ${analysisData.areas_of_excellence}
                </div>
            </div>
            ` : ''}

            <!-- ELITE RECOMMENDATIONS -->
            ${analysisData.elite_recommendations ? `
            <div class="analysis-section">
                <h2 class="analysis-title">🚀 Elite Recommendations</h2>
                
                ${analysisData.elite_recommendations.immediate_opportunities ? `
                <div class="recommendation-category">
                    <h3>Immediate Leadership Opportunities</h3>
                    <ul class="analysis-list">
                        ${analysisData.elite_recommendations.immediate_opportunities.map(opp => `<li>${opp}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${analysisData.elite_recommendations.strategic_development ? `
                <div class="recommendation-category">
                    <h3>Strategic Development Focus</h3>
                    <ul class="analysis-list">
                        ${analysisData.elite_recommendations.strategic_development.map(dev => `<li>${dev}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
            ` : ''}

            <!-- LEGACY SUPPORT FOR OLD FORMAT -->
            ${analysisData.strengths && analysisData.strengths.length > 0 ? `
            <div class="analysis-section strengths-section">
                <h3>💪 Strengths</h3>
                <ul class="analysis-list">
                    ${analysisData.strengths.map(strength => `<li>${strength}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${analysisData.weaknesses && analysisData.weaknesses.length > 0 ? `
            <div class="analysis-section weaknesses-section">
                <h3>⚠️ Areas for Improvement</h3>
                <ul class="analysis-list">
                    ${analysisData.weaknesses.map(weakness => `<li>${weakness}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${analysisData.improvements && analysisData.improvements.length > 0 ? `
            <div class="analysis-section improvements-section">
                <h3>📈 Recommended Improvements</h3>
                <ul class="analysis-list">
                    ${analysisData.improvements.map(improvement => `<li>${improvement}</li>`).join('')}
                </ul>
            </div>
            ` : ''}

            ${analysisData.next_actions && analysisData.next_actions.length > 0 ? `
            <div class="next-actions">
                <h3>🎯 Next Actions (30 days)</h3>
                <div class="actions-grid">
                    ${analysisData.next_actions.map(action => `
                        <div class="action-item">${action}</div>
                    `).join('')}
                </div>
            </div>
            ` : ''}

            <!-- BLOCKCHAIN INFO -->
            ${blockchainData ? `
            <div class="blockchain-section">
                <h3>⛓️ Blockchain Verification</h3>
                <div class="info-grid">
                    <div class="info-item">
                        <strong>Wallet:</strong>
                        ${blockchainData.walletAddress || 'N/A'}
                    </div>
                    <div class="info-item">
                        <strong>Network:</strong>
                        ${blockchainData.network || 'BSC'}
                    </div>
                    <div class="info-item">
                        <strong>Status:</strong>
                        ${blockchainData.verified ? '✅ Verified' : '❌ Not verified'}
                    </div>
                </div>
            </div>
            ` : ''}

            <!-- COPY PASTE ANALYSIS -->
            ${analysisData.copy_paste_detected ? `
            <div class="analysis-section" style="border-left: 4px solid #FF5555;">
                <h3 style="color: #FF5555;">🚨 Copy-Paste Detection</h3>
                <p>${analysisData.copy_paste_explanation}</p>
            </div>
            ` : ''}
        </div>

        <!-- FOOTER -->
        <div class="pdf-footer">
            <div class="footer-left">
                <div>
                    <strong>CTDHUB</strong> - Web3 Educational Platform
                </div>
                <div>
                    Powered by BINNO AI
                </div>
            </div>
            <div class="footer-right">
                <div>Generated: ${dateStr}</div>
                <div>AI Analysis • Score: ${score}%</div>
            </div>
        </div>
    </div>
</body>
</html>`;
}
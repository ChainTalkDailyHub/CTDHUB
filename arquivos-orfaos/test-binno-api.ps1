$testData = @{
    sessionId = "test-english-ai-$(Get-Date -Format 'yyyyMMddHHmmss')"
    userAnswers = @(
        @{
            question_text = "Tell me about your Web3 project. What is the project name, token supply, blockchain network, and main focus?"
            user_response = "CTDHUB is an innovative Web3 educational platform that uses artificial intelligence for blockchain project analysis and evaluation. The project plans to launch 1 billion CTD tokens on BNB Smart Chain, focusing on DeFi education and productivity tools. Our vision is to democratize Web3 knowledge access through personalized AI analysis, gamified reward systems, and strategic partnerships with established projects. We solve the problem of lack of objective and standardized Web3 project evaluation by offering assessments based on reliable metrics and educational feedback."
            timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
        },
        @{
            question_text = "How does the project ensure security and efficiency of smart contracts within the technical architecture?"
            user_response = "We implement multiple security layers: comprehensive CertiK audit, OpenZeppelin libraries usage, multi-sig pattern for critical functions, timelock for governance changes, and formal verification for complex logic. We utilize Chainlink for external oracles, Mythril for automated testing, and ImmuneFi for bug bounty programs. The architecture follows established EIP patterns with controlled upgradeability via proxy pattern."
            timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
        }
    )
    language = "en"
}

$jsonData = $testData | ConvertTo-Json -Depth 10

Write-Host "🚀 Testing BINNO AI Analysis API..." -ForegroundColor Yellow
Write-Host "📊 Sending test data..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/binno-final-analysis" -Method POST -Body $jsonData -ContentType "application/json"
    
    Write-Host "✅ API Response Received!" -ForegroundColor Green
    Write-Host "📈 Score: $($response.score)%" -ForegroundColor Cyan
    Write-Host "📝 Analysis Preview:" -ForegroundColor Yellow
    Write-Host $response.analysis.Substring(0, [Math]::Min(200, $response.analysis.Length)) -ForegroundColor White
    Write-Host "..." -ForegroundColor Gray
    
    if ($response.report) {
        Write-Host "📊 Structured Report Generated!" -ForegroundColor Green
        Write-Host "💪 Strengths: $($response.report.strengths.Count) identified" -ForegroundColor Green
        Write-Host "⚠️ Areas for Improvement: $($response.report.weaknesses.Count) identified" -ForegroundColor Yellow
        Write-Host "📚 Study Plan Items: $($response.report.study_plan.Count) recommendations" -ForegroundColor Cyan
    }
    
    Write-Host "`n🎉 BINNO AI Analysis System Working Perfectly!" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error testing API:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`n🔍 Checking server status..." -ForegroundColor Yellow
    
    try {
        $healthCheck = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
        Write-Host "✅ Server is responding (Status: $($healthCheck.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "❌ Server not responding: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🌐 Test Interface: http://localhost:3000/binno-ai-test-english.html" -ForegroundColor Magenta
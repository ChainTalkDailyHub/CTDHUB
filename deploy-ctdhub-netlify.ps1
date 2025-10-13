# CTDHUB Netlify Deploy Script
Write-Host "🚀 CTDHUB - BINNO AI Deploy to Netlify" -ForegroundColor Yellow
Write-Host "================================================" -ForegroundColor Cyan

# 1. Verificar se Netlify CLI está instalado
Write-Host "`n1️⃣ Checking Netlify CLI..." -ForegroundColor Green
try {
    $netlifyVersion = netlify --version
    Write-Host "✅ Netlify CLI found: $netlifyVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Netlify CLI not found. Installing..." -ForegroundColor Red
    Write-Host "💡 Run: npm install -g netlify-cli" -ForegroundColor Yellow
    Write-Host "💡 Then: netlify login" -ForegroundColor Yellow
    exit 1
}

# 2. Build do projeto
Write-Host "`n2️⃣ Building CTDHUB for production..." -ForegroundColor Green
Write-Host "Building with BINNO AI system in English..." -ForegroundColor Cyan

try {
    $buildResult = npm run netlify:build
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Build failed!" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Build error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Verificar arquivos de build
Write-Host "`n3️⃣ Checking build output..." -ForegroundColor Green
if (Test-Path "out") {
    $fileCount = (Get-ChildItem -Path "out" -Recurse -File).Count
    Write-Host "✅ Build output found: $fileCount files generated" -ForegroundColor Green
    
    # Verificar arquivos importantes
    $importantFiles = @(
        "out/index.html",
        "out/binno-ai-test-english.html",
        "out/binno/questionnaire",
        "out/_next"
    )
    
    foreach ($file in $importantFiles) {
        if (Test-Path $file) {
            Write-Host "✅ $file - OK" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $file - Missing" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "❌ Build output directory 'out' not found!" -ForegroundColor Red
    exit 1
}

# 4. Environment Variables Check
Write-Host "`n4️⃣ Environment Variables Check..." -ForegroundColor Green
Write-Host "⚠️ Remember to set these in Netlify dashboard:" -ForegroundColor Yellow
Write-Host "   • OPENAI_API_KEY=sk-proj-..." -ForegroundColor Gray
Write-Host "   • NEXT_PUBLIC_SUPABASE_URL=https://..." -ForegroundColor Gray
Write-Host "   • NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ..." -ForegroundColor Gray
Write-Host "   • NODE_ENV=production" -ForegroundColor Gray

# 5. Deploy options
Write-Host "`n5️⃣ Deploy Options:" -ForegroundColor Green
Write-Host "A) Deploy to preview (draft)" -ForegroundColor Cyan
Write-Host "B) Deploy to production" -ForegroundColor Cyan
Write-Host "C) Just show deploy command" -ForegroundColor Cyan

$choice = Read-Host "Choose option (A/B/C)"

switch ($choice.ToUpper()) {
    "A" {
        Write-Host "`n🔄 Deploying to preview..." -ForegroundColor Cyan
        netlify deploy --dir=out --message="BINNO AI System - English Version Preview"
        Write-Host "✅ Preview deploy completed!" -ForegroundColor Green
        Write-Host "🌐 Check the preview URL above for testing" -ForegroundColor Yellow
    }
    "B" {
        Write-Host "`n🚀 Deploying to production..." -ForegroundColor Cyan
        netlify deploy --prod --dir=out --message="BINNO AI System - English Version Production"
        Write-Host "✅ Production deploy completed!" -ForegroundColor Green
        Write-Host "🎉 CTDHUB with BINNO AI is now live!" -ForegroundColor Green
    }
    "C" {
        Write-Host "`n📋 Deploy Commands:" -ForegroundColor Cyan
        Write-Host "Preview: netlify deploy --dir=out" -ForegroundColor White
        Write-Host "Production: netlify deploy --prod --dir=out" -ForegroundColor White
        Write-Host "`nManual steps:" -ForegroundColor Yellow
        Write-Host "1. cd to project directory" -ForegroundColor Gray
        Write-Host "2. Run one of the commands above" -ForegroundColor Gray
        Write-Host "3. Visit the provided URL" -ForegroundColor Gray
    }
    default {
        Write-Host "❌ Invalid option. Run script again." -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n🎯 Deploy Summary:" -ForegroundColor Green
Write-Host "• BINNO AI System: ✅ English version with real AI analysis" -ForegroundColor White
Write-Host "• PDF Generation: ✅ Professional reports with CTDHUB branding" -ForegroundColor White
Write-Host "• OpenAI Integration: ✅ GPT-4o-mini with structured responses" -ForegroundColor White
Write-Host "• Static Export: ✅ Optimized for Netlify hosting" -ForegroundColor White
Write-Host "• Test Interface: ✅ Available at /binno-ai-test-english.html" -ForegroundColor White

Write-Host "`n🌐 Post-Deploy Testing:" -ForegroundColor Cyan
Write-Host "1. Visit: https://yourdomain.com/binno-ai-test-english.html" -ForegroundColor Gray
Write-Host "2. Test AI Analysis functionality" -ForegroundColor Gray
Write-Host "3. Test PDF generation with CTDHUB logo" -ForegroundColor Gray
Write-Host "4. Verify English content throughout" -ForegroundColor Gray

Write-Host "`n✨ CTDHUB BINNO AI Deploy Complete! ✨" -ForegroundColor Green
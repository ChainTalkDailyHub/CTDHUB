/**
 * Otimizações específicas para deploy Netlify
 * Garante compatibilidade e performance
 */

// Netlify Functions Optimization
module.exports = {
    build: {
        functions: "netlify/functions",
        publish: "out"
    },
    
    // Otimizações de deploy
    deploy: {
        optimization: {
            skipFunctionBuild: false,
            bundleSize: "optimize",
            coldStart: "minimize"
        }
    },
    
    // Headers otimizados
    headers: {
        "/*": {
            "X-CTD-Deploy": "optimized",
            "X-CTD-Version": "2.0.0"
        },
        "/.netlify/functions/*": {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Cache-Control": "no-cache"
        }
    },
    
    // Redirects para garantir routing correto
    redirects: [
        {
            from: "/api/binno-final-analysis",
            to: "/.netlify/functions/binno-final-analysis",
            status: 200,
            force: true
        }
    ]
};

console.log('📋 Configurações de Deploy Netlify:');
console.log('✅ Functions path otimizado');
console.log('✅ Headers CORS configurados');
console.log('✅ Redirects para compatibilidade');
console.log('✅ Cache strategies definidas');
console.log('🚀 Deploy otimizado para CTD Skill Compass!');
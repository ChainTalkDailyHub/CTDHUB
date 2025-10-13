const fetch = require('node-fetch');
require('dotenv').config();

async function main() {
    console.log("🔍 Verificando contrato no BSCScan (API v2)...\n");
    
    // Configurações
    const API_KEY = process.env.ETHERSCAN_API_KEY || "MGMTWJN7YCWA54BWYY1E29MAADNK5HKNGK";
    const CHAIN_ID = 56; // BSC Mainnet
    
    // Ler endereço do contrato
    let contractAddress;
    try {
        const deployInfo = require('../deployment-info.json');
        contractAddress = deployInfo.contractAddress;
        console.log(`📍 Contrato: ${contractAddress}`);
    } catch (error) {
        console.error("❌ Arquivo deployment-info.json não encontrado!");
        console.log("Execute primeiro: npm run deploy:burner");
        process.exit(1);
    }
    
    try {
        // 1. Verificar se contrato existe
        console.log("🔎 Verificando existência do contrato...");
        const codeQuery = await fetch(
            `https://api.etherscan.io/v2/api?chainid=${CHAIN_ID}&module=proxy&action=eth_getCode&address=${contractAddress}&tag=latest&apikey=${API_KEY}`
        );
        
        if (!codeQuery.ok) {
            throw new Error(`Erro na API: ${codeQuery.status}`);
        }
        
        const codeResponse = await codeQuery.json();
        
        if (codeResponse.result === '0x') {
            console.error("❌ Contrato não encontrado na blockchain!");
            return;
        }
        
        console.log("✅ Contrato encontrado na blockchain");
        console.log(`├─ Tamanho do bytecode: ${(codeResponse.result.length - 2) / 2} bytes\n`);
        
        // 2. Verificar saldo BNB do contrato
        console.log("💰 Verificando saldo BNB...");
        const balanceQuery = await fetch(
            `https://api.etherscan.io/v2/api?chainid=${CHAIN_ID}&module=account&action=balance&address=${contractAddress}&tag=latest&apikey=${API_KEY}`
        );
        
        const balanceResponse = await balanceQuery.json();
        const balanceWei = balanceResponse.result;
        const balanceBNB = (parseInt(balanceWei) / 10**18).toFixed(6);
        
        console.log(`├─ Saldo BNB: ${balanceBNB} BNB`);
        console.log(`└─ Saldo Wei: ${balanceWei}\n`);
        
        // 3. Verificar transações do contrato
        console.log("📜 Verificando transações...");
        const txQuery = await fetch(
            `https://api.etherscan.io/v2/api?chainid=${CHAIN_ID}&module=account&action=txlist&address=${contractAddress}&startblock=0&endblock=99999999&page=1&offset=10&sort=desc&apikey=${API_KEY}`
        );
        
        const txResponse = await txQuery.json();
        
        if (txResponse.result && txResponse.result.length > 0) {
            console.log(`✅ ${txResponse.result.length} transação(ões) encontrada(s)`);
            
            // Mostrar última transação
            const lastTx = txResponse.result[0];
            console.log("📝 Última transação:");
            console.log(`├─ Hash: ${lastTx.hash}`);
            console.log(`├─ Bloco: ${lastTx.blockNumber}`);
            console.log(`├─ De: ${lastTx.from}`);
            console.log(`├─ Para: ${lastTx.to}`);
            console.log(`├─ Valor: ${parseInt(lastTx.value) / 10**18} BNB`);
            console.log(`└─ Status: ${lastTx.isError === '0' ? '✅ Sucesso' : '❌ Erro'}\n`);
        } else {
            console.log("ℹ️  Nenhuma transação encontrada\n");
        }
        
        // 4. Verificar eventos/logs
        console.log("📋 Verificando eventos...");
        const logsQuery = await fetch(
            `https://api.etherscan.io/v2/api?chainid=${CHAIN_ID}&module=logs&action=getLogs&fromBlock=0&toBlock=latest&address=${contractAddress}&apikey=${API_KEY}`
        );
        
        const logsResponse = await logsQuery.json();
        
        if (logsResponse.result && logsResponse.result.length > 0) {
            console.log(`✅ ${logsResponse.result.length} evento(s) encontrado(s)`);
            
            // Contar eventos por tópico
            const eventCounts = {};
            logsResponse.result.forEach(log => {
                const topic = log.topics[0];
                eventCounts[topic] = (eventCounts[topic] || 0) + 1;
            });
            
            console.log("📊 Eventos por tipo:");
            Object.entries(eventCounts).forEach(([topic, count]) => {
                console.log(`├─ ${topic.substring(0, 10)}...: ${count}x`);
            });
            console.log();
        } else {
            console.log("ℹ️  Nenhum evento encontrado\n");
        }
        
        // 5. Verificar informações do criador
        const deployInfo = require('../deployment-info.json');
        console.log("👤 Informações do deploy:");
        console.log(`├─ Deployer: ${deployInfo.deployer}`);
        console.log(`├─ Data: ${deployInfo.deployedAt}`);
        console.log(`├─ Rede: ${deployInfo.network}`);
        console.log(`└─ Bloco: ${deployInfo.blockNumber}\n`);
        
        // 6. Links úteis
        console.log("🔗 Links úteis:");
        console.log(`├─ BSCScan: https://bscscan.com/address/${contractAddress}`);
        console.log(`├─ Código: https://bscscan.com/address/${contractAddress}#code`);
        console.log(`└─ Transações: https://bscscan.com/address/${contractAddress}#transactions\n`);
        
        console.log("✅ Verificação completa!");
        
        return {
            contractExists: true,
            balanceBNB: balanceBNB,
            transactionCount: txResponse.result?.length || 0,
            eventCount: logsResponse.result?.length || 0
        };
        
    } catch (error) {
        console.error("❌ Erro durante verificação:", error.message);
        
        if (error.message.includes('API')) {
            console.log("💡 Dica: Verifique se a API key está correta");
            console.log(`   API Key atual: ${API_KEY.substring(0, 8)}...`);
        }
        
        throw error;
    }
}

// Função para verificar múltiplas chains
async function verifyMultiChain(contractAddress) {
    console.log("🌐 Verificando em múltiplas chains...\n");
    
    const API_KEY = process.env.ETHERSCAN_API_KEY || "MGMTWJN7YCWA54BWYY1E29MAADNK5HKNGK";
    
    // Configurações das chains
    const chains = [
        { id: 56, name: "BSC Mainnet", explorer: "https://api.etherscan.io/v2/api" },
        { id: 1, name: "Ethereum", explorer: "https://api.etherscan.io/v2/api" },
        { id: 137, name: "Polygon", explorer: "https://api.etherscan.io/v2/api" }
    ];
    
    for (const chain of chains) {
        console.log(`🔍 Verificando ${chain.name} (Chain ID: ${chain.id})...`);
        
        try {
            const query = await fetch(
                `${chain.explorer}?chainid=${chain.id}&module=proxy&action=eth_getCode&address=${contractAddress}&tag=latest&apikey=${API_KEY}`
            );
            
            const response = await query.json();
            const exists = response.result && response.result !== '0x';
            
            console.log(`└─ Status: ${exists ? '✅ Encontrado' : '❌ Não encontrado'}`);
            
        } catch (error) {
            console.log(`└─ Status: ❌ Erro: ${error.message}`);
        }
    }
    
    console.log();
}

// Exemplo de uso da API v2 (conforme documentação)
async function exampleAPIv2Usage() {
    console.log("📖 Exemplo de uso da API v2 (conforme documentação):\n");
    
    const API_KEY = process.env.ETHERSCAN_API_KEY;
    const chains = [42161, 8453, 10]; // Arbitrum, Base, Optimism
    
    for (const chain of chains) {
        try {
            const query = await fetch(
                `https://api.etherscan.io/v2/api?chainid=${chain}&module=account&action=balance&address=0xb5d85cbf7cb3ee0d56b3bb207d5fc4b82f43f511&tag=latest&apikey=${API_KEY}`
            );
            
            const response = await query.json();
            const balance = response.result;
            
            console.log(`Chain ${chain} balance: ${balance}`);
            
        } catch (error) {
            console.log(`Chain ${chain} error: ${error.message}`);
        }
    }
}

if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { main, verifyMultiChain, exampleAPIv2Usage };
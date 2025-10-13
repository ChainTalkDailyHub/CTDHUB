const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CTDQuizBurner", function () {
    let CTDQuizBurner, ctdQuizBurner;
    let MockCTDToken, mockCTDToken;
    let owner, treasury, user1, user2, user3;
    
    const BURN_AMOUNT = ethers.parseEther("1000");
    const INITIAL_SUPPLY = ethers.parseEther("1000000");
    
    beforeEach(async function () {
        // Obter signers
        [owner, treasury, user1, user2, user3] = await ethers.getSigners();
        
        // Deploy mock CTD token
        MockCTDToken = await ethers.getContractFactory("MockERC20");
        mockCTDToken = await MockCTDToken.deploy(
            "ChainTalkDaily Token", 
            "CTD", 
            INITIAL_SUPPLY
        );
        await mockCTDToken.waitForDeployment();
        
        // Transferir tokens para treasury
        await mockCTDToken.transfer(treasury.address, ethers.parseEther("500000"));
        
        // Deploy CTDQuizBurner
        CTDQuizBurner = await ethers.getContractFactory("CTDQuizBurner");
        ctdQuizBurner = await CTDQuizBurner.deploy(
            await mockCTDToken.getAddress(),
            treasury.address
        );
        await ctdQuizBurner.waitForDeployment();
        
        // Configurar allowance do treasury
        await mockCTDToken.connect(treasury).approve(
            await ctdQuizBurner.getAddress(),
            ethers.parseEther("100000")
        );
    });
    
    describe("Deployment", function () {
        it("Deve configurar corretamente o contrato", async function () {
            expect(await ctdQuizBurner.ctdToken()).to.equal(await mockCTDToken.getAddress());
            expect(await ctdQuizBurner.projectTreasury()).to.equal(treasury.address);
            expect(await ctdQuizBurner.BURN_AMOUNT()).to.equal(BURN_AMOUNT);
            expect(await ctdQuizBurner.owner()).to.equal(owner.address);
        });
        
        it("Não deve permitir endereços zero", async function () {
            await expect(
                CTDQuizBurner.deploy(ethers.ZeroAddress, treasury.address)
            ).to.be.revertedWith("Token address nao pode ser zero");
            
            await expect(
                CTDQuizBurner.deploy(await mockCTDToken.getAddress(), ethers.ZeroAddress)
            ).to.be.revertedWith("Treasury address nao pode ser zero");
        });
    });
    
    describe("Quiz Completion and Burning", function () {
        it("Deve permitir queima para usuário elegível", async function () {
            const quizId = "quiz_001";
            
            // Verificar elegibilidade
            const [eligible, reason] = await ctdQuizBurner.canBurnTokens(user1.address);
            expect(eligible).to.be.true;
            expect(reason).to.equal("Elegivel para queima");
            
            // Executar queima
            await expect(
                ctdQuizBurner.connect(user1).burnQuizTokens(quizId)
            ).to.emit(ctdQuizBurner, "QuizCompleted")
            .withArgs(user1.address, BURN_AMOUNT, quizId, anyValue);
            
            // Verificar estado após queima
            expect(await ctdQuizBurner.hasCompletedQuiz(user1.address)).to.be.true;
            expect(await ctdQuizBurner.totalBurned()).to.equal(BURN_AMOUNT);
            expect(await ctdQuizBurner.totalUsers()).to.equal(1);
            
            // Verificar registro do usuário
            const userInfo = await ctdQuizBurner.getUserInfo(user1.address);
            expect(userInfo.completed).to.be.true;
            expect(userInfo.burnAmount).to.equal(BURN_AMOUNT);
            expect(userInfo.quizId).to.equal(quizId);
        });
        
        it("Não deve permitir queima dupla", async function () {
            const quizId1 = "quiz_001";
            const quizId2 = "quiz_002";
            
            // Primeira queima
            await ctdQuizBurner.connect(user1).burnQuizTokens(quizId1);
            
            // Segunda tentativa deve falhar
            await expect(
                ctdQuizBurner.connect(user1).burnQuizTokens(quizId2)
            ).to.be.revertedWith("Quiz ja completado anteriormente");
        });
        
        it("Não deve permitir reutilização de quiz ID", async function () {
            const quizId = "quiz_001";
            
            // Primeira queima
            await ctdQuizBurner.connect(user1).burnQuizTokens(quizId);
            
            // Segunda tentativa com mesmo quiz ID deve falhar
            await expect(
                ctdQuizBurner.connect(user2).burnQuizTokens(quizId)
            ).to.be.revertedWith("Quiz ID ja utilizado");
        });
        
        it("Deve suportar múltiplas queimas simultâneas", async function () {
            const quizIds = ["quiz_001", "quiz_002", "quiz_003"];
            const users = [user1, user2, user3];
            
            // Executar queimas em paralelo
            const promises = users.map((user, index) =>
                ctdQuizBurner.connect(user).burnQuizTokens(quizIds[index])
            );
            
            await Promise.all(promises);
            
            // Verificar resultados
            expect(await ctdQuizBurner.totalUsers()).to.equal(3);
            expect(await ctdQuizBurner.totalBurned()).to.equal(BURN_AMOUNT * 3n);
            
            // Verificar cada usuário
            for (let i = 0; i < users.length; i++) {
                expect(await ctdQuizBurner.hasCompletedQuiz(users[i].address)).to.be.true;
                const userInfo = await ctdQuizBurner.getUserInfo(users[i].address);
                expect(userInfo.quizId).to.equal(quizIds[i]);
            }
        });
    });
    
    describe("Security Features", function () {
        it("Deve falhar se allowance insuficiente", async function () {
            // Remover allowance
            await mockCTDToken.connect(treasury).approve(
                await ctdQuizBurner.getAddress(),
                0
            );
            
            await expect(
                ctdQuizBurner.connect(user1).burnQuizTokens("quiz_001")
            ).to.be.revertedWith("Falha na execucao da queima");
        });
        
        it("Deve falhar se saldo insuficiente no treasury", async function () {
            // Transferir todos os tokens do treasury
            const treasuryBalance = await mockCTDToken.balanceOf(treasury.address);
            await mockCTDToken.connect(treasury).transfer(owner.address, treasuryBalance);
            
            await expect(
                ctdQuizBurner.connect(user1).burnQuizTokens("quiz_001")
            ).to.be.revertedWith("Falha na execucao da queima");
        });
        
        it("Deve pausar e despausar corretamente", async function () {
            // Pausar contrato
            await ctdQuizBurner.togglePause();
            expect(await ctdQuizBurner.paused()).to.be.true;
            
            // Tentativa de queima deve falhar
            await expect(
                ctdQuizBurner.connect(user1).burnQuizTokens("quiz_001")
            ).to.be.revertedWithCustomError(ctdQuizBurner, "EnforcedPause");
            
            // Despausar
            await ctdQuizBurner.togglePause();
            expect(await ctdQuizBurner.paused()).to.be.false;
            
            // Queima deve funcionar novamente
            await expect(
                ctdQuizBurner.connect(user1).burnQuizTokens("quiz_001")
            ).to.not.be.reverted;
        });
        
        it("Apenas owner pode pausar", async function () {
            await expect(
                ctdQuizBurner.connect(user1).togglePause()
            ).to.be.revertedWithCustomError(ctdQuizBurner, "OwnableUnauthorizedAccount");
        });
    });
    
    describe("Query Functions", function () {
        beforeEach(async function () {
            // Configurar alguns dados de teste
            await ctdQuizBurner.connect(user1).burnQuizTokens("quiz_001");
            await ctdQuizBurner.connect(user2).burnQuizTokens("quiz_002");
        });
        
        it("Deve retornar estatísticas corretas", async function () {
            const [totalBurned, totalUsers, treasuryBalance, allowance] = 
                await ctdQuizBurner.getStats();
            
            expect(totalBurned).to.equal(BURN_AMOUNT * 2n);
            expect(totalUsers).to.equal(2);
            expect(treasuryBalance).to.be.gt(0);
            expect(allowance).to.be.gt(0);
        });
        
        it("Deve retornar lista de burners", async function () {
            const [users, total] = await ctdQuizBurner.getBurnersList(0, 10);
            
            expect(total).to.equal(2);
            expect(users.length).to.equal(2);
            expect(users).to.include(user1.address);
            expect(users).to.include(user2.address);
        });
        
        it("Deve paginar lista de burners", async function () {
            // Adicionar mais usuários
            await ctdQuizBurner.connect(user3).burnQuizTokens("quiz_003");
            
            // Primeira página
            const [page1, total1] = await ctdQuizBurner.getBurnersList(0, 2);
            expect(page1.length).to.equal(2);
            expect(total1).to.equal(3);
            
            // Segunda página
            const [page2, total2] = await ctdQuizBurner.getBurnersList(2, 2);
            expect(page2.length).to.equal(1);
            expect(total2).to.equal(3);
        });
        
        it("Deve verificar elegibilidade corretamente", async function () {
            // Usuário que já fez queima
            const [eligible1, reason1] = await ctdQuizBurner.canBurnTokens(user1.address);
            expect(eligible1).to.be.false;
            expect(reason1).to.equal("Quiz ja completado");
            
            // Usuário novo
            const [eligible2, reason2] = await ctdQuizBurner.canBurnTokens(user3.address);
            expect(eligible2).to.be.true;
            expect(reason2).to.equal("Elegivel para queima");
        });
    });
    
    describe("Emergency Functions", function () {
        it("Deve permitir withdraw de emergência pelo owner", async function () {
            // Enviar alguns BNB para o contrato
            await owner.sendTransaction({
                to: await ctdQuizBurner.getAddress(),
                value: ethers.parseEther("1")
            });
            
            const initialBalance = await ethers.provider.getBalance(owner.address);
            
            // Withdraw de emergência
            await expect(
                ctdQuizBurner.emergencyWithdraw(
                    ethers.ZeroAddress,
                    ethers.parseEther("1"),
                    owner.address
                )
            ).to.emit(ctdQuizBurner, "EmergencyWithdraw");
            
            const finalBalance = await ethers.provider.getBalance(owner.address);
            expect(finalBalance).to.be.gt(initialBalance);
        });
        
        it("Apenas owner pode fazer withdraw de emergência", async function () {
            await expect(
                ctdQuizBurner.connect(user1).emergencyWithdraw(
                    ethers.ZeroAddress,
                    ethers.parseEther("1"),
                    user1.address
                )
            ).to.be.revertedWithCustomError(ctdQuizBurner, "OwnableUnauthorizedAccount");
        });
    });
});

// Função auxiliar para valores que podem variar (timestamps, etc.)
const anyValue = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
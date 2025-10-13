// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title CTDQuizBurner
 * @dev Contrato de alta segurança para queima de tokens após completar quiz
 * @notice Os tokens são queimados da carteira do projeto, usuário paga apenas gas
 * @author CTDHUB Team
 */
contract CTDQuizBurner is Ownable, ReentrancyGuard, Pausable {
    
    // ===== ESTRUTURAS DE DADOS =====
    
    struct BurnRecord {
        address user;
        uint256 amount;
        uint256 timestamp;
        string quizId;
        bool completed;
    }
    
    // ===== VARIÁVEIS DE ESTADO =====
    
    IERC20 public immutable ctdToken;
    address public immutable projectTreasury;
    uint256 public constant BURN_AMOUNT = 1000 * 10**18; // 1000 CTD fixo
    
    // Mapeamentos para controle de segurança
    mapping(address => bool) public hasCompletedQuiz;
    mapping(address => uint256) public lastBurnTimestamp;
    mapping(address => BurnRecord) public burnRecords;
    mapping(string => bool) public usedQuizIds;
    
    // Controle de múltiplas execuções simultâneas
    mapping(address => bool) private _burning;
    
    // Contadores e estatísticas
    uint256 public totalBurned;
    uint256 public totalUsers;
    address[] public burnersList;
    
    // ===== EVENTOS =====
    
    event QuizCompleted(
        address indexed user, 
        uint256 amount, 
        string quizId, 
        uint256 timestamp
    );
    
    event EmergencyWithdraw(
        address indexed token, 
        uint256 amount, 
        address indexed to
    );
    
    event TreasuryAllowanceUpdated(
        uint256 previousAllowance, 
        uint256 newAllowance
    );
    
    // ===== MODIFICADORES =====
    
    modifier onlyEligibleUser() {
        require(!hasCompletedQuiz[msg.sender], "Quiz ja completado anteriormente");
        require(!_burning[msg.sender], "Queima em andamento");
        _;
    }
    
    modifier validQuizId(string memory quizId) {
        require(bytes(quizId).length > 0, "Quiz ID invalido");
        require(!usedQuizIds[quizId], "Quiz ID ja utilizado");
        _;
    }
    
    // ===== CONSTRUTOR =====
    
    /**
     * @dev Inicializa o contrato com endereços do token CTD e treasury
     * @param _ctdToken Endereço do token CTD
     * @param _projectTreasury Endereço da carteira do projeto (fonte dos tokens)
     */
    constructor(
        address _ctdToken,
        address _projectTreasury
    ) Ownable(msg.sender) {
        require(_ctdToken != address(0), "Token address nao pode ser zero");
        require(_projectTreasury != address(0), "Treasury address nao pode ser zero");
        
        ctdToken = IERC20(_ctdToken);
        projectTreasury = _projectTreasury;
    }
    
    // ===== FUNÇÃO PRINCIPAL =====
    
    /**
     * @dev Função principal para queimar tokens após completar quiz
     * @param quizId ID único do quiz completado
     * @notice Usuário paga apenas gas, tokens saem do treasury do projeto
     */
    function burnQuizTokens(string memory quizId) 
        external 
        nonReentrant 
        whenNotPaused 
        onlyEligibleUser 
        validQuizId(quizId) 
    {
        // Marca como em execução para prevenir reentrância
        _burning[msg.sender] = true;
        
        try this._executeBurn(msg.sender, quizId) {
            // Sucesso - libera lock
            _burning[msg.sender] = false;
        } catch {
            // Erro - libera lock e propaga erro
            _burning[msg.sender] = false;
            revert("Falha na execucao da queima");
        }
    }
    
    /**
     * @dev Função interna para executar a queima (separated para try/catch)
     * @param user Endereço do usuário
     * @param quizId ID do quiz
     */
    function _executeBurn(address user, string memory quizId) external {
        require(msg.sender == address(this), "Acesso restrito");
        
        // Verifica allowance do treasury
        uint256 allowance = ctdToken.allowance(projectTreasury, address(this));
        require(allowance >= BURN_AMOUNT, "Allowance insuficiente do treasury");
        
        // Verifica saldo do treasury
        uint256 treasuryBalance = ctdToken.balanceOf(projectTreasury);
        require(treasuryBalance >= BURN_AMOUNT, "Saldo insuficiente no treasury");
        
        // Executa transferência do treasury para endereço de burn
        // Usar dead address ao invés de address(0) para compatibilidade
        address BURN_ADDRESS = 0x000000000000000000000000000000000000dEaD;
        bool success = ctdToken.transferFrom(
            projectTreasury, 
            BURN_ADDRESS, 
            BURN_AMOUNT
        );
        require(success, "Falha na transferencia para burn");
        
        // Atualiza registros
        hasCompletedQuiz[user] = true;
        lastBurnTimestamp[user] = block.timestamp;
        usedQuizIds[quizId] = true;
        
        // Cria registro detalhado
        burnRecords[user] = BurnRecord({
            user: user,
            amount: BURN_AMOUNT,
            timestamp: block.timestamp,
            quizId: quizId,
            completed: true
        });
        
        // Atualiza estatísticas
        totalBurned += BURN_AMOUNT;
        if (burnRecords[user].timestamp == block.timestamp) {
            totalUsers++;
            burnersList.push(user);
        }
        
        // Emite evento
        emit QuizCompleted(user, BURN_AMOUNT, quizId, block.timestamp);
    }
    
    // ===== FUNÇÕES DE CONSULTA =====
    
    /**
     * @dev Verifica se usuário pode fazer queima
     * @param user Endereço do usuário
     * @return eligible True se pode fazer queima
     * @return reason Razão se não pode fazer queima
     */
    function canBurnTokens(address user) 
        external 
        view 
        returns (bool eligible, string memory reason) 
    {
        if (paused()) {
            return (false, "Contrato pausado");
        }
        
        if (hasCompletedQuiz[user]) {
            return (false, "Quiz ja completado");
        }
        
        if (_burning[user]) {
            return (false, "Queima em andamento");
        }
        
        uint256 allowance = ctdToken.allowance(projectTreasury, address(this));
        if (allowance < BURN_AMOUNT) {
            return (false, "Allowance insuficiente");
        }
        
        uint256 balance = ctdToken.balanceOf(projectTreasury);
        if (balance < BURN_AMOUNT) {
            return (false, "Saldo insuficiente no treasury");
        }
        
        return (true, "Elegivel para queima");
    }
    
    /**
     * @dev Retorna informações do usuário
     * @param user Endereço do usuário
     */
    function getUserInfo(address user) 
        external 
        view 
        returns (
            bool completed,
            uint256 burnTimestamp,
            uint256 burnAmount,
            string memory quizId
        ) 
    {
        BurnRecord memory record = burnRecords[user];
        return (
            hasCompletedQuiz[user],
            record.timestamp,
            record.amount,
            record.quizId
        );
    }
    
    /**
     * @dev Retorna estatísticas gerais
     */
    function getStats() 
        external 
        view 
        returns (
            uint256 _totalBurned,
            uint256 _totalUsers,
            uint256 _treasuryBalance,
            uint256 _allowance
        ) 
    {
        return (
            totalBurned,
            totalUsers,
            ctdToken.balanceOf(projectTreasury),
            ctdToken.allowance(projectTreasury, address(this))
        );
    }
    
    /**
     * @dev Retorna lista de endereços que fizeram queima
     * @param offset Posição inicial
     * @param limit Quantidade máxima
     */
    function getBurnersList(uint256 offset, uint256 limit) 
        external 
        view 
        returns (address[] memory users, uint256 total) 
    {
        total = burnersList.length;
        
        if (offset >= total) {
            return (new address[](0), total);
        }
        
        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }
        
        address[] memory result = new address[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = burnersList[i];
        }
        
        return (result, total);
    }
    
    // ===== FUNÇÕES ADMINISTRATIVAS =====
    
    /**
     * @dev Pausa/despausa o contrato (apenas owner)
     */
    function togglePause() external onlyOwner {
        if (paused()) {
            _unpause();
        } else {
            _pause();
        }
    }
    
    /**
     * @dev Função de emergência para retirar tokens (apenas owner)
     * @param token Endereço do token
     * @param amount Quantidade
     * @param to Endereço de destino
     */
    function emergencyWithdraw(
        address token, 
        uint256 amount, 
        address to
    ) external onlyOwner {
        require(to != address(0), "Endereco de destino invalido");
        
        if (token == address(0)) {
            // Retirar ETH/BNB
            require(address(this).balance >= amount, "Saldo insuficiente");
            payable(to).transfer(amount);
        } else {
            // Retirar tokens ERC20
            IERC20(token).transfer(to, amount);
        }
        
        emit EmergencyWithdraw(token, amount, to);
    }
    
    /**
     * @dev Permite receber BNB (para pagamento de gas se necessário)
     */
    receive() external payable {}
    
    /**
     * @dev Fallback function
     */
    fallback() external payable {}
}
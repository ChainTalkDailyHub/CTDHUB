// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// Minimal AccessControl (sem OZ), simples para BSC.
/// Se preferir OZ, substitua por OpenZeppelin AccessControl.
contract CTDHUB_BINNOAI {
    address public admin;
    mapping(address => bool) public writer; // IA/backend

    bytes32 public constant NAME_HASH = keccak256("CTDHUB-BINNOAI");

    struct Assessment {
        address user;
        uint64 assessmentDate;       // epoch (s)
        uint32 pillarLevelsPacked;   // 8 * 3 bits (0..4) => 24 bits
        uint16 criPercent;           // 0..100
        uint16 questionnaireVersion; // versão do questionário
        uint8  numQuestions;         // <= 15
        bytes32 contentHash;         // keccak256(JSON canônico)
        string uri;                  // ipfs://... ou https://...
    }

    // id = keccak256(user, contentHash)
    mapping(bytes32 => Assessment) private _assessments;
    mapping(address => bytes32[]) private _byUser;
    mapping(bytes32 => bool) public seenContentHash;

    event WriterSet(address indexed who, bool enabled);
    event AssessmentRecorded(
        bytes32 indexed id,
        address indexed user,
        uint16 criPercent,
        uint16 questionnaireVersion,
        uint8 numQuestions,
        bytes32 contentHash,
        string uri
    );

    modifier onlyAdmin() {
        require(msg.sender == admin, "not admin");
        _;
    }
    modifier onlyWriter() {
        require(writer[msg.sender], "not writer");
        _;
    }

    constructor(address _admin, address _initialWriter) {
        admin = _admin;
        if (_initialWriter != address(0)) {
            writer[_initialWriter] = true;
            emit WriterSet(_initialWriter, true);
        }
    }

    function setWriter(address who, bool enabled) external onlyAdmin {
        writer[who] = enabled;
        emit WriterSet(who, enabled);
    }

    // -------- bitpack --------
    function packPillarLevels(uint8[8] memory levels) public pure returns (uint32 packed) {
        for (uint256 i = 0; i < 8; i++) {
            require(levels[i] <= 4, "level>4");
            packed |= uint32(levels[i] & 0x07) << uint32(i * 3);
        }
    }

    function unpackPillarLevels(uint32 packed) public pure returns (uint8[8] memory levels) {
        for (uint256 i = 0; i < 8; i++) {
            levels[i] = uint8((packed >> (i * 3)) & 0x07);
        }
    }

    // -------- registro --------
    struct AssessmentInput {
        address user;
        uint64 assessmentDate;
        uint16 criPercent;
        uint16 questionnaireVersion;
        uint8 numQuestions;        // off-chain garante <=15; on-chain reforça
        uint8[8] pillarLevels;     // ordem fixa abaixo
        bytes32 contentHash;
        string uri;
    }

    // Ordem dos pilares (fixa):
    // 0: Security, 1: Infra/Scale, 2: Compliance, 3: Tokenomics/Treasury,
    // 4: Product UX/Learning, 5: DevEx, 6: Community/Growth, 7: Governance/Transparency
    function recordAssessment(AssessmentInput calldata a)
        external
        onlyWriter
        returns (bytes32 id)
    {
        require(a.user != address(0), "user=0");
        require(a.criPercent <= 100, "CRI>100");
        require(a.numQuestions <= 15, "max 15 questions");
        require(a.assessmentDate != 0, "date=0");
        require(a.contentHash != bytes32(0), "hash=0");
        require(bytes(a.uri).length > 0, "uri empty");
        require(!seenContentHash[a.contentHash], "duplicate report");

        uint32 packed = packPillarLevels(a.pillarLevels);

        id = keccak256(abi.encodePacked(a.user, a.contentHash));
        Assessment storage s = _assessments[id];
        require(s.assessmentDate == 0, "exists");

        _assessments[id] = Assessment({
            user: a.user,
            assessmentDate: a.assessmentDate,
            pillarLevelsPacked: packed,
            criPercent: a.criPercent,
            questionnaireVersion: a.questionnaireVersion,
            numQuestions: a.numQuestions,
            contentHash: a.contentHash,
            uri: a.uri
        });

        _byUser[a.user].push(id);
        seenContentHash[a.contentHash] = true;

        emit AssessmentRecorded(
            id, a.user, a.criPercent, a.questionnaireVersion,
            a.numQuestions, a.contentHash, a.uri
        );
    }

    // -------- views --------
    function getAssessment(bytes32 id) external view returns (Assessment memory) {
        return _assessments[id];
    }

    function getUserAssessments(address user) external view returns (bytes32[] memory) {
        return _byUser[user];
    }

    function getPillarLevels(bytes32 id) external view returns (uint8[8] memory) {
        Assessment storage s = _assessments[id];
        require(s.assessmentDate != 0, "not found");
        return unpackPillarLevels(s.pillarLevelsPacked);
    }
}
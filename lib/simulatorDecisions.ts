import { SimulationDecision, SimulationStage, ProjectType } from './simulator'

// Web3 Project Launch Simulator - Decision Database
// All focused on BNB/BSC ecosystem excellence

export const SIMULATION_DECISIONS: Record<SimulationStage, SimulationDecision[]> = {
  ideation: [
    {
      id: 'project_focus',
      title: 'Choose Your Project Focus',
      description: 'What type of Web3 project do you want to build on BNB Chain?',
      stage: 'ideation',
      impact_areas: ['technology', 'bnb_integration', 'defi_readiness'],
      options: [
        {
          id: 'defi_native',
          text: 'DeFi Protocol optimized for BNB Chain',
          cost: 0,
          risk_level: 'medium',
          bnb_relevance: 95,
          impact: [
            { area: 'bnb_integration', value: 25, explanation: 'Perfect fit for BNB DeFi ecosystem' },
            { area: 'defi_readiness', value: 30, explanation: 'Built for DeFi from ground up' },
            { area: 'technology', value: 15, explanation: 'Leverages proven DeFi patterns' }
          ]
        },
        {
          id: 'gaming_bnb',
          text: 'GameFi with BNB rewards',
          cost: 0,
          risk_level: 'high',
          bnb_relevance: 80,
          impact: [
            { area: 'community', value: 20, explanation: 'Gaming attracts large communities' },
            { area: 'bnb_integration', value: 15, explanation: 'Uses BNB for in-game economy' },
            { area: 'marketing', value: 25, explanation: 'Gaming has viral potential' }
          ]
        },
        {
          id: 'nft_marketplace',
          text: 'NFT Marketplace on BSC',
          cost: 0,
          risk_level: 'medium',
          bnb_relevance: 70,
          impact: [
            { area: 'bnb_integration', value: 10, explanation: 'Uses BNB for transactions' },
            { area: 'community', value: 15, explanation: 'NFT communities are engaged' },
            { area: 'marketing', value: 20, explanation: 'Visual content is shareable' }
          ]
        },
        {
          id: 'cross_chain',
          text: 'Cross-chain bridge to BNB',
          cost: 0,
          risk_level: 'critical',
          bnb_relevance: 85,
          impact: [
            { area: 'technology', value: 25, explanation: 'Complex technical requirements' },
            { area: 'bnb_integration', value: 20, explanation: 'Brings liquidity to BNB Chain' },
            { area: 'partnerships', value: 15, explanation: 'Requires multiple chain partnerships' }
          ]
        }
      ]
    },
    {
      id: 'team_composition',
      title: 'Build Your Core Team',
      description: 'What type of team structure will you prioritize?',
      stage: 'ideation',
      impact_areas: ['technology', 'community', 'partnerships'],
      options: [
        {
          id: 'bnb_veterans',
          text: 'Hire BNB Chain ecosystem veterans',
          cost: 15,
          risk_level: 'low',
          bnb_relevance: 90,
          impact: [
            { area: 'bnb_integration', value: 20, explanation: 'Deep BNB ecosystem knowledge' },
            { area: 'partnerships', value: 15, explanation: 'Existing BNB network connections' },
            { area: 'technology', value: 10, explanation: 'Knows BNB-specific optimizations' }
          ]
        },
        {
          id: 'balanced_team',
          text: 'Mix of BNB experts and fresh talent',
          cost: 10,
          risk_level: 'medium',
          bnb_relevance: 70,
          impact: [
            { area: 'technology', value: 15, explanation: 'Innovation from fresh perspectives' },
            { area: 'bnb_integration', value: 10, explanation: 'Some BNB ecosystem knowledge' },
            { area: 'community', value: 12, explanation: 'Diverse community appeal' }
          ]
        },
        {
          id: 'cost_effective',
          text: 'Focus on cost-effective remote team',
          cost: 5,
          risk_level: 'high',
          bnb_relevance: 40,
          impact: [
            { area: 'technology', value: 5, explanation: 'May lack specialized knowledge' },
            { area: 'bnb_integration', value: -5, explanation: 'Limited BNB ecosystem experience' },
            { area: 'tokenomics', value: 10, explanation: 'More budget for other areas' }
          ]
        }
      ]
    }
  ],

  development: [
    {
      id: 'smart_contract_approach',
      title: 'Smart Contract Development Strategy',
      description: 'How will you approach smart contract development for BNB Chain?',
      stage: 'development',
      impact_areas: ['technology', 'bnb_integration', 'legal_compliance'],
      options: [
        {
          id: 'bnb_optimized',
          text: 'Use BNB Chain specific optimizations',
          cost: 8,
          risk_level: 'low',
          bnb_relevance: 95,
          impact: [
            { area: 'bnb_integration', value: 25, explanation: 'Maximum BNB Chain efficiency' },
            { area: 'technology', value: 20, explanation: 'Optimized for low gas fees' },
            { area: 'defi_readiness', value: 15, explanation: 'Ready for BNB DeFi protocols' }
          ]
        },
        {
          id: 'standard_solidity',
          text: 'Standard Solidity with BSC compatibility',
          cost: 5,
          risk_level: 'medium',
          bnb_relevance: 60,
          impact: [
            { area: 'technology', value: 10, explanation: 'Reliable but not optimized' },
            { area: 'bnb_integration', value: 5, explanation: 'Basic BSC compatibility' },
            { area: 'partnerships', value: 5, explanation: 'Easier to integrate with others' }
          ]
        },
        {
          id: 'multi_chain',
          text: 'Multi-chain contracts with BNB as primary',
          cost: 15,
          risk_level: 'high',
          bnb_relevance: 75,
          impact: [
            { area: 'technology', value: 15, explanation: 'Complex but flexible architecture' },
            { area: 'bnb_integration', value: 10, explanation: 'BNB as primary chain' },
            { area: 'partnerships', value: 20, explanation: 'Appeals to multi-chain projects' }
          ]
        }
      ]
    },
    {
      id: 'frontend_strategy',
      title: 'User Interface Development',
      description: 'What frontend approach will best serve BNB Chain users?',
      stage: 'development',
      impact_areas: ['community', 'bnb_integration', 'marketing'],
      options: [
        {
          id: 'bnb_native_ui',
          text: 'BNB Chain native UI with MetaMask integration',
          cost: 10,
          risk_level: 'low',
          bnb_relevance: 85,
          impact: [
            { area: 'bnb_integration', value: 20, explanation: 'Seamless BNB Chain experience' },
            { area: 'community', value: 15, explanation: 'Familiar to BNB users' },
            { area: 'marketing', value: 10, explanation: 'Shows BNB Chain commitment' }
          ]
        },
        {
          id: 'mobile_first',
          text: 'Mobile-first with Trust Wallet integration',
          cost: 12,
          risk_level: 'medium',
          bnb_relevance: 90,
          impact: [
            { area: 'community', value: 20, explanation: 'Mobile users are growing segment' },
            { area: 'bnb_integration', value: 15, explanation: 'Trust Wallet is BNB native' },
            { area: 'marketing', value: 15, explanation: 'Mobile apps have viral potential' }
          ]
        },
        {
          id: 'web3_standard',
          text: 'Standard Web3 interface with multiple wallets',
          cost: 8,
          risk_level: 'medium',
          bnb_relevance: 50,
          impact: [
            { area: 'community', value: 10, explanation: 'Appeals to broader Web3 community' },
            { area: 'bnb_integration', value: 0, explanation: 'No specific BNB advantages' },
            { area: 'partnerships', value: 10, explanation: 'Works with all wallets' }
          ]
        }
      ]
    }
  ],

  tokenomics: [
    {
      id: 'token_utility',
      title: 'Token Utility Design',
      description: 'How will your token integrate with the BNB ecosystem?',
      stage: 'tokenomics',
      impact_areas: ['tokenomics', 'bnb_integration', 'defi_readiness'],
      options: [
        {
          id: 'bnb_pair_primary',
          text: 'Primary liquidity pair with BNB',
          cost: 5,
          risk_level: 'low',
          bnb_relevance: 95,
          impact: [
            { area: 'bnb_integration', value: 25, explanation: 'Deep BNB ecosystem integration' },
            { area: 'tokenomics', value: 20, explanation: 'Stable liquidity with BNB' },
            { area: 'defi_readiness', value: 15, explanation: 'Ready for BNB DeFi protocols' }
          ]
        },
        {
          id: 'dual_utility',
          text: 'Dual utility: governance + BNB staking rewards',
          cost: 10,
          risk_level: 'medium',
          bnb_relevance: 85,
          impact: [
            { area: 'tokenomics', value: 25, explanation: 'Multiple value accrual mechanisms' },
            { area: 'bnb_integration', value: 15, explanation: 'BNB rewards create sticky users' },
            { area: 'community', value: 10, explanation: 'Governance increases engagement' }
          ]
        },
        {
          id: 'burn_deflation',
          text: 'Deflationary model with BNB burn mechanism',
          cost: 8,
          risk_level: 'medium',
          bnb_relevance: 80,
          impact: [
            { area: 'tokenomics', value: 20, explanation: 'Deflationary pressure supports price' },
            { area: 'bnb_integration', value: 10, explanation: 'BNB burn creates ecosystem value' },
            { area: 'marketing', value: 15, explanation: 'Burn mechanisms attract attention' }
          ]
        }
      ]
    },
    {
      id: 'distribution_strategy',
      title: 'Token Distribution Strategy',
      description: 'How will you distribute tokens to maximize BNB ecosystem growth?',
      stage: 'tokenomics',
      impact_areas: ['community', 'tokenomics', 'bnb_integration'],
      options: [
        {
          id: 'bnb_holder_airdrop',
          text: 'Airdrop to long-term BNB holders',
          cost: 12,
          risk_level: 'low',
          bnb_relevance: 95,
          impact: [
            { area: 'bnb_integration', value: 25, explanation: 'Rewards BNB ecosystem loyalty' },
            { area: 'community', value: 20, explanation: 'Instant BNB-native community' },
            { area: 'marketing', value: 15, explanation: 'BNB community will promote project' }
          ]
        },
        {
          id: 'liquidity_mining',
          text: 'Liquidity mining for BNB pairs',
          cost: 15,
          risk_level: 'medium',
          bnb_relevance: 85,
          impact: [
            { area: 'tokenomics', value: 20, explanation: 'Deep liquidity from day one' },
            { area: 'bnb_integration', value: 15, explanation: 'Strengthens BNB pair liquidity' },
            { area: 'defi_readiness', value: 20, explanation: 'Ready for DeFi integrations' }
          ]
        },
        {
          id: 'ido_launchpad',
          text: 'IDO on BNB Chain launchpads',
          cost: 8,
          risk_level: 'medium',
          bnb_relevance: 75,
          impact: [
            { area: 'community', value: 15, explanation: 'Launchpad communities are engaged' },
            { area: 'bnb_integration', value: 10, explanation: 'Launched within BNB ecosystem' },
            { area: 'marketing', value: 20, explanation: 'Launchpads provide marketing' }
          ]
        }
      ]
    }
  ],

  community_building: [
    {
      id: 'community_platform',
      title: 'Community Building Strategy',
      description: 'Where will you build your community within the BNB ecosystem?',
      stage: 'community_building',
      impact_areas: ['community', 'marketing', 'bnb_integration'],
      options: [
        {
          id: 'bnb_telegram',
          text: 'Focus on BNB Chain Telegram communities',
          cost: 5,
          risk_level: 'low',
          bnb_relevance: 90,
          impact: [
            { area: 'community', value: 20, explanation: 'BNB users are highly active on Telegram' },
            { area: 'bnb_integration', value: 15, explanation: 'Deep integration with BNB community' },
            { area: 'marketing', value: 10, explanation: 'Word-of-mouth in BNB ecosystem' }
          ]
        },
        {
          id: 'multi_platform',
          text: 'Multi-platform with BNB Chain emphasis',
          cost: 12,
          risk_level: 'medium',
          bnb_relevance: 70,
          impact: [
            { area: 'community', value: 25, explanation: 'Reaches diverse audiences' },
            { area: 'marketing', value: 20, explanation: 'Multiple touchpoints for users' },
            { area: 'bnb_integration', value: 5, explanation: 'Some BNB ecosystem focus' }
          ]
        },
        {
          id: 'bnb_events',
          text: 'BNB Chain conferences and meetups',
          cost: 20,
          risk_level: 'medium',
          bnb_relevance: 95,
          impact: [
            { area: 'bnb_integration', value: 25, explanation: 'Deep BNB ecosystem connections' },
            { area: 'partnerships', value: 20, explanation: 'Meet potential partners' },
            { area: 'community', value: 15, explanation: 'High-quality BNB community members' }
          ]
        }
      ]
    },
    {
      id: 'incentive_program',
      title: 'Community Incentive Program',
      description: 'How will you incentivize community growth using BNB?',
      stage: 'community_building',
      impact_areas: ['community', 'bnb_integration', 'tokenomics'],
      options: [
        {
          id: 'bnb_rewards',
          text: 'Direct BNB rewards for community actions',
          cost: 15,
          risk_level: 'low',
          bnb_relevance: 95,
          impact: [
            { area: 'bnb_integration', value: 25, explanation: 'Direct BNB utility in ecosystem' },
            { area: 'community', value: 20, explanation: 'BNB rewards are highly valued' },
            { area: 'marketing', value: 15, explanation: 'BNB rewards attract attention' }
          ]
        },
        {
          id: 'nft_badges',
          text: 'BNB Chain NFT badges for achievements',
          cost: 10,
          risk_level: 'medium',
          bnb_relevance: 80,
          impact: [
            { area: 'community', value: 18, explanation: 'NFT achievements drive engagement' },
            { area: 'bnb_integration', value: 12, explanation: 'NFTs on BNB Chain' },
            { area: 'marketing', value: 20, explanation: 'NFT achievements are shareable' }
          ]
        },
        {
          id: 'staking_tiers',
          text: 'BNB staking tiers for exclusive access',
          cost: 8,
          risk_level: 'medium',
          bnb_relevance: 85,
          impact: [
            { area: 'bnb_integration', value: 20, explanation: 'Encourages BNB holding' },
            { area: 'community', value: 15, explanation: 'Creates exclusive community tiers' },
            { area: 'tokenomics', value: 10, explanation: 'Reduces circulating BNB supply' }
          ]
        }
      ]
    }
  ],

  partnerships: [
    {
      id: 'strategic_partnerships',
      title: 'Strategic Partnership Focus',
      description: 'Which partnerships will strengthen your position in the BNB ecosystem?',
      stage: 'partnerships',
      impact_areas: ['partnerships', 'bnb_integration', 'technology'],
      options: [
        {
          id: 'binance_labs',
          text: 'Pursue Binance Labs investment and support',
          cost: 5,
          risk_level: 'low',
          bnb_relevance: 100,
          impact: [
            { area: 'bnb_integration', value: 30, explanation: 'Ultimate BNB ecosystem validation' },
            { area: 'partnerships', value: 25, explanation: 'Opens doors to all BNB partners' },
            { area: 'marketing', value: 20, explanation: 'Binance Labs backing is huge marketing' }
          ]
        },
        {
          id: 'defi_protocols',
          text: 'Partner with top BNB DeFi protocols',
          cost: 10,
          risk_level: 'medium',
          bnb_relevance: 90,
          impact: [
            { area: 'defi_readiness', value: 25, explanation: 'Deep DeFi integration capabilities' },
            { area: 'bnb_integration', value: 20, explanation: 'Core BNB DeFi ecosystem member' },
            { area: 'partnerships', value: 15, explanation: 'Multiple strategic DeFi partnerships' }
          ]
        },
        {
          id: 'cex_listings',
          text: 'Focus on Binance and BNB-friendly exchanges',
          cost: 25,
          risk_level: 'medium',
          bnb_relevance: 85,
          impact: [
            { area: 'marketing', value: 25, explanation: 'Exchange listings drive awareness' },
            { area: 'bnb_integration', value: 15, explanation: 'BNB trading pairs increase utility' },
            { area: 'community', value: 20, explanation: 'Exchange users become community members' }
          ]
        }
      ]
    },
    {
      id: 'integration_strategy',
      title: 'Technical Integration Strategy',
      description: 'How will you technically integrate with the BNB ecosystem?',
      stage: 'partnerships',
      impact_areas: ['technology', 'bnb_integration', 'defi_readiness'],
      options: [
        {
          id: 'pancakeswap_native',
          text: 'Native PancakeSwap integration',
          cost: 8,
          risk_level: 'low',
          bnb_relevance: 95,
          impact: [
            { area: 'bnb_integration', value: 25, explanation: 'Core BNB DeFi infrastructure' },
            { area: 'defi_readiness', value: 20, explanation: 'Instant DeFi protocol access' },
            { area: 'technology', value: 15, explanation: 'Proven DEX integration patterns' }
          ]
        },
        {
          id: 'venus_collateral',
          text: 'Become collateral asset on Venus Protocol',
          cost: 15,
          risk_level: 'medium',
          bnb_relevance: 90,
          impact: [
            { area: 'defi_readiness', value: 25, explanation: 'Lending protocol utility' },
            { area: 'bnb_integration', value: 20, explanation: 'Deep BNB DeFi ecosystem integration' },
            { area: 'tokenomics', value: 15, explanation: 'Additional token utility and demand' }
          ]
        },
        {
          id: 'bsc_validators',
          text: 'Partnership with BSC validator nodes',
          cost: 20,
          risk_level: 'high',
          bnb_relevance: 85,
          impact: [
            { area: 'technology', value: 25, explanation: 'Enhanced security and performance' },
            { area: 'bnb_integration', value: 20, explanation: 'Infrastructure-level BNB integration' },
            { area: 'partnerships', value: 15, explanation: 'Strategic infrastructure partnerships' }
          ]
        }
      ]
    }
  ],

  pre_launch: [
    {
      id: 'marketing_campaign',
      title: 'Pre-Launch Marketing Strategy',
      description: 'How will you market your project to the BNB community?',
      stage: 'pre_launch',
      impact_areas: ['marketing', 'community', 'bnb_integration'],
      options: [
        {
          id: 'bnb_influencers',
          text: 'Partner with BNB Chain influencers and KOLs',
          cost: 20,
          risk_level: 'medium',
          bnb_relevance: 95,
          impact: [
            { area: 'marketing', value: 25, explanation: 'BNB influencers have loyal audiences' },
            { area: 'bnb_integration', value: 15, explanation: 'Reinforces BNB ecosystem positioning' },
            { area: 'community', value: 20, explanation: 'Influencer audiences become community' }
          ]
        },
        {
          id: 'binance_announcement',
          text: 'Coordinate announcement with Binance channels',
          cost: 10,
          risk_level: 'low',
          bnb_relevance: 100,
          impact: [
            { area: 'marketing', value: 30, explanation: 'Binance announcement = maximum exposure' },
            { area: 'bnb_integration', value: 25, explanation: 'Official BNB ecosystem endorsement' },
            { area: 'community', value: 25, explanation: 'Binance community is massive' }
          ]
        },
        {
          id: 'cross_platform',
          text: 'Cross-platform campaign with BNB Chain focus',
          cost: 25,
          risk_level: 'medium',
          bnb_relevance: 70,
          impact: [
            { area: 'marketing', value: 20, explanation: 'Broad reach across platforms' },
            { area: 'community', value: 15, explanation: 'Diverse community from multiple sources' },
            { area: 'bnb_integration', value: 10, explanation: 'Some BNB ecosystem emphasis' }
          ]
        }
      ]
    },
    {
      id: 'security_audit',
      title: 'Security Audit Strategy',
      description: 'How will you ensure security for your BNB Chain project?',
      stage: 'pre_launch',
      impact_areas: ['technology', 'legal_compliance', 'community'],
      options: [
        {
          id: 'certik_audit',
          text: 'CertiK audit (BNB ecosystem preferred)',
          cost: 30,
          risk_level: 'low',
          bnb_relevance: 95,
          impact: [
            { area: 'technology', value: 25, explanation: 'CertiK is gold standard for BNB projects' },
            { area: 'bnb_integration', value: 15, explanation: 'CertiK badge trusted by BNB community' },
            { area: 'community', value: 20, explanation: 'Users trust CertiK-audited projects' }
          ]
        },
        {
          id: 'multiple_audits',
          text: 'Multiple audits including BNB-focused firms',
          cost: 50,
          risk_level: 'low',
          bnb_relevance: 85,
          impact: [
            { area: 'technology', value: 30, explanation: 'Multiple audits = maximum security' },
            { area: 'legal_compliance', value: 20, explanation: 'Comprehensive security compliance' },
            { area: 'marketing', value: 15, explanation: 'Multiple audit badges for marketing' }
          ]
        },
        {
          id: 'community_audit',
          text: 'Community audit with BNB developer feedback',
          cost: 10,
          risk_level: 'high',
          bnb_relevance: 80,
          impact: [
            { area: 'community', value: 20, explanation: 'Community involvement in security' },
            { area: 'bnb_integration', value: 10, explanation: 'BNB developer community engagement' },
            { area: 'technology', value: 5, explanation: 'Community review has limitations' }
          ]
        }
      ]
    }
  ],

  launch: [
    {
      id: 'launch_strategy',
      title: 'Launch Execution Strategy',
      description: 'How will you execute your launch on BNB Chain?',
      stage: 'launch',
      impact_areas: ['marketing', 'bnb_integration', 'community'],
      options: [
        {
          id: 'pancakeswap_ilo',
          text: 'PancakeSwap ILO (Initial Liquidity Offering)',
          cost: 15,
          risk_level: 'low',
          bnb_relevance: 95,
          impact: [
            { area: 'bnb_integration', value: 25, explanation: 'Native PancakeSwap launch = BNB ecosystem' },
            { area: 'defi_readiness', value: 20, explanation: 'Instant DeFi liquidity' },
            { area: 'marketing', value: 15, explanation: 'PancakeSwap has built-in audience' }
          ]
        },
        {
          id: 'binance_launchpad',
          text: 'Binance Launchpad (if selected)',
          cost: 5,
          risk_level: 'low',
          bnb_relevance: 100,
          impact: [
            { area: 'marketing', value: 30, explanation: 'Binance Launchpad = ultimate exposure' },
            { area: 'bnb_integration', value: 30, explanation: 'Official Binance ecosystem launch' },
            { area: 'community', value: 25, explanation: 'Instant access to Binance users' }
          ]
        },
        {
          id: 'multi_dex_launch',
          text: 'Simultaneous launch on multiple BNB DEXs',
          cost: 25,
          risk_level: 'medium',
          bnb_relevance: 85,
          impact: [
            { area: 'defi_readiness', value: 25, explanation: 'Maximum DeFi protocol integration' },
            { area: 'bnb_integration', value: 15, explanation: 'Distributed across BNB DeFi ecosystem' },
            { area: 'marketing', value: 20, explanation: 'Multiple launch announcements' }
          ]
        }
      ]
    },
    {
      id: 'liquidity_strategy',
      title: 'Initial Liquidity Strategy',
      description: 'How will you bootstrap liquidity on BNB Chain?',
      stage: 'launch',
      impact_areas: ['tokenomics', 'bnb_integration', 'defi_readiness'],
      options: [
        {
          id: 'bnb_pair_focus',
          text: 'Deep BNB pair liquidity with rewards',
          cost: 20,
          risk_level: 'low',
          bnb_relevance: 95,
          impact: [
            { area: 'bnb_integration', value: 25, explanation: 'Deep BNB pair creates ecosystem value' },
            { area: 'tokenomics', value: 20, explanation: 'Stable liquidity foundation' },
            { area: 'defi_readiness', value: 15, explanation: 'Ready for all BNB DeFi protocols' }
          ]
        },
        {
          id: 'stable_pairs',
          text: 'Multiple stablecoin pairs + BNB',
          cost: 30,
          risk_level: 'medium',
          bnb_relevance: 75,
          impact: [
            { area: 'tokenomics', value: 25, explanation: 'Diverse liquidity reduces volatility' },
            { area: 'defi_readiness', value: 20, explanation: 'Multiple DeFi entry points' },
            { area: 'bnb_integration', value: 10, explanation: 'BNB is one of several pairs' }
          ]
        },
        {
          id: 'liquidity_mining',
          text: 'BNB-focused liquidity mining program',
          cost: 35,
          risk_level: 'medium',
          bnb_relevance: 90,
          impact: [
            { area: 'bnb_integration', value: 20, explanation: 'Incentivizes BNB pair liquidity' },
            { area: 'community', value: 20, explanation: 'LM attracts DeFi community' },
            { area: 'tokenomics', value: 15, explanation: 'Token emissions for liquidity' }
          ]
        }
      ]
    }
  ],

  post_launch: [
    {
      id: 'ecosystem_expansion',
      title: 'Post-Launch Ecosystem Expansion',
      description: 'How will you expand within the BNB ecosystem after launch?',
      stage: 'post_launch',
      impact_areas: ['partnerships', 'bnb_integration', 'defi_readiness'],
      options: [
        {
          id: 'bnb_grants',
          text: 'Apply for BNB Chain ecosystem grants',
          cost: 10,
          risk_level: 'low',
          bnb_relevance: 95,
          impact: [
            { area: 'bnb_integration', value: 20, explanation: 'Official BNB ecosystem recognition' },
            { area: 'partnerships', value: 15, explanation: 'Grant connects to BNB partners' },
            { area: 'technology', value: 10, explanation: 'Funding for BNB-specific development' }
          ]
        },
        {
          id: 'defi_integrations',
          text: 'Integrate with major BNB DeFi protocols',
          cost: 20,
          risk_level: 'medium',
          bnb_relevance: 90,
          impact: [
            { area: 'defi_readiness', value: 25, explanation: 'Full DeFi ecosystem participation' },
            { area: 'bnb_integration', value: 20, explanation: 'Core BNB DeFi infrastructure' },
            { area: 'tokenomics', value: 15, explanation: 'Multiple token utility vectors' }
          ]
        },
        {
          id: 'cross_chain_expansion',
          text: 'Expand to other chains while keeping BNB primary',
          cost: 40,
          risk_level: 'high',
          bnb_relevance: 70,
          impact: [
            { area: 'technology', value: 20, explanation: 'Multi-chain technical capabilities' },
            { area: 'partnerships', value: 25, explanation: 'Cross-chain partnership opportunities' },
            { area: 'bnb_integration', value: 5, explanation: 'BNB remains primary but diluted focus' }
          ]
        }
      ]
    },
    {
      id: 'governance_transition',
      title: 'Governance Transition Strategy',
      description: 'How will you transition to community governance?',
      stage: 'post_launch',
      impact_areas: ['community', 'legal_compliance', 'tokenomics'],
      options: [
        {
          id: 'bnb_weighted_voting',
          text: 'BNB stake-weighted governance voting',
          cost: 15,
          risk_level: 'medium',
          bnb_relevance: 90,
          impact: [
            { area: 'bnb_integration', value: 20, explanation: 'BNB holders control governance' },
            { area: 'community', value: 15, explanation: 'Engaged BNB community governance' },
            { area: 'tokenomics', value: 10, explanation: 'BNB staking creates utility' }
          ]
        },
        {
          id: 'dao_framework',
          text: 'Full DAO with BNB treasury management',
          cost: 25,
          risk_level: 'high',
          bnb_relevance: 85,
          impact: [
            { area: 'community', value: 25, explanation: 'Full community ownership' },
            { area: 'legal_compliance', value: 15, explanation: 'DAO structure provides compliance' },
            { area: 'bnb_integration', value: 15, explanation: 'BNB-managed treasury' }
          ]
        },
        {
          id: 'hybrid_governance',
          text: 'Hybrid team + community governance',
          cost: 10,
          risk_level: 'low',
          bnb_relevance: 75,
          impact: [
            { area: 'community', value: 15, explanation: 'Balanced governance approach' },
            { area: 'technology', value: 10, explanation: 'Team maintains technical control' },
            { area: 'legal_compliance', value: 20, explanation: 'Reduced regulatory risk' }
          ]
        }
      ]
    }
  ]
}

// Project type specific decision modifiers
export const PROJECT_TYPE_MODIFIERS: Record<ProjectType, { 
  preferredDecisions: string[]
  bnbIntegrationBonus: number 
}> = {
  defi_protocol: {
    preferredDecisions: ['defi_native', 'bnb_optimized', 'pancakeswap_native', 'venus_collateral'],
    bnbIntegrationBonus: 15
  },
  gaming_dapp: {
    preferredDecisions: ['gaming_bnb', 'mobile_first', 'bnb_rewards', 'nft_badges'],
    bnbIntegrationBonus: 10
  },
  nft_marketplace: {
    preferredDecisions: ['nft_marketplace', 'mobile_first', 'nft_badges', 'binance_announcement'],
    bnbIntegrationBonus: 8
  },
  dao_governance: {
    preferredDecisions: ['balanced_team', 'dual_utility', 'bnb_weighted_voting', 'dao_framework'],
    bnbIntegrationBonus: 12
  },
  yield_farming: {
    preferredDecisions: ['defi_native', 'bnb_pair_primary', 'liquidity_mining', 'defi_integrations'],
    bnbIntegrationBonus: 18
  },
  cross_chain_bridge: {
    preferredDecisions: ['cross_chain', 'multi_chain', 'bsc_validators', 'cross_chain_expansion'],
    bnbIntegrationBonus: 20
  },
  metaverse_platform: {
    preferredDecisions: ['gaming_bnb', 'mobile_first', 'bnb_rewards', 'multi_platform'],
    bnbIntegrationBonus: 7
  },
  social_token: {
    preferredDecisions: ['balanced_team', 'bnb_holder_airdrop', 'bnb_telegram', 'bnb_influencers'],
    bnbIntegrationBonus: 5
  }
}

// Helper function to get relevant decisions for current stage
export function getStageDecisions(stage: SimulationStage): SimulationDecision[] {
  return SIMULATION_DECISIONS[stage] || []
}

// Helper function to get next stage
export function getNextStage(currentStage: SimulationStage): SimulationStage | null {
  const stages: SimulationStage[] = [
    'ideation', 'development', 'tokenomics', 'community_building', 
    'partnerships', 'pre_launch', 'launch', 'post_launch'
  ]
  
  const currentIndex = stages.indexOf(currentStage)
  if (currentIndex === -1 || currentIndex === stages.length - 1) {
    return null
  }
  
  return stages[currentIndex + 1]
}

// Helper function to check if project type benefits from specific decision
export function getProjectTypeBonus(
  projectType: ProjectType, 
  decisionId: string
): number {
  const modifiers = PROJECT_TYPE_MODIFIERS[projectType]
  if (modifiers.preferredDecisions.includes(decisionId)) {
    return modifiers.bnbIntegrationBonus
  }
  return 0
}
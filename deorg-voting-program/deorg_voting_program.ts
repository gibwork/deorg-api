/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/deorg_voting_program.json`.
 */
export type DeorgVotingProgram = {
  "address": "EGnx6SNyQkF2rxXc2uGwVVkZUMoFVfGQWNe18jzapx2h",
  "metadata": {
    "name": "deorgVotingProgram",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "completeTask",
      "discriminator": [
        109,
        167,
        192,
        41,
        129,
        108,
        220,
        196
      ],
      "accounts": [
        {
          "name": "assignee",
          "writable": true,
          "signer": true
        },
        {
          "name": "project"
        },
        {
          "name": "task",
          "writable": true
        },
        {
          "name": "taskVault",
          "writable": true
        },
        {
          "name": "assigneeTokenAccount"
        },
        {
          "name": "vaultTokenAccount"
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "task"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "createOrganization",
      "discriminator": [
        60,
        173,
        177,
        39,
        122,
        23,
        68,
        185
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "organization",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  111,
                  114,
                  103,
                  97,
                  110,
                  105,
                  122,
                  97,
                  116,
                  105,
                  111,
                  110
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              },
              {
                "kind": "arg",
                "path": "organizationUuid"
              }
            ]
          }
        },
        {
          "name": "creatorContributor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "creatorTokenAccount"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "organizationUuid",
          "type": {
            "array": [
              "u8",
              16
            ]
          }
        },
        {
          "name": "organizationName",
          "type": "string"
        },
        {
          "name": "contributorProposalThreshold",
          "type": "u8"
        },
        {
          "name": "contributorProposalValidityPeriod",
          "type": "i64"
        },
        {
          "name": "contributorValidityPeriod",
          "type": "i64"
        },
        {
          "name": "contributorProposalQuorumPercentage",
          "type": "u8"
        },
        {
          "name": "projectProposalThreshold",
          "type": "u8"
        },
        {
          "name": "projectProposalValidityPeriod",
          "type": "i64"
        },
        {
          "name": "minimumTokenRequirement",
          "type": "u64"
        },
        {
          "name": "treasuryTransferThresholdPercentage",
          "type": "u8"
        },
        {
          "name": "treasuryTransferProposalValidityPeriod",
          "type": "i64"
        },
        {
          "name": "treasuryTransferQuorumPercentage",
          "type": "u8"
        },
        {
          "name": "creatorRate",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createProject",
      "discriminator": [
        148,
        219,
        181,
        42,
        221,
        114,
        145,
        190
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "organization"
        },
        {
          "name": "proposal"
        },
        {
          "name": "project",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              },
              {
                "kind": "arg",
                "path": "projectUuid"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "projectUuid",
          "type": {
            "array": [
              "u8",
              16
            ]
          }
        }
      ]
    },
    {
      "name": "depositToTreasury",
      "discriminator": [
        10,
        195,
        112,
        242,
        107,
        206,
        240,
        198
      ],
      "accounts": [
        {
          "name": "depositor",
          "writable": true,
          "signer": true
        },
        {
          "name": "organization"
        },
        {
          "name": "tokenRegistry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              }
            ]
          }
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "treasuryAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              }
            ]
          }
        },
        {
          "name": "depositorTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "enableTaskVaultWithdrawal",
      "discriminator": [
        203,
        147,
        161,
        208,
        2,
        107,
        168,
        0
      ],
      "accounts": [
        {
          "name": "reviewer",
          "writable": true,
          "signer": true
        },
        {
          "name": "project"
        },
        {
          "name": "task",
          "writable": true
        },
        {
          "name": "taskVault",
          "writable": true
        },
        {
          "name": "assigneeTokenAccount",
          "writable": true
        },
        {
          "name": "vaultTokenAccount",
          "writable": true
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "task"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "executeFundsTransfer",
      "discriminator": [
        92,
        201,
        184,
        148,
        233,
        144,
        85,
        109
      ],
      "accounts": [
        {
          "name": "executor",
          "writable": true,
          "signer": true
        },
        {
          "name": "organization"
        },
        {
          "name": "proposal",
          "writable": true
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "treasuryAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              }
            ]
          }
        },
        {
          "name": "destinationTokenAccount",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "initializeOrganizationMetadata",
      "discriminator": [
        81,
        190,
        223,
        147,
        142,
        1,
        30,
        77
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "organization"
        },
        {
          "name": "metadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "logoUrl",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "websiteUrl",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "twitterUrl",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "discordUrl",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "telegramUrl",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "description",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "initializeTreasuryRegistry",
      "discriminator": [
        4,
        25,
        79,
        4,
        119,
        210,
        129,
        78
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "organization"
        },
        {
          "name": "tokenRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "proposeContributor",
      "discriminator": [
        115,
        219,
        17,
        2,
        166,
        242,
        26,
        246
      ],
      "accounts": [
        {
          "name": "proposer",
          "writable": true,
          "signer": true
        },
        {
          "name": "organization",
          "writable": true
        },
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  111,
                  114,
                  95,
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              },
              {
                "kind": "account",
                "path": "candidate"
              },
              {
                "kind": "arg",
                "path": "timestamp"
              }
            ]
          }
        },
        {
          "name": "candidate"
        },
        {
          "name": "contributor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              },
              {
                "kind": "account",
                "path": "candidate"
              }
            ]
          }
        },
        {
          "name": "proposerTokenAccount"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "proposedRate",
          "type": "u64"
        },
        {
          "name": "timestamp",
          "type": "i64"
        }
      ]
    },
    {
      "name": "proposeFundsTransfer",
      "discriminator": [
        62,
        64,
        99,
        52,
        232,
        221,
        154,
        169
      ],
      "accounts": [
        {
          "name": "proposer",
          "writable": true,
          "signer": true
        },
        {
          "name": "organization",
          "writable": true
        },
        {
          "name": "tokenRegistry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              }
            ]
          }
        },
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  116,
                  114,
                  97,
                  110,
                  115,
                  102,
                  101,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              },
              {
                "kind": "arg",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "amount"
              },
              {
                "kind": "account",
                "path": "proposer"
              },
              {
                "kind": "arg",
                "path": "nonce"
              }
            ]
          }
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "treasuryAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              }
            ]
          }
        },
        {
          "name": "destinationTokenAccount"
        },
        {
          "name": "proposerTokenAccount"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "tokenMint",
          "type": "pubkey"
        },
        {
          "name": "nonce",
          "type": "u64"
        }
      ]
    },
    {
      "name": "proposeProject",
      "discriminator": [
        151,
        73,
        101,
        5,
        57,
        51,
        143,
        49
      ],
      "accounts": [
        {
          "name": "proposer",
          "writable": true,
          "signer": true
        },
        {
          "name": "organization"
        },
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  106,
                  101,
                  99,
                  116,
                  95,
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              },
              {
                "kind": "arg",
                "path": "title"
              }
            ]
          }
        },
        {
          "name": "proposerTokenAccount"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "memberPubkeys",
          "type": {
            "vec": "pubkey"
          }
        },
        {
          "name": "taskApprovalThreshold",
          "type": "u8"
        },
        {
          "name": "validityPeriod",
          "type": "i64"
        }
      ]
    },
    {
      "name": "proposeTask",
      "discriminator": [
        245,
        15,
        241,
        192,
        72,
        128,
        60,
        37
      ],
      "accounts": [
        {
          "name": "proposer",
          "writable": true,
          "signer": true
        },
        {
          "name": "organization"
        },
        {
          "name": "project"
        },
        {
          "name": "proposal",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107,
                  95,
                  112,
                  114,
                  111,
                  112,
                  111,
                  115,
                  97,
                  108
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              },
              {
                "kind": "account",
                "path": "project"
              },
              {
                "kind": "arg",
                "path": "title"
              }
            ]
          }
        },
        {
          "name": "tokenRegistry",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              }
            ]
          }
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "treasuryAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              }
            ]
          }
        },
        {
          "name": "destinationTokenAccount"
        },
        {
          "name": "proposerTokenAccount"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "title",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "paymentAmount",
          "type": "u64"
        },
        {
          "name": "assignee",
          "type": "pubkey"
        },
        {
          "name": "tokenMint",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "registerTreasuryToken",
      "discriminator": [
        95,
        243,
        188,
        15,
        218,
        39,
        171,
        207
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "organization"
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "treasuryAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              }
            ]
          }
        },
        {
          "name": "tokenRegistry",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  114,
                  101,
                  103,
                  105,
                  115,
                  116,
                  114,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "renewContributor",
      "discriminator": [
        27,
        21,
        241,
        167,
        180,
        87,
        158,
        76
      ],
      "accounts": [
        {
          "name": "authority",
          "writable": true,
          "signer": true
        },
        {
          "name": "organization"
        },
        {
          "name": "contributor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              },
              {
                "kind": "account",
                "path": "authority"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "updateOrganizationMetadata",
      "discriminator": [
        178,
        199,
        6,
        33,
        27,
        199,
        95,
        69
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "organization"
        },
        {
          "name": "metadata",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  109,
                  101,
                  116,
                  97,
                  100,
                  97,
                  116,
                  97
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "logoUrl",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "websiteUrl",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "twitterUrl",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "discordUrl",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "telegramUrl",
          "type": {
            "option": "string"
          }
        },
        {
          "name": "description",
          "type": {
            "option": "string"
          }
        }
      ]
    },
    {
      "name": "updateOrganizationParameters",
      "discriminator": [
        176,
        163,
        252,
        152,
        116,
        181,
        215,
        93
      ],
      "accounts": [
        {
          "name": "organization",
          "writable": true
        },
        {
          "name": "creator",
          "signer": true
        }
      ],
      "args": [
        {
          "name": "organizationName",
          "type": "string"
        },
        {
          "name": "contributorProposalThreshold",
          "type": "u8"
        },
        {
          "name": "contributorProposalValidityPeriod",
          "type": "i64"
        },
        {
          "name": "contributorValidityPeriod",
          "type": "i64"
        },
        {
          "name": "contributorProposalQuorumPercentage",
          "type": "u8"
        },
        {
          "name": "projectProposalThreshold",
          "type": "u8"
        },
        {
          "name": "projectProposalValidityPeriod",
          "type": "i64"
        },
        {
          "name": "minimumTokenRequirement",
          "type": "u64"
        },
        {
          "name": "treasuryTransferThresholdPercentage",
          "type": "u8"
        },
        {
          "name": "treasuryTransferProposalValidityPeriod",
          "type": "i64"
        },
        {
          "name": "treasuryTransferQuorumPercentage",
          "type": "u8"
        }
      ]
    },
    {
      "name": "voteOnContributorProposal",
      "discriminator": [
        103,
        215,
        229,
        85,
        252,
        164,
        113,
        142
      ],
      "accounts": [
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "organization",
          "writable": true
        },
        {
          "name": "proposal",
          "writable": true
        },
        {
          "name": "contributor",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  111,
                  110,
                  116,
                  114,
                  105,
                  98,
                  117,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              },
              {
                "kind": "account",
                "path": "proposal.candidate",
                "account": "contributorProposal"
              }
            ]
          }
        },
        {
          "name": "voterTokenAccount"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vote",
          "type": "bool"
        }
      ]
    },
    {
      "name": "voteOnFundsTransferProposal",
      "discriminator": [
        25,
        248,
        122,
        152,
        76,
        18,
        48,
        15
      ],
      "accounts": [
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "organization",
          "writable": true
        },
        {
          "name": "proposal",
          "writable": true
        },
        {
          "name": "linkedTask",
          "writable": true,
          "optional": true
        },
        {
          "name": "project",
          "optional": true
        },
        {
          "name": "voterTokenAccount"
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "treasuryAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              }
            ]
          }
        },
        {
          "name": "destinationTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "taskVault",
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "linkedTask"
              }
            ]
          }
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "optional": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "linkedTask"
              }
            ]
          }
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "linkedTask"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vote",
          "type": "bool"
        }
      ]
    },
    {
      "name": "voteOnProjectProposal",
      "discriminator": [
        106,
        87,
        130,
        253,
        215,
        99,
        195,
        123
      ],
      "accounts": [
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "organization"
        },
        {
          "name": "proposal",
          "writable": true
        },
        {
          "name": "voterTokenAccount"
        },
        {
          "name": "project",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vote",
          "type": "bool"
        }
      ]
    },
    {
      "name": "voteOnTaskProposal",
      "discriminator": [
        164,
        149,
        183,
        34,
        84,
        171,
        188,
        228
      ],
      "accounts": [
        {
          "name": "voter",
          "writable": true,
          "signer": true
        },
        {
          "name": "organization"
        },
        {
          "name": "project"
        },
        {
          "name": "proposal",
          "writable": true
        },
        {
          "name": "voterTokenAccount"
        },
        {
          "name": "treasuryTokenAccount",
          "writable": true
        },
        {
          "name": "treasuryAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  114,
                  101,
                  97,
                  115,
                  117,
                  114,
                  121,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "organization"
              }
            ]
          }
        },
        {
          "name": "destinationTokenAccount",
          "writable": true
        },
        {
          "name": "task",
          "writable": true
        },
        {
          "name": "taskVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  97,
                  115,
                  107,
                  95,
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "task"
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "vaultTokenAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  97,
                  99,
                  99,
                  111,
                  117,
                  110,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "task"
              }
            ]
          }
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ]
              },
              {
                "kind": "account",
                "path": "task"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "vote",
          "type": "bool"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "contributor",
      "discriminator": [
        222,
        222,
        255,
        212,
        133,
        49,
        27,
        93
      ]
    },
    {
      "name": "contributorProposal",
      "discriminator": [
        105,
        174,
        63,
        121,
        130,
        211,
        212,
        24
      ]
    },
    {
      "name": "organization",
      "discriminator": [
        145,
        38,
        152,
        251,
        91,
        57,
        118,
        160
      ]
    },
    {
      "name": "organizationMetadata",
      "discriminator": [
        1,
        31,
        0,
        180,
        128,
        204,
        22,
        7
      ]
    },
    {
      "name": "project",
      "discriminator": [
        205,
        168,
        189,
        202,
        181,
        247,
        142,
        19
      ]
    },
    {
      "name": "projectProposal",
      "discriminator": [
        238,
        138,
        195,
        133,
        237,
        154,
        92,
        125
      ]
    },
    {
      "name": "task",
      "discriminator": [
        79,
        34,
        229,
        55,
        88,
        90,
        55,
        84
      ]
    },
    {
      "name": "taskProposal",
      "discriminator": [
        78,
        34,
        31,
        107,
        240,
        206,
        119,
        26
      ]
    },
    {
      "name": "taskVault",
      "discriminator": [
        124,
        9,
        240,
        12,
        233,
        41,
        64,
        133
      ]
    },
    {
      "name": "treasuryTokenRegistry",
      "discriminator": [
        193,
        105,
        245,
        232,
        239,
        167,
        104,
        138
      ]
    },
    {
      "name": "treasuryTransferProposal",
      "discriminator": [
        182,
        216,
        124,
        142,
        204,
        168,
        111,
        130
      ]
    }
  ],
  "events": [
    {
      "name": "contributorProposalEvent",
      "discriminator": [
        163,
        103,
        5,
        85,
        73,
        132,
        231,
        179
      ]
    },
    {
      "name": "projectCreatedEvent",
      "discriminator": [
        211,
        119,
        21,
        209,
        113,
        178,
        141,
        38
      ]
    },
    {
      "name": "projectProposalEvent",
      "discriminator": [
        59,
        11,
        67,
        179,
        7,
        70,
        160,
        186
      ]
    },
    {
      "name": "projectReadyEvent",
      "discriminator": [
        31,
        76,
        197,
        182,
        37,
        117,
        100,
        188
      ]
    },
    {
      "name": "taskCompletedEvent",
      "discriminator": [
        8,
        139,
        204,
        225,
        74,
        89,
        212,
        253
      ]
    },
    {
      "name": "taskCreatedFromProposalEvent",
      "discriminator": [
        149,
        1,
        74,
        195,
        101,
        102,
        225,
        25
      ]
    },
    {
      "name": "taskEvent",
      "discriminator": [
        30,
        194,
        51,
        221,
        107,
        122,
        192,
        141
      ]
    },
    {
      "name": "taskPaymentEvent",
      "discriminator": [
        114,
        107,
        151,
        191,
        73,
        103,
        96,
        165
      ]
    },
    {
      "name": "taskProposalEvent",
      "discriminator": [
        38,
        211,
        82,
        245,
        116,
        4,
        251,
        93
      ]
    },
    {
      "name": "taskProposalVoteEvent",
      "discriminator": [
        227,
        193,
        82,
        110,
        232,
        176,
        197,
        122
      ]
    },
    {
      "name": "taskStatusChangeEvent",
      "discriminator": [
        95,
        254,
        137,
        96,
        220,
        33,
        97,
        33
      ]
    },
    {
      "name": "taskVaultCreatedEvent",
      "discriminator": [
        252,
        121,
        95,
        161,
        68,
        1,
        254,
        201
      ]
    },
    {
      "name": "taskVaultWithdrawalEnabledEvent",
      "discriminator": [
        139,
        109,
        86,
        243,
        199,
        98,
        99,
        149
      ]
    },
    {
      "name": "taskVoteEvent",
      "discriminator": [
        82,
        233,
        126,
        106,
        31,
        124,
        96,
        25
      ]
    },
    {
      "name": "treasuryDepositEvent",
      "discriminator": [
        25,
        50,
        133,
        111,
        59,
        244,
        109,
        52
      ]
    },
    {
      "name": "treasuryTokenRegisteredEvent",
      "discriminator": [
        72,
        20,
        100,
        76,
        242,
        14,
        154,
        106
      ]
    },
    {
      "name": "treasuryTransferExecutedEvent",
      "discriminator": [
        139,
        118,
        43,
        166,
        152,
        251,
        203,
        158
      ]
    },
    {
      "name": "treasuryTransferProposalEvent",
      "discriminator": [
        71,
        27,
        106,
        116,
        212,
        244,
        190,
        249
      ]
    },
    {
      "name": "treasuryTransferVoteEvent",
      "discriminator": [
        98,
        232,
        196,
        248,
        84,
        178,
        49,
        15
      ]
    },
    {
      "name": "voteEvent",
      "discriminator": [
        195,
        71,
        250,
        105,
        120,
        119,
        234,
        134
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidThreshold",
      "msg": "The provided threshold is not within valid range (0-100)"
    },
    {
      "code": 6001,
      "name": "invalidValidityPeriod",
      "msg": "The provided validity period must be greater than zero"
    },
    {
      "code": 6002,
      "name": "unauthorizedOrganizationUpdate",
      "msg": "Only the organization creator can update parameters"
    },
    {
      "code": 6003,
      "name": "invalidContributor",
      "msg": "Only active contributors can perform this action"
    },
    {
      "code": 6004,
      "name": "alreadyContributor",
      "msg": "This account is already a contributor"
    },
    {
      "code": 6005,
      "name": "proposalExpired",
      "msg": "Proposal has expired"
    },
    {
      "code": 6006,
      "name": "alreadyVoted",
      "msg": "This account has already voted on this proposal"
    },
    {
      "code": 6007,
      "name": "insufficientTokenBalance",
      "msg": "Voter does not have enough tokens to vote"
    },
    {
      "code": 6008,
      "name": "unauthorizedProjectAction",
      "msg": "Only project members can vote on or create tasks"
    },
    {
      "code": 6009,
      "name": "invalidStateForAction",
      "msg": "This action is not allowed in the current state"
    },
    {
      "code": 6010,
      "name": "insufficientTaskVotes",
      "msg": "Task has not received enough votes to be completed"
    },
    {
      "code": 6011,
      "name": "projectExpired",
      "msg": "The project validity period has expired"
    },
    {
      "code": 6012,
      "name": "invalidBudgetAmount",
      "msg": "Invalid budget amount specified"
    },
    {
      "code": 6013,
      "name": "proposalNotActive",
      "msg": "Proposal status is not active"
    },
    {
      "code": 6014,
      "name": "invalidTaskStatus",
      "msg": "Task status is not in the right state for this action"
    },
    {
      "code": 6015,
      "name": "invalidContributorAccount",
      "msg": "The provided contributor account does not match the expected PDA"
    },
    {
      "code": 6016,
      "name": "invalidQuorumRequirement",
      "msg": "Invalid quorum requirement, must be between 1-100%"
    },
    {
      "code": 6017,
      "name": "invalidOrganizationName",
      "msg": "Invalid organization name"
    },
    {
      "code": 6018,
      "name": "proposalNotApproved",
      "msg": "Proposal must be approved to create a project"
    },
    {
      "code": 6019,
      "name": "projectCreationFailed",
      "msg": "Failed to create project from proposal"
    },
    {
      "code": 6020,
      "name": "insufficientBalance",
      "msg": "Insufficient account balance for this operation"
    },
    {
      "code": 6021,
      "name": "invalidTokenAccount",
      "msg": "Token account does not belong to the voter"
    },
    {
      "code": 6022,
      "name": "invalidTokenMint",
      "msg": "Token account mint does not match organization's token mint"
    },
    {
      "code": 6023,
      "name": "invalidProjectAccount",
      "msg": "The provided project account does not match the expected PDA"
    },
    {
      "code": 6024,
      "name": "insufficientTreasuryBalance",
      "msg": "Insufficient funds in treasury for this transfer"
    },
    {
      "code": 6025,
      "name": "treasuryNotInitialized",
      "msg": "Treasury not initialized for this organization"
    },
    {
      "code": 6026,
      "name": "proposalAlreadyExecuted",
      "msg": "This proposal has already been executed"
    },
    {
      "code": 6027,
      "name": "invalidTransferAmount",
      "msg": "Invalid transfer amount"
    },
    {
      "code": 6028,
      "name": "tokenNotRegistered",
      "msg": "Token not registered with treasury"
    },
    {
      "code": 6029,
      "name": "registryAlreadyExists",
      "msg": "Registry already exists for this organization"
    },
    {
      "code": 6030,
      "name": "maximumTokensReached",
      "msg": "Maximum number of treasury tokens reached"
    },
    {
      "code": 6031,
      "name": "taskVaultAlreadyExists",
      "msg": "Task vault already exists for this task"
    },
    {
      "code": 6032,
      "name": "taskNotReadyForVault",
      "msg": "Task not ready for vault creation"
    },
    {
      "code": 6033,
      "name": "transferProposalNotLinked",
      "msg": "Transfer proposal not linked to task"
    },
    {
      "code": 6034,
      "name": "taskVaultNotFound",
      "msg": "Task vault not found"
    },
    {
      "code": 6035,
      "name": "unauthorizedWithdrawal",
      "msg": "Unauthorized withdrawal attempt"
    },
    {
      "code": 6036,
      "name": "withdrawalNotEnabled",
      "msg": "Withdrawal not enabled for this task vault"
    },
    {
      "code": 6037,
      "name": "withdrawalAlreadyEnabled",
      "msg": "Withdrawal already enabled for this task vault"
    },
    {
      "code": 6038,
      "name": "reviewerCannotBeAssignee",
      "msg": "Reviewer must not be the task assignee"
    },
    {
      "code": 6039,
      "name": "taskNotCompleted",
      "msg": "Task must be completed before enabling withdrawal"
    },
    {
      "code": 6040,
      "name": "invalidTaskAccount",
      "msg": "The provided task account does not match the expected PDA"
    },
    {
      "code": 6041,
      "name": "taskProposalNotFound",
      "msg": "Task proposal not found"
    },
    {
      "code": 6042,
      "name": "taskProposalNotActive",
      "msg": "Task proposal must be in active status"
    },
    {
      "code": 6043,
      "name": "taskProposalNotApproved",
      "msg": "Task proposal must be approved to create a task"
    },
    {
      "code": 6044,
      "name": "invalidMetadataUrl",
      "msg": "Invalid metadata URL provided (too long)"
    },
    {
      "code": 6045,
      "name": "invalidMetadataAccount",
      "msg": "Invalid metadata account"
    },
    {
      "code": 6046,
      "name": "invalidMetadataDescription",
      "msg": "Invalid metadata description (too long)"
    },
    {
      "code": 6047,
      "name": "invalidTimestamp",
      "msg": "Invalid timestamp provided (must be within 5 minutes of current time)"
    }
  ],
  "types": [
    {
      "name": "contributor",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "authority",
            "type": "pubkey"
          },
          {
            "name": "rate",
            "type": "u64"
          },
          {
            "name": "validityEndTime",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "contributorProposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "candidate",
            "type": "pubkey"
          },
          {
            "name": "proposer",
            "type": "pubkey"
          },
          {
            "name": "proposedRate",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          },
          {
            "name": "votesFor",
            "type": "u32"
          },
          {
            "name": "votesAgainst",
            "type": "u32"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "proposalStatus"
              }
            }
          },
          {
            "name": "voters",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "contributorProposalEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "candidate",
            "type": "pubkey"
          },
          {
            "name": "proposer",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "organization",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "uuid",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "contributors",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "contributorProposalThresholdPercentage",
            "type": "u8"
          },
          {
            "name": "contributorProposalValidityPeriod",
            "type": "i64"
          },
          {
            "name": "contributorValidityPeriod",
            "type": "i64"
          },
          {
            "name": "contributorProposalQuorumPercentage",
            "type": "u8"
          },
          {
            "name": "projectProposalThresholdPercentage",
            "type": "u8"
          },
          {
            "name": "projectProposalValidityPeriod",
            "type": "i64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "minimumTokenRequirement",
            "type": "u64"
          },
          {
            "name": "treasuryTransferThresholdPercentage",
            "type": "u8"
          },
          {
            "name": "treasuryTransferProposalValidityPeriod",
            "type": "i64"
          },
          {
            "name": "treasuryTransferQuorumPercentage",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "organizationMetadata",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "logoUrl",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "websiteUrl",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "twitterUrl",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "discordUrl",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "telegramUrl",
            "type": {
              "option": "string"
            }
          },
          {
            "name": "description",
            "type": {
              "option": "string"
            }
          }
        ]
      }
    },
    {
      "name": "project",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "uuid",
            "type": {
              "array": [
                "u8",
                16
              ]
            }
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "members",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "taskApprovalThreshold",
            "type": "u8"
          },
          {
            "name": "validityEndTime",
            "type": "i64"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "projectCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "projectProposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "proposer",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "memberPubkeys",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "taskApprovalThreshold",
            "type": "u8"
          },
          {
            "name": "validityPeriod",
            "type": "i64"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          },
          {
            "name": "votesFor",
            "type": "u32"
          },
          {
            "name": "votesAgainst",
            "type": "u32"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "proposalStatus"
              }
            }
          },
          {
            "name": "voters",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "projectProposalEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "proposer",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "projectReadyEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "projectAddress",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "proposalStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "active"
          },
          {
            "name": "approved"
          },
          {
            "name": "rejected"
          },
          {
            "name": "expired"
          }
        ]
      }
    },
    {
      "name": "task",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "assignee",
            "type": "pubkey"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "taskStatus"
              }
            }
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "paymentAmount",
            "type": "u64"
          },
          {
            "name": "votesFor",
            "type": "u32"
          },
          {
            "name": "votesAgainst",
            "type": "u32"
          },
          {
            "name": "voters",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "transferProposal",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "vault",
            "type": {
              "option": "pubkey"
            }
          },
          {
            "name": "reviewer",
            "type": {
              "option": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "taskCompletedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "task",
            "type": "pubkey"
          },
          {
            "name": "assignee",
            "type": "pubkey"
          },
          {
            "name": "paymentAmount",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "taskCreatedFromProposalEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "task",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "assignee",
            "type": "pubkey"
          },
          {
            "name": "paymentAmount",
            "type": "u64"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "taskEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "task",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "assignee",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "taskPaymentEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "task",
            "type": "pubkey"
          },
          {
            "name": "assignee",
            "type": "pubkey"
          },
          {
            "name": "paymentAmount",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "taskProposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "proposer",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "paymentAmount",
            "type": "u64"
          },
          {
            "name": "assignee",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "destination",
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          },
          {
            "name": "votesFor",
            "type": "u32"
          },
          {
            "name": "votesAgainst",
            "type": "u32"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "proposalStatus"
              }
            }
          },
          {
            "name": "voters",
            "type": {
              "vec": "pubkey"
            }
          }
        ]
      }
    },
    {
      "name": "taskProposalEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "proposer",
            "type": "pubkey"
          },
          {
            "name": "assignee",
            "type": "pubkey"
          },
          {
            "name": "paymentAmount",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "taskProposalVoteEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "vote",
            "type": "bool"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "taskStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "proposed"
          },
          {
            "name": "approved"
          },
          {
            "name": "ready"
          },
          {
            "name": "completed"
          },
          {
            "name": "rejected"
          },
          {
            "name": "paid"
          }
        ]
      }
    },
    {
      "name": "taskStatusChangeEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "task",
            "type": "pubkey"
          },
          {
            "name": "oldStatus",
            "type": {
              "defined": {
                "name": "taskStatus"
              }
            }
          },
          {
            "name": "newStatus",
            "type": {
              "defined": {
                "name": "taskStatus"
              }
            }
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "taskVault",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "task",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "tokenAccount",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "assignee",
            "type": "pubkey"
          },
          {
            "name": "isWithdrawable",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "taskVaultCreatedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "task",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "assignee",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "taskVaultWithdrawalEnabledEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "task",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "assignee",
            "type": "pubkey"
          },
          {
            "name": "reviewer",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "taskVoteEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "project",
            "type": "pubkey"
          },
          {
            "name": "task",
            "type": "pubkey"
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "vote",
            "type": "bool"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "treasuryDepositEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "depositor",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "treasuryTokenAccount",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "treasuryTokenAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "tokenAccount",
            "type": "pubkey"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "treasuryTokenRegisteredEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "mint",
            "type": "pubkey"
          },
          {
            "name": "tokenAccount",
            "type": "pubkey"
          },
          {
            "name": "registrar",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "treasuryTokenRegistry",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "tokenAccounts",
            "type": {
              "vec": {
                "defined": {
                  "name": "treasuryTokenAccount"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "treasuryTransferExecutedEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "destination",
            "type": "pubkey"
          },
          {
            "name": "executor",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "treasuryTransferProposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "proposer",
            "type": "pubkey"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "destination",
            "type": "pubkey"
          },
          {
            "name": "createdAt",
            "type": "i64"
          },
          {
            "name": "expiresAt",
            "type": "i64"
          },
          {
            "name": "votesFor",
            "type": "u32"
          },
          {
            "name": "votesAgainst",
            "type": "u32"
          },
          {
            "name": "status",
            "type": {
              "defined": {
                "name": "proposalStatus"
              }
            }
          },
          {
            "name": "voters",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "description",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "treasuryTransferProposalEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "destination",
            "type": "pubkey"
          },
          {
            "name": "proposer",
            "type": "pubkey"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "treasuryTransferVoteEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "organization",
            "type": "pubkey"
          },
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "vote",
            "type": "bool"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "voteEvent",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "voter",
            "type": "pubkey"
          },
          {
            "name": "proposal",
            "type": "pubkey"
          },
          {
            "name": "voteFor",
            "type": "bool"
          },
          {
            "name": "timestamp",
            "type": "i64"
          }
        ]
      }
    }
  ]
};

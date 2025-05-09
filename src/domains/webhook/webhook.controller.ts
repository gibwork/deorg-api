import { HeliusService } from '@core/services/helius/helius.service';
import { Controller, Post, Body } from '@nestjs/common';
import { Connection } from '@solana/web3.js';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly heliusService: HeliusService) {}

  @Post('')
  async handle(@Body() body: any) {
    const connection = new Connection(this.heliusService.devnetRpcUrl); // ou seu endpoint Helius

    for (const signature of body[0].transaction.signatures || []) {
      const tx = await connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0
      });

      if (!tx?.meta?.logMessages) continue;

      const instructions = extractInstructions(tx?.meta?.logMessages);

      console.log(instructions);
    }
  }
}

type InstructionLog = {
  instruction: string;
  extra?: Record<string, string>;
};

function extractInstructions(logs: string[]): InstructionLog[] {
  const instructions: InstructionLog[] = [];
  let currentInstruction: InstructionLog | null = null;

  for (const line of logs) {
    const instructionMatch = line.match(/Program log: Instruction: (\w+)/);
    if (instructionMatch) {
      // Salva a instrução atual
      if (currentInstruction) {
        instructions.push(currentInstruction);
      }
      currentInstruction = { instruction: instructionMatch[1] };
      continue;
    }

    // Captura dados específicos da instrução de criação de organização
    if (currentInstruction?.instruction === 'CreateOrganization') {
      const orgIdMatch = line.match(/Organization created with ID: (\w+)/);
      if (orgIdMatch) {
        currentInstruction.extra = { organizationId: orgIdMatch[1] };
      }
    }

    // Captura dados da RegisterTreasuryToken
    if (currentInstruction?.instruction === 'RegisterTreasuryToken') {
      const treasuryMatch = line.match(
        /Treasury token registered: mint=(\w+), account=(\w+)/
      );
      if (treasuryMatch) {
        currentInstruction.extra = {
          mint: treasuryMatch[1],
          account: treasuryMatch[2]
        };
      }
    }
  }

  // Adiciona a última instrução se existir
  if (currentInstruction) {
    instructions.push(currentInstruction);
  }

  return instructions;
}

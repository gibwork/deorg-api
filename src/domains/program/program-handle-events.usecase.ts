import { BN, EventParser } from '@coral-xyz/anchor';
import { DeorgVotingProgram, idl } from '@deorg/node';
import { SocketGateway } from '@domains/gateway/socket.gateway';
import { Injectable } from '@nestjs/common';
import { Connection, PublicKey } from '@solana/web3.js';
import * as anchor from '@coral-xyz/anchor';
import { HeliusService } from '@core/services/helius/helius.service';

interface TaskStatusChangeEvent {
  project: string;
  task: string;
  oldStatus: string;
  newStatus: string;
  timestamp: string;
}

interface TaskPaymentEvent {
  project: string;
  task: string;
  assignee: string;
  paymentAmount: string;
  tokenMint: string;
  timestamp: string;
}

interface TaskVaultWithdrawalEnabledEvent {
  task: string;
  vault: string;
  assignee: string;
  reviewer: string;
  timestamp: string;
}

interface TaskProposalEvent {
  organization: string;
  project: string;
  proposal: string;
  title: string;
  proposer: string;
  assignee: string;
  paymentAmount: string;
  tokenMint: string;
  timestamp: string;
}

interface Events {
  name:
    | 'taskStatusChangeEvent'
    | 'taskPaymentEvent'
    | 'taskVaultWithdrawalEnabledEvent'
    | 'taskProposalEvent';
  data:
    | TaskStatusChangeEvent
    | TaskPaymentEvent
    | TaskVaultWithdrawalEnabledEvent
    | TaskProposalEvent;
}

@Injectable()
export class ProgramHandleEventsUsecase {
  constructor(
    private readonly socketGateway: SocketGateway,
    private readonly heliusService: HeliusService
  ) {}

  async execute(body: { logMessages: string[] }) {
    const events = await this.parseEvents(body.logMessages);

    for (const event of events) {
      console.log({ eventName: event.name, eventData: event.data });
      this.socketGateway.server.emit(event.name, event.data);
    }
  }

  private convertBNToPublicKey(value: any): string {
    if (value && typeof value === 'object' && '_bn' in value) {
      const bn = new BN(value._bn);
      return new PublicKey(bn).toBase58();
    }
    return this.convertToSerializable(value);
  }

  private parseStatus(status: any): string {
    if (typeof status === 'object' && status !== null) {
      const statusKey = Object.keys(status)[0];
      return statusKey || '';
    }
    return '';
  }

  private serializeTaskStatusChangeEvent(data: any): TaskStatusChangeEvent {
    return {
      project: data.project.toBase58(),
      task: data.task.toBase58(),
      oldStatus: this.parseStatus(data.oldStatus),
      newStatus: this.parseStatus(data.newStatus),
      timestamp:
        data.timestamp instanceof BN
          ? data.timestamp.toNumber().toString()
          : data.timestamp.toString()
    };
  }

  private serializeTaskPaymentEvent(data: any): TaskPaymentEvent {
    return {
      project: this.convertBNToPublicKey(data.project),
      task: this.convertBNToPublicKey(data.task),
      assignee: this.convertBNToPublicKey(data.assignee),
      paymentAmount:
        data.paymentAmount instanceof BN
          ? data.paymentAmount.toNumber().toString()
          : data.paymentAmount.toString(),
      tokenMint: this.convertBNToPublicKey(data.tokenMint),
      timestamp:
        data.timestamp instanceof BN
          ? data.timestamp.toNumber().toString()
          : data.timestamp.toString()
    };
  }

  private serializeTaskVaultWithdrawalEnabledEvent(
    data: any
  ): TaskVaultWithdrawalEnabledEvent {
    return {
      task: this.convertBNToPublicKey(data.task),
      vault: this.convertBNToPublicKey(data.vault),
      assignee: this.convertBNToPublicKey(data.assignee),
      reviewer: this.convertBNToPublicKey(data.reviewer),
      timestamp:
        data.timestamp instanceof BN
          ? data.timestamp.toNumber().toString()
          : data.timestamp.toString()
    };
  }

  async parseEvents(logMessages: string[]): Promise<Events[]> {
    const connection: any = new Connection(this.heliusService.devnetRpcUrl);
    const program = new anchor.Program<DeorgVotingProgram>(
      idl as DeorgVotingProgram,
      connection
    );

    const parser = new EventParser(program.programId, program.coder);
    const events = parser.parseLogs(logMessages);
    console.log({ logMessages });
    console.log({ events });

    const parsedEvents: Events[] = [];

    for (const event of events) {
      let serializedData;
      switch (event.name) {
        case 'taskStatusChangeEvent':
          serializedData = this.serializeTaskStatusChangeEvent(event.data);
          break;
        case 'taskPaymentEvent':
          serializedData = this.serializeTaskPaymentEvent(event.data);
          break;
        case 'taskVaultWithdrawalEnabledEvent':
          serializedData = this.serializeTaskVaultWithdrawalEnabledEvent(
            event.data
          );
          break;
        case 'taskProposalEvent':
          serializedData = this.serializeTaskProposalEvent(event.data);
          break;
        default:
          serializedData = this.convertToSerializable(event.data);
      }

      parsedEvents.push({
        name: event.name as Events['name'],
        data: serializedData
      });
    }

    return parsedEvents;
  }

  private serializeTaskProposalEvent(data: any): TaskProposalEvent {
    return {
      organization: this.convertBNToPublicKey(data.organization),
      project: this.convertBNToPublicKey(data.project),
      proposal: this.convertBNToPublicKey(data.proposal),
      title: data.title,
      proposer: this.convertBNToPublicKey(data.proposer),
      assignee: this.convertBNToPublicKey(data.assignee),
      paymentAmount:
        data.paymentAmount instanceof BN
          ? data.paymentAmount.toNumber().toString()
          : data.paymentAmount.toString(),
      tokenMint: this.convertBNToPublicKey(data.tokenMint),
      timestamp:
        data.timestamp instanceof BN
          ? data.timestamp.toNumber().toString()
          : data.timestamp.toString()
    };
  }

  private convertToSerializable(data: any): any {
    if (data instanceof PublicKey) {
      return data.toBase58();
    }
    if (data instanceof BN) {
      return data.toNumber();
    }
    if (Array.isArray(data)) {
      return data.map((item) => this.convertToSerializable(item));
    }
    if (typeof data === 'object' && data !== null) {
      const result: any = {};
      for (const [key, value] of Object.entries(data)) {
        result[key] = this.convertToSerializable(value);
      }
      return result;
    }
    return data;
  }
}

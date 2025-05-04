import { Injectable } from '@nestjs/common';
import { VotingProgramService } from '@core/services/voting-program/voting-program.service';
import { UserEntity } from '@domains/users/entities/user.entity';
import { UserService } from '@domains/users/services/user.service';
import { ClerkService } from '@core/services/clerk/clerk.service';
import { convertUuid } from '@utils/convertUuid';

export interface ProjectWithMembers {
  uuid: string;
  members: UserEntity[];
  [key: string]: any;
}

@Injectable()
export class ListProjectsUsecase {
  constructor(
    private readonly votingProgramService: VotingProgramService,
    private readonly userService: UserService,
    private readonly clerkService: ClerkService
  ) {}

  async execute(orgAccountAddress: string): Promise<ProjectWithMembers[]> {
    await this.votingProgramService.getOrganizationDetails(orgAccountAddress);

    const projects =
      await this.votingProgramService.getOrganizationProjects(
        orgAccountAddress
      );

    const projectsWithMembers = await this.enrichProjectsWithMembers(projects);
    return projectsWithMembers;
  }

  private async enrichProjectsWithMembers(
    projects: any[]
  ): Promise<ProjectWithMembers[]> {
    const projectsWithMembers: ProjectWithMembers[] = [];
    const cachedUsers = new Map<string, UserEntity>();

    for (const project of projects) {
      const members = await this.getProjectMembers(
        project.members,
        cachedUsers
      );

      projectsWithMembers.push({
        ...project,
        uuid: convertUuid(project.uuid),
        members
      });
    }

    return projectsWithMembers;
  }

  private async getProjectMembers(
    memberAddresses: string[],
    cachedUsers: Map<string, UserEntity>
  ): Promise<UserEntity[]> {
    const members: UserEntity[] = [];

    for (const address of memberAddresses) {
      const member = await this.getOrCreateUser(address, cachedUsers);
      if (member) {
        members.push(member);
      }
    }

    return members;
  }

  private async getOrCreateUser(
    walletAddress: string,
    cachedUsers: Map<string, UserEntity>
  ): Promise<UserEntity | null> {
    // Check cache first
    const cachedUser = cachedUsers.get(walletAddress);
    if (cachedUser) {
      return cachedUser;
    }

    // Try to find existing user
    const existingUser = await this.userService.findOne({
      where: { walletAddress }
    });

    if (existingUser) {
      cachedUsers.set(walletAddress, existingUser);
      return existingUser;
    }

    // Try to find and create user from Clerk
    const clerkUser = await this.clerkService.findUserByUsername(
      walletAddress.slice(0, 6).toLowerCase()
    );

    if (clerkUser) {
      const newUser = await this.userService.create({
        externalId: clerkUser.id,
        walletAddress,
        username: clerkUser.username!,
        profilePicture: clerkUser.image_url
      });

      cachedUsers.set(walletAddress, newUser);
      return newUser;
    }

    return null;
  }
}

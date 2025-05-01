import { HttpException, Injectable, Logger } from '@nestjs/common';
// import * as process from 'node:process';
// import { Buffer } from 'buffer';
import { Octokit } from '@octokit/rest';
import { ClerkService } from '../clerk/clerk.service';
import { ForkRepoResponse } from './contracts';

interface NewBranchResponse {
  ref: string;
  node_id: string;
  url: string;
  object: {
    sha: string;
    type: string;
    url: string;
  };
}
@Injectable()
export class GithubService {
  constructor(private readonly clerkService: ClerkService) {}
  private createOctokitInstance(accessToken?: string | null): Octokit {
    return accessToken ? new Octokit({ auth: accessToken }) : new Octokit();
  }

  async getRepositories(userId: string): Promise<any> {
    try {
      const accessTokenHash =
        await this.clerkService.getGithubAccessToken(userId);
      const octokit = this.createOctokitInstance(accessTokenHash);
      const response = await octokit.rest.repos.listForAuthenticatedUser({
        visibility: 'all',
        per_page: 100,
        sort: 'updated'
      });

      return response.data;
    } catch (error) {
      console.log(error);
      Logger.error(error.message, error.stack, 'GithubAuthUser.repos');
      return null;
    }
  }

  async getRepositoryIssuesAndBranches(
    userId: string,
    owner: string,
    repo: string
  ): Promise<any> {
    const accessTokenHash =
      await this.clerkService.getGithubAccessToken(userId);
    const octokit = this.createOctokitInstance(accessTokenHash);

    try {
      const [issuesData, branchesData] = await Promise.all([
        octokit.rest.issues.listForRepo({
          owner,
          repo
        }),
        octokit.rest.repos.listBranches({
          owner,
          repo
        })
      ]);

      return { issues: issuesData.data, branches: branchesData.data };
    } catch (error) {
      console.log(error);
      Logger.error(
        error.message,
        error.stack,
        'GithubAuthUser.repo.issues.branches'
      );
      return null;
    }
  }

  async getMetadata(
    userId: string,
    externalUrl: string,
    branch: string,
    throwError: boolean = false
  ): Promise<{ metadata: any } | null> {
    //github access token from clerk

    // const repoPath = externalUrl.split('/').slice(3, 5).join('/');
    // const issuePath = externalUrl.split('/').slice(3).join('/');

    const owner = externalUrl.split('/')[3];
    const repo = externalUrl.split('/')[4];
    const issue_number = Number(externalUrl.split('/')[6]);

    const accessTokenHash =
      await this.clerkService.getGithubAccessToken(userId);

    const octokit = this.createOctokitInstance(
      accessTokenHash ?? String(process.env.GITHUB_AUTH_TOKEN)
    );

    try {
      const [repoData, issueData, branchData] = await Promise.all([
        octokit.rest.repos.get({
          owner,
          repo
        }),
        octokit.rest.issues.get({
          owner,
          repo,
          issue_number
        }),
        octokit.rest.repos.getBranch({
          owner,
          repo,
          branch
        })
      ]);

      return {
        metadata: {
          repoData: repoData.data,
          issueData: issueData.data,
          branchData: branchData.data
        }
      };
    } catch (error) {
      console.log(error);
      Logger.error(error.message, error.stack, 'GithubISSUE.metadata');
      if (throwError) {
        throw new HttpException(
          error.response?.data,
          error.response?.status || 500,
          {
            cause: error
          }
        );
      }
      return null;
    }
  }

  async forkRepo(
    userId: string,
    externalUrl: string,
    defaultBranchOnly: boolean = true
  ): Promise<ForkRepoResponse | null> {
    const accessTokenHash =
      await this.clerkService.getGithubAccessToken(userId);

    const octokit = this.createOctokitInstance(accessTokenHash);

    const owner = externalUrl.split('/')[3];
    const repo = externalUrl.split('/')[4];
    try {
      const { data: forkData } = await octokit.rest.repos.createFork({
        owner,
        repo,
        default_branch_only: defaultBranchOnly
      });

      return forkData;
    } catch (error) {
      console.log(error);
      Logger.error(error.message, error.stack, 'GithubService.fork');
      throw error;
    }
  }

  async createBranch(
    userId: string,
    externalUrl: string,
    forkedRepoUrl: string,
    fromBranchName: string
  ): Promise<NewBranchResponse | null> {
    const accessTokenHash =
      await this.clerkService.getGithubAccessToken(userId);

    const octokit = this.createOctokitInstance(accessTokenHash);
    const owner = externalUrl.split('/')[3];
    const repo = externalUrl.split('/')[4];

    const forkedRepoOwner = forkedRepoUrl.split('/')[3];
    const forkedRepo = forkedRepoUrl.split('/')[4];
    try {
      const newBranchName = generateId(repo);

      // Get the SHA of the default branch (usually 'main' or 'master')
      const {
        data: {
          object: { sha }
        }
      } = await octokit.rest.git.getRef({
        owner,
        repo,
        ref: `heads/${fromBranchName}`
      });

      // Create a new branch
      const { data: createBranchResponse } = await octokit.rest.git.createRef({
        owner: forkedRepoOwner,
        repo: forkedRepo,
        ref: `refs/heads/gib-bounty-${newBranchName}`,
        sha
      });

      return createBranchResponse;
    } catch (error) {
      console.log(error);
      Logger.error(error.message, error.stack, 'GithubService.createBranch');
      throw error;
    }
  }

  async compareCommits(
    userId: string,
    owner: string,
    repo: string,
    base: string,
    head: string
  ): Promise<any> {
    const accessTokenHash =
      await this.clerkService.getGithubAccessToken(userId);

    const octokit = this.createOctokitInstance(accessTokenHash);

    try {
      const { data } = await octokit.rest.repos.compareCommitsWithBasehead({
        owner,
        repo,
        basehead: `${base}...${head}`
      });

      return data;
    } catch (error) {
      console.log(error);
      Logger.error(error.message, error.stack, 'GithubService.fork');
      throw error;
    }
  }

  async createPullRequest({
    userId,
    prTitle,
    description,
    bountyId,
    externalUrl,
    forkUrl,
    ref,
    ghBranch,
    issueNumber
  }: {
    userId: string;
    prTitle: string;
    description: string;
    bountyId: string;
    externalUrl: string;
    forkUrl: string;
    ref: string;
    ghBranch: string;
    issueNumber: number;
  }): Promise<any> {
    const accessTokenHash =
      await this.clerkService.getGithubAccessToken(userId);

    const octokit = this.createOctokitInstance(accessTokenHash);
    const owner = externalUrl.split('/')[3];
    const repo = externalUrl.split('/')[4];
    const match = forkUrl.match(/repos\/(.*?)\/(.*?)\/git\/refs/);

    if (!match) {
      console.error('Error: Invalid URL format in ghForkDetails');
      return;
    }
    const [_, forkOwner, forkRepo] = match;
    const branchName = ref.split('/').pop();
    try {
      const body = `${description}. \n This pull request was created for ${process.env.WEB_APP_URL}/bounties/${bountyId} in an attempt to solve a bounty #${issueNumber} . Payment for the bounty is immediately sent to the contributor after merge.`;

      // Create a new pull req
      const { data: createPR } = await octokit.rest.pulls.create({
        owner,
        repo,
        head: `${forkOwner}:${branchName}`,
        base: ghBranch,
        body,
        title: prTitle
      });

      return createPR;
    } catch (error) {
      Logger.error(error.message, error.stack, 'GithubService.pullRequest');
      throw new HttpException(
        {
          statusCode: error.response.status,
          error: error.response.data
        },
        error.response.status,
        {
          cause: error
        }
      );
    }
  }

  async checkPullRequestStatus(
    userId: string,
    externalUrl: string
  ): Promise<any> {
    const accessTokenHash =
      await this.clerkService.getGithubAccessToken(userId);

    const octokit = this.createOctokitInstance(accessTokenHash);
    const owner = externalUrl.split('/')[3];
    const repo = externalUrl.split('/')[4];
    const pull_number = Number(externalUrl.split('/')[6]);

    try {
      const response = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number
      });

      return response.data;
    } catch (error) {
      console.log(error);
      Logger.error(error.message, error.stack, 'GithubPullReq.status');
      return null;
    }
  }

  async closePullRequest({
    userId,
    externalUrl
  }: {
    userId: string;
    externalUrl: string;
  }): Promise<any> {
    const accessTokenHash =
      await this.clerkService.getGithubAccessToken(userId);

    const octokit = this.createOctokitInstance(accessTokenHash);
    const owner = externalUrl.split('/')[3];
    const repo = externalUrl.split('/')[4];
    const pull_number = Number(externalUrl.split('/')[6]);

    try {
      const { data: closedPR } = await octokit.rest.pulls.update({
        owner,
        repo,
        pull_number,
        state: 'closed'
      });

      return closedPR;
    } catch (error) {
      Logger.error(
        error.message,
        error.stack,
        'GithubService.closePullRequest'
      );
      throw new Error(error);
    }
  }

  async getPullRequestDetails(
    userId: string,
    externalUrl: string
  ): Promise<any> {
    const accessTokenHash =
      await this.clerkService.getGithubAccessToken(userId);
    console.log(accessTokenHash);

    const octokit = this.createOctokitInstance(accessTokenHash);
    const owner = externalUrl.split('/')[3];
    const repo = externalUrl.split('/')[4];
    const pull_number = Number(externalUrl.split('/')[6]);

    try {
      const { data: pullRequestData } = await octokit.rest.pulls.get({
        owner,
        repo,
        pull_number
      });

      return pullRequestData;
    } catch (error) {
      Logger.error(
        error.message,
        error.stack,
        'GithubService.pullRequestDetails'
      );
      throw error;
    }
  }
}

const generateId = (name: string): string => {
  // Get the first 2-3 characters of the name
  const firstCharacters = name.slice(0, 3);

  // Combine the first characters with the hash
  const id = `${firstCharacters}`;

  const randomDigits = Array.from({ length: 6 }, () =>
    Math.floor(Math.random() * 10)
  ).join('');
  return id + randomDigits;
};

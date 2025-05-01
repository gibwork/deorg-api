import { type User } from '@clerk/backend';
import { clerkClient } from '@clerk/express';

import { Logger } from '@nestjs/common';
import axios from 'axios';
import { ClerkUser, SignInToken } from './contracts';

export class ClerkService {
  async createUser(publicKey: string): Promise<User> {
    const firstName = 'Random';
    const lastName = 'Worker';

    try {
      const user = await clerkClient.users.createUser({
        firstName,
        lastName,
        username: publicKey.slice(0, 6)
      });

      return user;
    } catch (error) {
      Logger.error(error.message, error.stack, 'ClerkService.createUser');
      throw error;
    }
  }

  async getSignInToken(userId: string): Promise<SignInToken> {
    try {
      const expiresInSeconds = 60 * 2; // two mins

      const response = await clerkClient.signInTokens.createSignInToken({
        userId,
        expiresInSeconds
      });

      return response;
    } catch (error) {
      Logger.error(error.message, error.stack, 'ClerkService.createUser');
      throw error;
    }
  }
  async getUser(userId: string): Promise<ClerkUser> {
    try {
      const response = await axios.get(
        `https://api.clerk.com/v1/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      Logger.error(error.message, error.stack, 'ClerkService.getUser');
      throw error;
    }
  }

  async deleteExternalId(
    userId: string,
    externalAccountId: string
  ): Promise<ClerkUser> {
    try {
      const response = await axios.delete(
        `https://api.clerk.com/v1/users/${userId}/external_accounts/${externalAccountId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CLERK_SECRET_KEY}`
          }
        }
      );

      return response.data;
    } catch (error) {
      Logger.error(error.message, error.stack, 'ClerkService.getUser');
      throw error;
    }
  }

  async getGithubAccessToken(userId: string): Promise<string | null> {
    try {
      const provider = 'oauth_github';

      const clerkResponse = await clerkClient.users.getUserOauthAccessToken(
        userId,
        provider
      );

      return clerkResponse.data[0].token;
    } catch (error) {
      return null;
    }
  }

  async findUserByUsername(username: string): Promise<ClerkUser | null> {
    try {
      const limit = 100;
      let offset = 0;
      let hasMore = true;

      while (hasMore) {
        const users = await clerkClient.users.getUserList({
          limit,
          offset
        });

        if (users.data.length < limit) {
          hasMore = false;
        }

        const foundUser = users.data.find((user) => user.username === username);

        if (foundUser) {
          return this.getUser(foundUser.id);
        }

        offset += limit;
      }

      return null;
    } catch (error) {
      Logger.error(
        error.message,
        error.stack,
        'ClerkService.findUserByUsername'
      );
      return null;
    }
  }
}

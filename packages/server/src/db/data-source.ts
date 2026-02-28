import { UserProfile, User } from "../types";

import mockUsers from "../../data/mock-users.json";
import mockProfiles from "../../data/mock-profiles.json";

export interface SeedingDataSource {
  getUsers(): User[];

  getProfilesForUser(user: User): UserProfile[];
}

export function getSeedingDataSource(): SeedingDataSource {
  return new SeedingDataSourceImpl();
}

class SeedingDataSourceImpl implements SeedingDataSource {
  getUsers(): User[] {
    return mockUsers.map((user) => ({
      name: user.userName,
    }));
  }

  getProfilesForUser(user: User): UserProfile[] {
    // The same profiles for each user
    return mockProfiles.map((profileName) => ({ profileName }));
  }
}

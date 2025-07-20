import { Profile, User } from "../types";

export interface DataStore {
  createUser(user: User): void;

  fetchUsers(): Promise<User[]>;
  fetchUserProfiles(user: User): Promise<Profile[]>;
}


import { UserProfile, User } from "../types";
import { ProfilesTableInsert } from "./schema/sqlite";

export interface DataStore {
  createUser(user: User): void;
  addUserProfile(profile: ProfilesTableInsert): void;

  fetchUsers(): Promise<User[]>;
  fetchUserProfiles(user: User): Promise<UserProfile[]>;
}

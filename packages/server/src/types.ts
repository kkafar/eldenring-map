import { z } from "zod";
import { UserSchema } from "./schemas";
import { DataStore } from "./db/data-store";

export type Context = {
  db: DataStore;
};

export type User = z.infer<typeof UserSchema>;

export type UserProfile = {
  profileName: string;
};

export type DBUsersRow = {
  name: string;
};

export type DBProfilesRow = {
  user_name: string;
  profile_name: string;
};

export type ResponsePayload<T> = {
  data: T;
};

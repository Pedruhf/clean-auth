export namespace SaveUserRepo {
  export type Input = {
    name: string;
    email: string;
    password: string;
  };
  export type Output = void;
}

export interface SaveUserRepo {
  save: (input: SaveUserRepo.Input) => Promise<SaveUserRepo.Output>;
}

import { User } from "@/domain/models";

export interface GetUserByEmailRepository {
  getUserByEmail: (email: string) => Promise<User | undefined>;
}

export type UserRepo = SaveUserRepo & GetUserByEmailRepository;

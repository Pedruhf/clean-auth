import { Login } from "@/domain/features";
import {
  EncryptComparer,
  GetUserByEmailRepository,
  TokenGenerator,
} from "@/data/gateways";

export class RemoteLogin {
  constructor(
    private readonly userRepo: GetUserByEmailRepository,
    private readonly encryptComparer: EncryptComparer,
    private readonly tokenGenerator: TokenGenerator
  ) {}

  async execute({ email, password }: Login.Input): Promise<Login.Output> {
    const user = await this.userRepo.getUserByEmail(email);
    const matchPassword = this.encryptComparer.compare(user.password, password);
    if (!matchPassword) {
      return;
    }
    const accessToken = this.tokenGenerator.generate(user.id);
    return {
      accessToken,
    };
  }
}

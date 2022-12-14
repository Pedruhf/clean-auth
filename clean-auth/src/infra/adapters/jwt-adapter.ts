import { JwtPayload, sign, verify } from "jsonwebtoken";

import { TokenDecrypter, TokenGenerator } from "@/data/gateways";
import { UnauthorizedError } from "@/application/errors";

export class JwtAdapter implements TokenGenerator, TokenDecrypter {
  static expiresTimeInSeconds = 3 * 60 * 60; // 3 Horas

  generate(id: number): string {
    const token = sign({ id }, "any_secret", { expiresIn: JwtAdapter.expiresTimeInSeconds });
    return token;
  }

  decrypt (encryptedValue: string): string {
    try {
      const decryptedValue = verify(encryptedValue, "any_secret") as JwtPayload;
      return decryptedValue.id;
    } catch {
      throw new UnauthorizedError()
    }
  }
}

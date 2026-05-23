import jwt from "jsonwebtoken";

function getSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "[auth] JWT_SECRET não definido nas variáveis de ambiente. " +
      "Configure JWT_SECRET no painel da Vercel em Settings > Environment Variables."
    );
  }
  return secret;
}

export function signToken(payload: object): string {
  return jwt.sign(payload, getSecret(), { expiresIn: "7d" });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, getSecret());
  } catch {
    return null;
  }
}

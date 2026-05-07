import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;
if (!SECRET) {
  throw new Error(
    "[auth] JWT_SECRET não definido nas variáveis de ambiente. Defina JWT_SECRET no .env.local e no painel de deploy.",
  );
}

// Após o guard acima, SECRET é garantidamente uma string.
const JWT_SECRET = SECRET as string;

export function signToken(payload: object): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

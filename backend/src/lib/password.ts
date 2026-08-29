import bcrypt from 'bcryptjs';

// Hash de senha com bcrypt (salting dinâmico). Nunca armazenar senha em texto simples.
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

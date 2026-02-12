import bcrypt from "bcrypt";

const SALT_ROUNDS = 10;

export const hashPassword = async (plain: string) => {
  return bcrypt.hash(plain, SALT_ROUNDS);
};

export const comparePassword = async (
  plain: string,
  hashed: string
) => {
  return bcrypt.compare(plain, hashed);
};

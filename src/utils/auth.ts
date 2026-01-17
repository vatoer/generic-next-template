import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "@/utils/db";
import { hashPassword, verifyPassword } from "./password";

export const auth = betterAuth({
  emailAndPassword: {
    enabled: true,
    password: {
      hash: hashPassword,
      verify: async (data) => {
        return verifyPassword(data.password, data.hash);
      },
    },
  },
  database: prismaAdapter(db, {
    provider: "postgresql",
  }),
});

// src/modules/user/user.service.ts
import { db } from "@/shared/db";

export const userService = {
  // Method 1: Get Profile
  getProfile: async (id: string) => {
    return db.user.findUnique({ where: { id } });
  },

  // Method 2: Update Profile
  updateProfile: async (id: string, data: any) => {
    // Validasi sederhana
    if (!data.email) throw new Error("Email required");
    return db.user.update({ where: { id }, data });
  },

  // Method 3: Change Password
  changePassword: async (id: string, newPass: string) => {
    // Password management is handled by better-auth
    // This is a placeholder for future implementation
    return null;
  },
};

export default userService;
import 'dotenv/config';
import { db } from '@/utils/db';

async function main() {
  console.log("🌱 Seeding RBAC data...");

  // Create Permissions
  const permissions = [
    // User permissions
    { name: "Create Users", resource: "users", action: "create", description: "Ability to create new users" },
    { name: "Read Users", resource: "users", action: "read", description: "Ability to view user information" },
    { name: "Update Users", resource: "users", action: "update", description: "Ability to update user information" },
    { name: "Delete Users", resource: "users", action: "delete", description: "Ability to delete users" },
    
    // Role permissions
    { name: "Create Roles", resource: "roles", action: "create", description: "Ability to create new roles" },
    { name: "Read Roles", resource: "roles", action: "read", description: "Ability to view role information" },
    { name: "Update Roles", resource: "roles", action: "update", description: "Ability to update role information" },
    { name: "Delete Roles", resource: "roles", action: "delete", description: "Ability to delete roles" },
    
    // Permission permissions
    { name: "Create Permissions", resource: "permissions", action: "create", description: "Ability to create new permissions" },
    { name: "Read Permissions", resource: "permissions", action: "read", description: "Ability to view permission information" },
    { name: "Update Permissions", resource: "permissions", action: "update", description: "Ability to update permission information" },
    { name: "Delete Permissions", resource: "permissions", action: "delete", description: "Ability to delete permissions" },
    
    // Dashboard permissions
    { name: "View Dashboard", resource: "dashboard", action: "read", description: "Ability to view the dashboard" },
  ];

  console.log("Creating permissions...");
  for (const permission of permissions) {
    await db.permission.upsert({
      where: {
        resource_action: {
          resource: permission.resource,
          action: permission.action,
        },
      },
      update: {},
      create: permission,
    });
  }
  console.log(`✅ Created ${permissions.length} permissions`);

  // Create Roles
  console.log("Creating roles...");
  
  const adminRole = await db.role.upsert({
    where: { name: "Admin" },
    update: {},
    create: {
      name: "Admin",
      description: "Full system access with all permissions",
      isSystem: true,
    },
  });

  const userRole = await db.role.upsert({
    where: { name: "User" },
    update: {},
    create: {
      name: "User",
      description: "Basic user access",
      isSystem: true,
    },
  });

  const moderatorRole = await db.role.upsert({
    where: { name: "Moderator" },
    update: {},
    create: {
      name: "Moderator",
      description: "Moderate user access with some administrative capabilities",
      isSystem: false,
    },
  });

  console.log("✅ Created 3 roles");

  // Assign all permissions to Admin role
  console.log("Assigning permissions to Admin role...");
  const allPermissions = await db.permission.findMany();
  for (const permission of allPermissions) {
    await db.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: adminRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log(`✅ Assigned ${allPermissions.length} permissions to Admin role`);

  // Assign limited permissions to User role
  console.log("Assigning permissions to User role...");
  const userPermissions = await db.permission.findMany({
    where: {
      OR: [
        { resource: "dashboard", action: "read" },
        { resource: "users", action: "read" },
      ],
    },
  });
  for (const permission of userPermissions) {
    await db.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: userRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: userRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log(`✅ Assigned ${userPermissions.length} permissions to User role`);

  // Assign moderate permissions to Moderator role
  console.log("Assigning permissions to Moderator role...");
  const moderatorPermissions = await db.permission.findMany({
    where: {
      OR: [
        { resource: "users", action: "read" },
        { resource: "users", action: "update" },
        { resource: "dashboard", action: "read" },
        { resource: "roles", action: "read" },
        { resource: "permissions", action: "read" },
      ],
    },
  });
  for (const permission of moderatorPermissions) {
    await db.rolePermission.upsert({
      where: {
        roleId_permissionId: {
          roleId: moderatorRole.id,
          permissionId: permission.id,
        },
      },
      update: {},
      create: {
        roleId: moderatorRole.id,
        permissionId: permission.id,
      },
    });
  }
  console.log(`✅ Assigned ${moderatorPermissions.length} permissions to Moderator role`);

  // Assign Admin role to the seeded user
  const adminUser = await db.user.findUnique({
    where: { email: "admin@stargan.id" },
  });

  if (adminUser) {
    await db.userRole.upsert({
      where: {
        userId_roleId: {
          userId: adminUser.id,
          roleId: adminRole.id,
        },
      },
      update: {},
      create: {
        userId: adminUser.id,
        roleId: adminRole.id,
      },
    });
    console.log("✅ Assigned Admin role to admin@stargan.id");
  }

  console.log("🎉 RBAC seeding completed!");
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());

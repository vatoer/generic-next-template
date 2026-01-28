import { auth } from "@/shared/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Icon } from "@iconify/react";

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }

  const user = session.user;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Welcome back, <span className="font-semibold text-foreground">{user.name}</span>!
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Icon icon="lucide:users" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,543</div>
            <p className="text-xs text-muted-foreground">+180 this month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Roles</CardTitle>
            <Icon icon="lucide:shield-check" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">3 system roles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
            <Icon icon="lucide:key" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">Across all resources</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Icon icon="lucide:activity" className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">Uptime this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Welcome Card */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>
              Learn how to use the dashboard and manage your system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex gap-3">
                <Icon icon="lucide:check-circle-2" className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">RBAC System</p>
                  <p className="text-sm text-muted-foreground">
                    Manage roles, permissions, and user access
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Icon icon="lucide:check-circle-2" className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">User Management</p>
                  <p className="text-sm text-muted-foreground">
                    Create and manage application users
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Icon icon="lucide:check-circle-2" className="h-5 w-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium text-sm">Settings</p>
                  <p className="text-sm text-muted-foreground">
                    Configure your application settings
                  </p>
                </div>
              </div>
            </div>
            <Button className="w-full" asChild>
              <a href="/rbac">Go to RBAC</a>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Common tasks and shortcuts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start">
              <Icon icon="lucide:user-plus" className="mr-2 h-4 w-4" />
              Create New User
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Icon icon="lucide:shield" className="mr-2 h-4 w-4" />
              Create New Role
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Icon icon="lucide:settings" className="mr-2 h-4 w-4" />
              System Settings
            </Button>
            <Button variant="outline" className="w-full justify-start">
              <Icon icon="lucide:help-circle" className="mr-2 h-4 w-4" />
              View Documentation
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Info Section */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon icon="lucide:info" className="h-5 w-5" />
            About This System
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This is a fully functional RBAC (Role-Based Access Control) system with a modern, responsive interface.
            All features are ready to use including user management, role assignment, and permission control.
            Navigate through the sidebar menu to explore different sections of the application.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
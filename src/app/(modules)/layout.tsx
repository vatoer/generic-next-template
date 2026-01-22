import { auth } from "@/utils/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { AuthLayoutProvider } from "@/modules/layout/components";
import { LayoutQueryClientProvider } from "@/modules/layout/components/query-client-provider";

export default async function ModulesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/login");
  }

  const user = {
    id: session.user.id || "",
    name: session.user.name,
    email: session.user.email || "",
    image: session.user.image,
  };

  return (
    <LayoutQueryClientProvider>
      <AuthLayoutProvider user={user}>
        {children}
      </AuthLayoutProvider>
    </LayoutQueryClientProvider>
  );
}

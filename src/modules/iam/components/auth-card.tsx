"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SocialLogin } from "./social-login";
import { LoginForm } from "./login-form";
import { authClient } from "@/utils/auth-client";
import { useRouter, useSearchParams } from "next/navigation";

interface AuthCardProps {
  title: string;
  description?: string;
  className?: string;
}

export function AuthCard({
  title,
  description,
  className,
}: AuthCardProps) {

    const router = useRouter();
 
  const handleSubmit = async (email: string, password: string) => {
    // Default login logic - to be implemented with Better Auth
    console.log("Login attempt:", { email, password });
    // Simulate API call
    // await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
        const {data, error} = await authClient.signIn.email({ 
            email: email, // required
            password: password, // required
            rememberMe: true,
            // callbackURL: "https://example.com/callback",
         });
        if (error) {
          // console.error('Error during sign-in:', error);
        } else {
          console.log('Sign-in successful:', data);
          // Redirect or update UI as needed
            router.push("/");
        }
    } catch (error) {
      console.error(error);
    }
  };
    
  return (
    <Card className={cn("w-full max-w-md", className)}>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold tracking-tight">
          {title}
        </CardTitle>
        {description && (
          <CardDescription className="text-muted-foreground">
            {description}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <LoginForm onSubmit={handleSubmit} />
          <SocialLogin providers={["google", "github"]} />
        </div>
      </CardContent>
    </Card>
  );
}

import { ComponentProps, ReactNode } from "react";
import {
  SignUpButton as ClerkSignUpButton,
  SignOutButton as ClerkSignOutButton,
  SignInButton as ClerkSignInButton,
} from "@clerk/nextjs";
import { Button } from "@/components/ui/button";

export function SignOutButton({
  children = <Button>Sign Out</Button>,
  ...props
}: ComponentProps<typeof ClerkSignOutButton>) {
  return <ClerkSignOutButton {...props}>{children}</ClerkSignOutButton>;
}
export function SignUpButton({
  children = <Button>Sign Up</Button>,
  ...props
}: ComponentProps<typeof ClerkSignUpButton>) {
  return <ClerkSignUpButton {...props}>{children}</ClerkSignUpButton>;
}
export function SignInButton({
  children = <Button>Sign In</Button>,
  ...props
}: ComponentProps<typeof ClerkSignInButton>) {
  return <ClerkSignInButton {...props}>{children}</ClerkSignInButton>;
}

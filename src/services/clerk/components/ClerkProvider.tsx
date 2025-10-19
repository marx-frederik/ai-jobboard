import {
  ClerkProvider as OriginalClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import { ReactNode } from "react";

export default function ClerkProvider({ children }: { children: ReactNode }) {
  return <OriginalClerkProvider>{children}</OriginalClerkProvider>;
}

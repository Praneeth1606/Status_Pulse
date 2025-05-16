import { Metadata } from "next";
import { SignIn } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "Sign In | Clerk Organizations",
  description: "Login to your account",
};

export default function SignInPage() {
  return <SignIn />;
}

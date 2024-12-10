import { Button } from "@/components/ui/button";
import { ClerkProvider, SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { useEffect } from "react";

  
export default async function Home() {

  const { userId }: { userId: string | null } = await auth();
  if (userId != null) redirect("/events")

  return (
    <div className="container text-center my-4 mx-auto">
      <h1 className="text-3xl mb-4">Home Page</h1>
      <div className="flex justify-center gap-2">
        <SignedOut>
        <SignInButton>
          <Button >SignIn</Button>
        </SignInButton>
          
        </SignedOut>
        <SignedIn>
          <Button>Sign Out</Button>
        </SignedIn>
        <UserButton/>
      </div>
    </div>
  );
}

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Button } from "./ui/button";
import { PenBox } from "lucide-react";
import UserMenu from "./user-menu";
import { createUser } from "@/lib/checkUser";
import CustomLoading from "./user-loading";

const Header = async () => {
  await createUser();

  return (
    <header className="container mx-auto ">
      <nav className="px-4 py-6 flex justify-between items-center">
        <Link href="/">
          <Image
            src={"/logo2.png"}
            alt="Zcrum logo"
            width={200}
            height={56}
            className="object-contain"
          />
        </Link>

        <div className="flex items-center gap-4">
          <Link href={"/project/create"}>
            <Button variant="destructive">
              <PenBox size={18} />
              <span className="hidden md:inline">Create project</span>
            </Button>
          </Link>

          <SignedOut>
            <SignInButton forceRedirectUrl="/onboarding">
              <Button variant="outline">Login</Button>
            </SignInButton>
          </SignedOut>

          <SignedIn>
            <UserMenu />
          </SignedIn>
        </div>
      </nav>
      <CustomLoading />
    </header>
  );
};

export default Header;

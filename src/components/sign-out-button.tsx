import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type SignOutButtonProps = {
  children?: ReactNode;
  className?: string;
};

export function SignOutButton({ children = "Logout", className }: SignOutButtonProps) {
  return (
    <form action="/auth/signout" method="post">
      <button type="submit" className={cn("cursor-pointer appearance-none border-0 bg-transparent p-0 text-inherit", className)}>
        {children}
      </button>
    </form>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  LogOut,
  ParkingSquare,
  User as UserIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuthStore();

  const pathname = usePathname();

  const linkStyles = (path: string) =>
    cn(
      "transition-colors hover:text-foreground/80",
      pathname === path ? "text-foreground" : "text-foreground/60"
    );

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <ParkingSquare className="h-6 w-6" />
            <span className="font-bold">ParkEasy</span>
          </Link>
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            {isAuthenticated && (
              <>
                <Link href="/" className={linkStyles("/")}>
                  Dashboard
                </Link>
                <Link
                  href="/reservations"
                  className={linkStyles("/reservations")}
                >
                  My Reservations
                </Link>
                {user?.role === "admin" && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className={cn(
                          "flex items-center gap-1 px-2 text-sm font-medium",
                          pathname.startsWith("/admin")
                            ? "text-foreground"
                            : "text-foreground/60"
                        )}
                      >
                        Admin <ChevronDown className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem asChild>
                        <Link href="/admin/users">User Management</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  asChild
                  className="flex items-center gap-2 px-2"
                >
                  <Link href="/profile">
                    <span className="hidden text-sm sm:inline-block">
                      {user?.name}
                    </span>
                    <UserIcon className="h-5 w-5" />
                  </Link>
                </Button>
                <Button variant="ghost" size="icon" onClick={logout}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

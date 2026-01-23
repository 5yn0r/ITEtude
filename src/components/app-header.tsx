"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Menu, User, Settings, LogOut, ArrowLeft } from "lucide-react";
import Link from 'next/link';
import { AppSidebar } from "./app-sidebar";
import { useAuth, useUser } from "@/firebase";
import { useRouter, usePathname } from "next/navigation";
import { signOut } from "@/firebase/auth/auth";

type AppHeaderProps = {
  title: string;
};

export function AppHeader({ title }: AppHeaderProps) {
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const isAdminSection = pathname.startsWith('/admin');

  const handleLogout = async () => {
    if (auth) {
      await signOut(auth);
      sessionStorage.removeItem('isAdminAuthenticated');
      router.push('/login');
    }
  };

  const handleAdminExit = () => {
    sessionStorage.removeItem('isAdminAuthenticated');
    router.push('/dashboard');
  };

  return (
    <header className="flex h-16 items-center justify-between gap-4 border-b bg-card px-4 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0 md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Ouvrir le menu de navigation</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="flex flex-col p-0">
            <SheetTitle className="sr-only">Menu de Navigation</SheetTitle>
            <SheetDescription className="sr-only">Navigation principale pour ITEtude.</SheetDescription>
            <AppSidebar />
          </SheetContent>
        </Sheet>
        <h1 className="text-xl font-semibold md:text-2xl font-headline">{title}</h1>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="secondary" size="icon" className="rounded-full">
            <Avatar>
              <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || "Utilisateur"} />
              <AvatarFallback>{user?.displayName?.charAt(0).toUpperCase() || 'U'}</AvatarFallback>
            </Avatar>
            <span className="sr-only">Ouvrir le menu utilisateur</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {isAdminSection && (
            <>
              <DropdownMenuItem onClick={handleAdminExit}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span>Quitter le mode admin</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </>
          )}
          <Link href="/profil" passHref>
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profil</span>
            </DropdownMenuItem>
          </Link>
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Déconnexion</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}

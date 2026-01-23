'use client'

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Home, BookOpen, Milestone, Shield, ChevronRight, MessageSquare, Cloud } from "lucide-react"
import { cn } from "@/lib/utils"
import { categories } from "@/lib/data"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { useAdmin } from "@/hooks/use-admin"

export function AppSidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { isAdmin } = useAdmin();

  const isActive = (path: string) => {
    return pathname === path || (path !== "/dashboard" && pathname.startsWith(path))
  }

  return (
    <div className={cn("bg-sidebar text-sidebar-foreground h-full", className)}>
      <div className="flex h-full max-h-screen flex-col">
        <div className="flex h-16 items-center border-b border-sidebar-border px-4 lg:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <Compass className="h-6 w-6 text-sidebar-primary" />
            <span className="text-lg">ITEtude</span>
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4 py-4">
            <Link
              href="/dashboard"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                isActive("/dashboard") ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
              )}
            >
              <Home className="h-4 w-4" />
              Mon tableau de bord
            </Link>
            
            <Collapsible defaultOpen={pathname.includes('/ressources')}>
              <CollapsibleTrigger asChild>
                <button
                  className={cn(
                    "flex items-center justify-between w-full gap-3 rounded-lg px-3 py-2 transition-all text-left",
                    pathname.includes('/ressources') ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-4 w-4" />
                    Ressources
                  </div>
                  <ChevronRight className="h-4 w-4 shrink-0 transition-transform duration-200 data-[state=open]:rotate-90" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent className="py-1 pl-8">
                <nav className="grid gap-1">
                  {categories.map((category) => (
                     <Link
                      key={category.id}
                      href={`/ressources/${category.slug}`}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 transition-all text-sm",
                        isActive(`/ressources/${category.slug}`) ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                      )}
                    >
                      {category.name}
                    </Link>
                  ))}
                </nav>
              </CollapsibleContent>
            </Collapsible>
            
            <Link
              href="/parcours"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                isActive("/parcours") ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
              )}
            >
              <Milestone className="h-4 w-4" />
              Parcours
            </Link>
            
            <Link
              href="/feedback"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                isActive("/feedback") ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
              )}
            >
              <MessageSquare className="h-4 w-4" />
              Donner un feedback
            </Link>
            
            {isAdmin && (
               <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-all mt-2 border-t pt-3 border-sidebar-border",
                  isActive("/admin") ? "bg-sidebar-accent text-sidebar-accent-foreground" : "hover:bg-sidebar-accent/50"
                )}
              >
                <Shield className="h-4 w-4" />
                Tableau de bord Admin
              </Link>
            )}
          </nav>
        </div>
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Compass className="h-6 w-6 text-sidebar-primary" />
            <span>ITEtude</span>
          </Link>
        </div>
      </div>
    </div>
  )
}

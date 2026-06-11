import { useAuth } from "@/features/auth/auth-provider";
import { useTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Search, Sun, Moon, LogOut } from "lucide-react";

interface TopbarProps {
  onOpenSearch: () => void;
}

export function Topbar({ onOpenSearch }: TopbarProps) {
  const { user, signOut } = useAuth();
  const { theme, toggle } = useTheme();

  const initials = user?.full_name
    ? user.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : (user?.username?.slice(0, 2).toUpperCase() ?? "AD");

  return (
    <header className="no-print sticky top-0 z-40 flex h-16 items-center justify-between border-b border-hairline bg-canvas px-lg">
      <button
        onClick={onOpenSearch}
        className="flex items-center gap-2 rounded-sm border border-hairline bg-canvas-soft px-3 py-1.5 text-body-sm text-mute hover:border-hairline-strong transition-colors max-w-xs w-64"
      >
        <Search className="h-4 w-4" />
        <span>Search...</span>
        <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 rounded border border-hairline bg-canvas px-1.5 text-caption font-mono text-mute">
          ⌘K
        </kbd>
      </button>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-sm px-2 py-1 hover:bg-canvas-soft transition-colors">
              <Avatar>
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <span className="text-body-sm text-ink hidden sm:block">
                {user?.full_name ?? user?.username}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut} className="text-error">
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

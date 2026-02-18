"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { CommandPalette } from "@/components/command-palette/command-palette";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { SkipLink } from "@/components/ui/skip-link";
import { useAuth } from "@/lib/auth-context";
import { useKeyboardShortcuts } from "@/lib/hooks/use-keyboard-shortcuts";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useKeyboardShortcuts();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div
        className="flex h-screen items-center justify-center"
        role="status"
        aria-label="Loading application"
      >
        <div className="border-brand-600 h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        <span className="sr-only">Loading...</span>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <SkipLink />

      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar />
      </div>

      {/* Mobile nav drawer */}
      <MobileNav />

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main id="main-content" className="flex-1 overflow-y-auto p-6" tabIndex={-1}>
          {children}
        </main>
      </div>

      {/* Command palette overlay */}
      <CommandPalette />

      {/* Keyboard shortcuts help */}
      <KeyboardShortcutsDialog />

      {/* Onboarding for new users */}
      <OnboardingWizard />
    </div>
  );
}

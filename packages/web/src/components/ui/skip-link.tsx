"use client";

export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="fixed left-2 top-2 z-[100] -translate-y-20 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-transform focus:translate-y-0"
    >
      Skip to main content
    </a>
  );
}

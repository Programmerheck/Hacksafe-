import { Sidebar } from '@/components/Sidebar';

/**
 * Shared shell for authenticated SIEM pages (/dashboard, /logs, etc.)
 * Route tree: app → (shell) → [page]
 */
export default function ShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#05070f] font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-y-auto min-w-0">{children}</div>
    </div>
  );
}

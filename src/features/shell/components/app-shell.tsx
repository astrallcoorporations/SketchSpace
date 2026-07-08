import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from '@/features/shell/components/sidebar'
import { Topbar } from '@/features/shell/components/topbar'

export function AppShellLayout({ children }: { children?: ReactNode }) {
  return (
    <div className="flex min-h-svh">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar />
        <main className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          {children ?? <Outlet />}
        </main>
      </div>
    </div>
  )
}

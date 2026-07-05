import { lazy, Suspense } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { RouteLoader } from '@/components/layout/route-loader'
import { ProtectedRoute } from '@/components/layout/protected-route'

// Route-level code splitting: every top-level page is its own chunk.
const LandingPage = lazy(() => import('@/pages/landing-page'))
const LoginPage = lazy(() => import('@/pages/login-page'))
const SignupPage = lazy(() => import('@/pages/signup-page'))
const ForgotPasswordPage = lazy(() => import('@/pages/forgot-password-page'))
const ResetPasswordPage = lazy(() => import('@/pages/reset-password-page'))
const AppShellLayout = lazy(() => import('@/pages/app-shell-layout'))
const StudioPage = lazy(() => import('@/pages/studio-page'))
const GrowthPage = lazy(() => import('@/pages/growth-page'))
const PortfolioPage = lazy(() => import('@/pages/portfolio-page'))
const ProjectsPage = lazy(() => import('@/pages/projects-page'))
const CommunityPage = lazy(() => import('@/pages/community-page'))
const QuestsPage = lazy(() => import('@/pages/quests-page'))
const NotificationsPage = lazy(() => import('@/pages/notifications-page'))
const SettingsPage = lazy(() => import('@/pages/settings-page'))
const NotFoundPage = lazy(() => import('@/pages/not-found-page'))

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<RouteLoader />}>{node}</Suspense>
}

const router = createBrowserRouter([
  { path: '/', element: withSuspense(<LandingPage />) },
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/signup', element: withSuspense(<SignupPage />) },
  { path: '/forgot-password', element: withSuspense(<ForgotPasswordPage />) },
  { path: '/reset-password', element: withSuspense(<ResetPasswordPage />) },
  {
    path: '/app',
    element: withSuspense(
      <ProtectedRoute>
        <AppShellLayout />
      </ProtectedRoute>,
    ),
    children: [
      { index: true, element: withSuspense(<StudioPage />) },
      { path: 'growth', element: withSuspense(<GrowthPage />) },
      { path: 'portfolio', element: withSuspense(<PortfolioPage />) },
      { path: 'projects', element: withSuspense(<ProjectsPage />) },
      { path: 'community', element: withSuspense(<CommunityPage />) },
      { path: 'quests', element: withSuspense(<QuestsPage />) },
      { path: 'notifications', element: withSuspense(<NotificationsPage />) },
      { path: 'settings', element: withSuspense(<SettingsPage />) },
    ],
  },
  { path: '*', element: withSuspense(<NotFoundPage />) },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

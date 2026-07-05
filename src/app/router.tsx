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
const AppPage = lazy(() => import('@/pages/app-page'))
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
        <AppPage />
      </ProtectedRoute>,
    ),
  },
  { path: '*', element: withSuspense(<NotFoundPage />) },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { RouteLoader } from '@/components/layout/route-loader'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { ErrorBoundary } from '@/components/layout/error-boundary'

// Route-level code splitting: every top-level page is its own chunk.
const LandingPage = lazy(() => import('@/pages/landing-page'))
const FeaturesPage = lazy(() => import('@/pages/features-page'))
const MarketingCommunityPage = lazy(() => import('@/pages/marketing-community-page'))
const PricingPage = lazy(() => import('@/pages/pricing-page'))
const LoginPage = lazy(() => import('@/pages/login-page'))
const SignupPage = lazy(() => import('@/pages/signup-page'))
const ForgotPasswordPage = lazy(() => import('@/pages/forgot-password-page'))
const ResetPasswordPage = lazy(() => import('@/pages/reset-password-page'))
const AppShellLayout = lazy(() => import('@/pages/app-shell-layout'))
const StudioPage = lazy(() => import('@/pages/studio-page'))
const GrowthPage = lazy(() => import('@/pages/growth-page'))
const PortfolioPage = lazy(() => import('@/pages/portfolio-page'))
const ArtworkDetailPage = lazy(() => import('@/pages/artwork-detail-page'))
const ProjectsPage = lazy(() => import('@/pages/projects-page'))
const CommunityFeedPage = lazy(() => import('@/pages/community-feed-page'))
const SharedFilesPage = lazy(() => import('@/pages/shared-files-page'))
const QuestsPage = lazy(() => import('@/pages/quests-page'))
const LearningHomePage = lazy(() => import('@/pages/learning-home-page'))
const LearningPathPage = lazy(() => import('@/pages/learning-path-page'))
const LessonPage = lazy(() => import('@/pages/lesson-page'))
const NotificationsPage = lazy(() => import('@/pages/notifications-page'))
const SettingsPage = lazy(() => import('@/pages/settings-page'))
const PublicProfilePage = lazy(() => import('@/pages/public-profile-page'))
const NotFoundPage = lazy(() => import('@/pages/not-found-page'))

function withProtection(node: React.ReactNode) {
  return (
    <ProtectedRoute>
      <ErrorBoundary>{node}</ErrorBoundary>
    </ProtectedRoute>
  )
}

function withSuspense(node: React.ReactNode) {
  return <Suspense fallback={<RouteLoader />}>{node}</Suspense>
}

const router = createBrowserRouter([
  { path: '/', element: withSuspense(<LandingPage />) },
  { path: '/features', element: withSuspense(<FeaturesPage />) },
  { path: '/community', element: withSuspense(<MarketingCommunityPage />) },
  { path: '/pricing', element: withSuspense(<PricingPage />) },
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/signup', element: withSuspense(<SignupPage />) },
  { path: '/forgot-password', element: withSuspense(<ForgotPasswordPage />) },
  { path: '/reset-password', element: withSuspense(<ResetPasswordPage />) },
  // Legacy /app path — redirect to root
  { path: '/app', element: <Navigate to="/" replace /> },
  {
    path: '/',
    element: withSuspense(withProtection(<AppShellLayout />)),
    children: [
      { index: true, element: withSuspense(<StudioPage />) },
      { path: 'homepage', element: withSuspense(<CommunityFeedPage />) },
      { path: 'growth', element: withSuspense(<GrowthPage />) },
      { path: 'portfolio', element: withSuspense(<PortfolioPage />) },
      { path: 'artwork/:id', element: withSuspense(<ArtworkDetailPage />) },
      { path: 'projects', element: withSuspense(<ProjectsPage />) },
      { path: 'shared-files', element: withSuspense(<SharedFilesPage />) },
      { path: 'quests', element: withSuspense(<QuestsPage />) },
      { path: 'learning', element: withSuspense(<LearningHomePage />) },
      { path: 'learning/:pathSlug', element: withSuspense(<LearningPathPage />) },
      { path: 'learning/lesson/:lessonId', element: withSuspense(<LessonPage />) },
      { path: 'notifications', element: withSuspense(<NotificationsPage />) },
      { path: 'settings', element: withSuspense(<SettingsPage />) },
      { path: 'u/:username', element: withSuspense(<PublicProfilePage />) },
    ],
  },
  { path: '*', element: withSuspense(<NotFoundPage />) },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

import { lazy, Suspense } from 'react'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom'
import { RouteLoader } from '@/components/layout/route-loader'
import { ProtectedRoute } from '@/components/layout/protected-route'
import { ErrorBoundary } from '@/components/layout/error-boundary'
import { AppShellLayout } from '@/features/shell/components/app-shell'

// Route-level code splitting: every top-level page is its own chunk.
const LandingPage = lazy(() => import('@/pages/landing-page'))
const FeaturesPage = lazy(() => import('@/pages/features-page'))
const MarketingCommunityPage = lazy(() => import('@/pages/marketing-community-page'))
const PricingPage = lazy(() => import('@/pages/pricing-page'))
const ContactPage = lazy(() => import('@/pages/contact-page'))
const LoginPage = lazy(() => import('@/pages/login-page'))
const SignupPage = lazy(() => import('@/pages/signup-page'))
const ForgotPasswordPage = lazy(() => import('@/pages/forgot-password-page'))
const ResetPasswordPage = lazy(() => import('@/pages/reset-password-page'))
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

function AppPage({ children }: { children: React.ReactNode }) {
  return withProtection(
    <AppShellLayout>
      <Suspense fallback={<RouteLoader />}>{children}</Suspense>
    </AppShellLayout>,
  )
}

const router = createBrowserRouter([
  // Public pages
  { path: '/', element: withSuspense(<LandingPage />) },
  { path: '/features', element: withSuspense(<FeaturesPage />) },
  { path: '/community', element: withSuspense(<MarketingCommunityPage />) },
  { path: '/pricing', element: withSuspense(<PricingPage />) },
  { path: '/contact', element: withSuspense(<ContactPage />) },
  { path: '/login', element: withSuspense(<LoginPage />) },
  { path: '/signup', element: withSuspense(<SignupPage />) },
  { path: '/forgot-password', element: withSuspense(<ForgotPasswordPage />) },
  { path: '/reset-password', element: withSuspense(<ResetPasswordPage />) },

  // Legacy /app path — redirect to studio
  { path: '/app', element: <Navigate to="/studio" replace /> },

  // Protected app routes — each wrapped with AppShellLayout (sidebar + topbar)
  { path: '/studio', element: <AppPage><StudioPage /></AppPage> },
  { path: '/homepage', element: <AppPage><CommunityFeedPage /></AppPage> },
  { path: '/growth', element: <AppPage><GrowthPage /></AppPage> },
  { path: '/portfolio', element: <AppPage><PortfolioPage /></AppPage> },
  { path: '/artwork/:id', element: <AppPage><ArtworkDetailPage /></AppPage> },
  { path: '/projects', element: <AppPage><ProjectsPage /></AppPage> },
  { path: '/shared-files', element: <AppPage><SharedFilesPage /></AppPage> },
  { path: '/quests', element: <AppPage><QuestsPage /></AppPage> },
  { path: '/learning', element: <AppPage><LearningHomePage /></AppPage> },
  { path: '/learning/:pathSlug', element: <AppPage><LearningPathPage /></AppPage> },
  { path: '/learning/lesson/:lessonId', element: <AppPage><LessonPage /></AppPage> },
  { path: '/notifications', element: <AppPage><NotificationsPage /></AppPage> },
  { path: '/settings', element: <AppPage><SettingsPage /></AppPage> },
  { path: '/u/:username', element: <AppPage><PublicProfilePage /></AppPage> },

  { path: '*', element: withSuspense(<NotFoundPage />) },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}

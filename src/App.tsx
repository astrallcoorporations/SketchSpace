import { AppProviders } from '@/app/providers'
import { AppRouter } from '@/app/router'
import { StaleDeployBoundary } from '@/components/layout/stale-deploy-boundary'
import { AuthProvider } from '@/hooks/use-auth'

function App() {
  return (
    <StaleDeployBoundary>
      <AuthProvider>
        <AppProviders>
          <AppRouter />
        </AppProviders>
      </AuthProvider>
    </StaleDeployBoundary>
  )
}

export default App

import { AppProviders } from '@/app/providers'
import { AppRouter } from '@/app/router'
import { AuthProvider } from '@/hooks/use-auth'

function App() {
  return (
    <AuthProvider>
      <AppProviders>
        <AppRouter />
      </AppProviders>
    </AuthProvider>
  )
}

export default App

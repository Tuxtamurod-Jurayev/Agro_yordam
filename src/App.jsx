import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './layouts/AppShell'
import { ProtectedRoute } from './components/ProtectedRoute'

const AuthPage = lazy(() =>
  import('./pages/AuthPage').then((module) => ({ default: module.AuthPage })),
)
const AccountPage = lazy(() =>
  import('./pages/AccountPage').then((module) => ({ default: module.AccountPage })),
)
const AdminUsersPage = lazy(() =>
  import('./pages/AdminUsersPage').then((module) => ({ default: module.AdminUsersPage })),
)
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })),
)
const HistoryPage = lazy(() =>
  import('./pages/HistoryPage').then((module) => ({ default: module.HistoryPage })),
)
const HomePage = lazy(() =>
  import('./pages/HomePage').then((module) => ({ default: module.HomePage })),
)
const ResultPage = lazy(() =>
  import('./pages/ResultPage').then((module) => ({ default: module.ResultPage })),
)
const ScanPage = lazy(() =>
  import('./pages/ScanPage').then((module) => ({ default: module.ScanPage })),
)

function NotFoundPage() {
  return <Navigate to="/" replace />
}

function App() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
          <div className="glass-panel px-6 py-4">Sahifa yuklanmoqda...</div>
        </div>
      }
    >
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <AccountPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/scan"
            element={
              <ProtectedRoute>
                <ScanPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/results/:scanId"
            element={
              <ProtectedRoute>
                <ResultPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/history"
            element={
              <ProtectedRoute>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requireAdmin>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <AdminUsersPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </Suspense>
  )
}

export default App

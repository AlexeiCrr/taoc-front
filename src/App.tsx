import { lazy, Suspense, useEffect } from 'react'
import {
	BrowserRouter,
	Navigate,
	Route,
	Routes,
	useLocation,
} from 'react-router-dom'
import { Toaster } from 'sonner'
import './App.css'
import { PageTransition } from './components/common/PageTransition'
import { LanguageProvider } from './components/LanguageProvider'
import { PostHogProvider } from './components/PostHogProvider'
import useAuthStore from './stores/authStore'

// Lazy load admin components (only loaded when admin routes are accessed)
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const ProtectedRoute = lazy(() => import('./components/ProtectedRoute'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Statistics = lazy(() => import('./pages/Statistics'))
const ResponseDetail = lazy(() => import('./pages/ResponseDetail'))
const Admin = lazy(() => import('./pages/Admin'))

// Lazy load quiz components (only loaded when quiz routes are accessed)
const Home = lazy(() => import('./pages/Home'))
const QuizStart = lazy(() => import('./pages/QuizStart'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Results = lazy(() => import('./pages/Results').then(module => ({ default: module.Results })))
const PDFPreview = lazy(() => import('./pages/PDFPreview'))
const PostHogTest = lazy(() => import('./pages/PostHogTest'))

// Loading fallback component
function PageLoader() {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-muted-foreground">Loading...</div>
		</div>
	)
}

function AnimatedRoutes() {
	const location = useLocation()

	return (
		<PageTransition>
			<Suspense fallback={<PageLoader />}>
				<Routes location={location} key={location.pathname}>
					<Route path="/" element={<Home />} />
					<Route path="/quiz-start" element={<QuizStart />} />
					<Route path="/quiz" element={<Quiz />} />
					<Route path="/results" element={<Results />} />
					<Route path="/pdf-preview" element={<PDFPreview />} />
					<Route path="/posthog-test" element={<PostHogTest />} />
					<Route path="/admin" element={<Admin />} />
					<Route
						path="/dashboard"
						element={
							<ProtectedRoute>
								<AdminLayout>
									<Dashboard />
								</AdminLayout>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/dashboard/statistics"
						element={
							<ProtectedRoute>
								<AdminLayout>
									<Statistics />
								</AdminLayout>
							</ProtectedRoute>
						}
					/>
					<Route
						path="/response/:id"
						element={
							<ProtectedRoute>
								<AdminLayout>
									<ResponseDetail />
								</AdminLayout>
							</ProtectedRoute>
						}
					/>
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Suspense>
		</PageTransition>
	)
}

function App() {
	const initializeAuth = useAuthStore((state) => state.initializeAuth)

	useEffect(() => {
		initializeAuth()
	}, [initializeAuth])

	return (
		<LanguageProvider>
			<BrowserRouter>
				<PostHogProvider>
					<AnimatedRoutes />
				</PostHogProvider>
			</BrowserRouter>
			<Toaster position="top-right" richColors closeButton duration={4000} />
		</LanguageProvider>
	)
}

export default App

import { useEffect } from 'react'
import {
	BrowserRouter,
	Navigate,
	Route,
	Routes,
	useLocation,
} from 'react-router-dom'
import { Toaster } from 'sonner'
import './App.css'
import AdminLayout from './components/admin/AdminLayout'
import { PageTransition } from './components/common/PageTransition'
import { LanguageProvider } from './components/LanguageProvider'
import { PostHogProvider } from './components/PostHogProvider'
import ProtectedRoute from './components/ProtectedRoute'
import Admin from './pages/Admin'
import Dashboard from './pages/Dashboard'
import Home from './pages/Home'
import PDFPreview from './pages/PDFPreview'
import PostHogTest from './pages/PostHogTest'
import Quiz from './pages/Quiz'
import QuizStart from './pages/QuizStart'
import ResponseDetail from './pages/ResponseDetail'
import { Results } from './pages/Results'
import Statistics from './pages/Statistics'
import useAuthStore from './stores/authStore'

function AnimatedRoutes() {
	const location = useLocation()

	return (
		<PageTransition>
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
		</PageTransition>
	)
}

function App() {
	const initializeAuth = useAuthStore((state) => state.initializeAuth)

	useEffect(() => {
		console.log('initializingauth')

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

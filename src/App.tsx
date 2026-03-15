import { lazy, Suspense } from 'react'
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
import LocaleLayout from './components/LocaleLayout'
import EnglishRedirect from './components/EnglishRedirect'
import { deLocalizeHref } from './paraglide/runtime'
import * as m from './paraglide/messages'

// Lazy load quiz components (only loaded when quiz routes are accessed)
const Home = lazy(() => import('./pages/Home'))
const QuizStart = lazy(() => import('./pages/QuizStart'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Results = lazy(() =>
	import('./pages/Results').then((module) => ({ default: module.Results }))
)
const UpgradeSuccess = lazy(() => import('./pages/UpgradeSuccess'))
const UpgradeCancel = lazy(() => import('./pages/UpgradeCancel'))
const PDFPreview = lazy(() => import('./pages/PDFPreview'))
const PostHogTest = lazy(() => import('./pages/PostHogTest'))
const EmailResults = lazy(() => import('./pages/EmailResults'))

// Loading fallback component
function PageLoader() {
	return (
		<div className="flex items-center justify-center min-h-screen">
			<div className="text-muted-foreground">{m['common.loading']()}</div>
		</div>
	)
}

function publicRoutes() {
	return (
		<>
			<Route index element={<Home />} />
			<Route path="quiz-start" element={<QuizStart />} />
			<Route path="quiz" element={<Quiz />} />
			<Route path="results" element={<Results />} />
			<Route path="upgrade/success" element={<UpgradeSuccess />} />
			<Route path="upgrade/cancel" element={<UpgradeCancel />} />
			<Route path="pdf-preview" element={<PDFPreview />} />
			<Route path="posthog-test" element={<PostHogTest />} />
			<Route path="results/:token" element={<EmailResults />} />
		</>
	)
}

function AnimatedRoutes() {
	const location = useLocation()

	return (
		<PageTransition>
			<Suspense fallback={<PageLoader />}>
				<Routes location={location} key={deLocalizeHref(location.pathname)}>
					<Route path="/es" element={<LocaleLayout />}>
						{publicRoutes()}
					</Route>

					<Route path="/en/*" element={<EnglishRedirect />} />

					<Route element={<LocaleLayout />}>
						<Route path="/" element={<Home />} />
						<Route path="/quiz-start" element={<QuizStart />} />
						<Route path="/quiz" element={<Quiz />} />
						<Route path="/results" element={<Results />} />
						<Route path="/upgrade/success" element={<UpgradeSuccess />} />
						<Route path="/upgrade/cancel" element={<UpgradeCancel />} />
						<Route path="/pdf-preview" element={<PDFPreview />} />
						<Route path="/posthog-test" element={<PostHogTest />} />
					<Route path="/results/:token" element={<EmailResults />} />
					</Route>

					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Suspense>
		</PageTransition>
	)
}

function App() {
	return (
		<BrowserRouter>
			<LanguageProvider>
				<PostHogProvider>
					<AnimatedRoutes />
				</PostHogProvider>
			</LanguageProvider>
			<Toaster position="top-right" richColors closeButton duration={4000} />
		</BrowserRouter>
	)
}

export default App

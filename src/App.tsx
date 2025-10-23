import {
	BrowserRouter,
	Navigate,
	Route,
	Routes,
	useLocation,
} from 'react-router-dom'
import { Toaster } from 'sonner'
import './App.css'
import { LanguageProvider } from './components/LanguageProvider'
import { PageTransition } from './components/common/PageTransition'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import QuizStart from './pages/QuizStart'
import { Results } from './pages/Results'

function AnimatedRoutes() {
	const location = useLocation()

	return (
		<PageTransition>
			<Routes location={location} key={location.pathname}>
				<Route path="/" element={<Home />} />
				<Route path="/quiz-start" element={<QuizStart />} />
				<Route path="/quiz" element={<Quiz />} />
				<Route path="/results" element={<Results />} />
				<Route path="*" element={<Navigate to="/" replace />} />
			</Routes>
		</PageTransition>
	)
}

function App() {
	return (
		<LanguageProvider>
			<BrowserRouter>
				<AnimatedRoutes />
			</BrowserRouter>
			<Toaster position="top-right" richColors closeButton duration={4000} />
		</LanguageProvider>
	)
}

export default App

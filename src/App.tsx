import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import './App.css'
import { LanguageProvider } from './components/LanguageProvider'
import Home from './pages/Home'
import Quiz from './pages/Quiz'
import QuizStart from './pages/QuizStart'
// import Admin from './pages/Admin';
// import Response from './pages/Response';

function App() {
	return (
		<LanguageProvider>
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/quiz-start" element={<QuizStart />} />
					<Route path="/quiz" element={<Quiz />} />
					{/* <Route 
            path="/admin" 
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            } 
           /> */}
					{/* <Route 
            path="/response/:id" 
            element={
              <ProtectedRoute>
                <Response />
              </ProtectedRoute>
            } 
          /> */}
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</BrowserRouter>
			<Toaster position="top-right" richColors closeButton duration={4000} />
		</LanguageProvider>
	)
}

export default App

import { Amplify } from 'aws-amplify'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import cognitoConfig from './config/cognito'
import './styles/index.css'

// Initialize AWS Amplify before app renders
Amplify.configure(cognitoConfig)

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<App />
	</StrictMode>
)

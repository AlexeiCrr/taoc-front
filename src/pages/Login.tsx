import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { AlertCircle, Eye, EyeOff, KeyRound } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ThemeProvider } from '@/components/ThemeProvider'
import useAuthStore from '@/stores/authStore'

const PASSWORD_REQUIREMENTS = [
	{ label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
	{
		label: 'At least one uppercase letter',
		test: (p: string) => /[A-Z]/.test(p),
	},
	{
		label: 'At least one lowercase letter',
		test: (p: string) => /[a-z]/.test(p),
	},
	{ label: 'At least one number', test: (p: string) => /\d/.test(p) },
	{
		label: 'At least one special character (!@#$%^&*)',
		test: (p: string) => /[!@#$%^&*(),.?":{}|<>]/.test(p),
	},
]

interface PasswordInputProps {
	id: string
	value: string
	onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
	placeholder: string
	disabled?: boolean
	required?: boolean
}

function PasswordInput({
	id,
	value,
	onChange,
	placeholder,
	disabled,
	required,
}: PasswordInputProps) {
	const [showPassword, setShowPassword] = useState(false)

	return (
		<div className="relative">
			<Input
				id={id}
				type={showPassword ? 'text' : 'password'}
				placeholder={placeholder}
				value={value}
				onChange={onChange}
				required={required}
				disabled={disabled}
				className="pr-10"
			/>
			<button
				type="button"
				className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground transition-colors"
				onMouseDown={() => setShowPassword(true)}
				onMouseUp={() => setShowPassword(false)}
				onMouseLeave={() => setShowPassword(false)}
				onTouchStart={() => setShowPassword(true)}
				onTouchEnd={() => setShowPassword(false)}
				tabIndex={-1}
				aria-label={showPassword ? 'Hide password' : 'Show password'}
			>
				{showPassword ? (
					<EyeOff className="h-4 w-4" />
				) : (
					<Eye className="h-4 w-4" />
				)}
			</button>
		</div>
	)
}

export default function Login() {
	const navigate = useNavigate()
	const {
		login,
		completeNewPassword,
		signOut,
		isLoading,
		error,
		clearError,
		needsNewPassword,
		sessionExpired,
	} = useAuthStore()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [passwordError, setPasswordError] = useState('')

	useEffect(() => {
		if (sessionExpired) {
			useAuthStore.setState({ sessionExpired: false })
		}
	}, [sessionExpired])

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		clearError()

		try {
			await login(email, password)
			const state = useAuthStore.getState()
			if (!state.needsNewPassword) {
				if (state.isAdmin) {
					navigate('/dashboard')
				} else {
					// Non-admin user - logout immediately
					toast.error('Access denied. Admin privileges required.')
					await signOut()
				}
			}
		} catch {
			// Error is already set in the store
		}
	}

	const validatePassword = (password: string): string | null => {
		const failedRequirements = PASSWORD_REQUIREMENTS.filter(
			(req) => !req.test(password)
		)
		if (failedRequirements.length > 0) {
			return `Password must have: ${failedRequirements.map((r) => r.label.toLowerCase()).join(', ')}`
		}
		return null
	}

	const handleNewPasswordSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		clearError()
		setPasswordError('')

		if (newPassword !== confirmPassword) {
			setPasswordError('Passwords do not match')
			return
		}

		const validationError = validatePassword(newPassword)
		if (validationError) {
			setPasswordError(validationError)
			return
		}

		try {
			await completeNewPassword(newPassword)
			const state = useAuthStore.getState()
			if (state.isAdmin) {
				navigate('/dashboard')
			} else {
				// Non-admin user - logout immediately
				toast.error('Access denied. Admin privileges required.')
				await signOut()
			}
		} catch {
			// Error is already set in the store
		}
	}

	if (needsNewPassword) {
		return (
			<ThemeProvider defaultTheme="dark" storageKey="admin-theme">
				<div className="login-page min-h-screen flex items-center justify-center bg-background px-4">
					<Card className="set-password-card w-full max-w-md border border-border">
						<CardHeader className="space-y-1 text-center pb-6">
							<div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
								<KeyRound className="h-6 w-6 text-primary" />
						</div>
						<CardTitle className="text-2xl font-bold">
							Set New Password
						</CardTitle>
						<CardDescription className="text-base">
							Your temporary password has expired. Please create a new secure
							password to continue.
						</CardDescription>
					</CardHeader>
					<CardContent className="pt-6">
						<form onSubmit={handleNewPasswordSubmit} className="space-y-4">
							{(error || passwordError) && (
								<Alert variant="destructive">
									<AlertCircle className="h-4 w-4" />
									<AlertDescription>{error || passwordError}</AlertDescription>
								</Alert>
							)}

							<div className="space-y-2">
								<Label htmlFor="newPassword">New Password</Label>
								<PasswordInput
									id="newPassword"
									placeholder="Enter new password"
									value={newPassword}
									onChange={(e) => setNewPassword(e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirm Password</Label>
								<PasswordInput
									id="confirmPassword"
									placeholder="Confirm new password"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>

							<div className="bg-muted/50 rounded-lg p-4 space-y-2">
								<p className="text-sm font-medium text-muted-foreground mb-2">
									Password requirements:
								</p>
								<ul className="space-y-1">
									{PASSWORD_REQUIREMENTS.map((req, index) => {
										const passed = req.test(newPassword)
										return (
											<li
												key={index}
												className={`text-sm flex items-center gap-2 ${
													newPassword
														? passed
															? 'text-green-500'
															: 'text-muted-foreground'
														: 'text-muted-foreground'
												}`}
											>
												<span
													className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
														newPassword
															? passed
																? 'bg-green-500/20 text-green-500'
																: 'bg-muted text-muted-foreground'
															: 'bg-muted text-muted-foreground'
													}`}
												>
													{newPassword && passed ? '✓' : '○'}
												</span>
												{req.label}
											</li>
										)
									})}
								</ul>
							</div>

							{confirmPassword && (
								<div
									className={`text-sm flex items-center gap-2 ${
										newPassword === confirmPassword
											? 'text-green-500'
											: 'text-destructive'
									}`}
								>
									<span
										className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
											newPassword === confirmPassword
												? 'bg-green-500/20 text-green-500'
												: 'bg-destructive/10 text-destructive'
										}`}
									>
										{newPassword === confirmPassword ? '✓' : '✗'}
									</span>
									{newPassword === confirmPassword
										? 'Passwords match'
										: 'Passwords do not match'}
								</div>
							)}

							<Button type="submit" className="w-full" disabled={isLoading}>
								{isLoading ? 'Setting password...' : 'Set Password & Continue'}
							</Button>
						</form>
					</CardContent>
				</Card>
			</div>
			</ThemeProvider>
		)
	}

	return (
		<ThemeProvider defaultTheme="dark" storageKey="admin-theme">
			<div className="login-page min-h-screen flex items-center justify-center bg-background px-4">
				<Card className="login-card w-full max-w-md border border-border">
					<CardHeader className="space-y-1 text-center">
						<CardTitle className="text-2xl font-bold">
							Admin Dashboard
						</CardTitle>
					<CardDescription>
						Sign in to access the admin dashboard
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleSubmit} className="space-y-4">
						{sessionExpired && (
							<Alert>
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									Your session expired. Please sign in again.
								</AlertDescription>
							</Alert>
						)}

						{error && (
							<Alert variant="destructive">
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>{error}</AlertDescription>
							</Alert>
						)}

						<div className="space-y-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								type="email"
								placeholder="you@example.com"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								disabled={isLoading}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="password">Password</Label>
							<PasswordInput
								id="password"
								placeholder="Enter your password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								required
								disabled={isLoading}
							/>
						</div>

						<Button type="submit" className="w-full" disabled={isLoading}>
							{isLoading ? 'Signing in...' : 'Sign in'}
						</Button>
					</form>
				</CardContent>
			</Card>
		</div>
		</ThemeProvider>
	)
}

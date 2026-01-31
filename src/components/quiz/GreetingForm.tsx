import QuizButton from '@/components/quiz/QuizButton'
import {
	type ChangeEvent,
	type FormEvent,
	useEffect,
	useRef,
	useState,
} from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import * as m from '../../paraglide/messages'
import { validateLicenseCode } from '../../services/licenseApi'

interface GreetingFormProps {
	onSubmit: (data: FormData) => void
}

interface FormData {
	licenseCode: string
	firstName: string
	lastName: string
	email: string
	agreeToEmail: boolean
	licenseTier?: number
}

const GreetingForm = ({ onSubmit }: GreetingFormProps) => {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const [formData, setFormData] = useState<FormData>({
		licenseCode: '',
		firstName: '',
		lastName: '',
		email: '',
		agreeToEmail: false,
	})

	const [errors, setErrors] = useState<Partial<FormData>>({})
	const [licenseStatus, setLicenseStatus] = useState<
		'idle' | 'loading' | 'valid' | 'invalid'
	>('idle')
	const [licenseMessage, setLicenseMessage] = useState<string>('')
	const [isLicenseError, setIsLicenseError] = useState<boolean>(false)
	const validationTimeoutRef = useRef<NodeJS.Timeout | null>(null)

	const isFormValid = () => {
		return (
			licenseStatus === 'valid' &&
			formData.licenseCode.trim() !== '' &&
			formData.firstName.trim() !== '' &&
			formData.lastName.trim() !== '' &&
			formData.email.trim() !== '' &&
			formData.agreeToEmail
		)
	}

	// Track the original URL license code to know if we're dealing with the initial URL value
	const urlLicenseCode = searchParams.get('licenseKey')

	// Effect to check for and remove malformed license key parameters
	useEffect(() => {
		if (
			urlLicenseCode &&
			(urlLicenseCode.length > 6 || urlLicenseCode.includes(','))
		) {
			// Remove the malformed licenseKey parameter from the URL without page reload
			const newSearchParams = new URLSearchParams(searchParams.toString())
			newSearchParams.delete('licenseKey')

			// Navigate to the same route but without the licenseKey parameter
			navigate({ search: newSearchParams.toString() }, { replace: true })
		}
	}, [urlLicenseCode, searchParams, navigate])

	const [hasCheckedUrlLicense, setHasCheckedUrlLicense] = useState(false)

	// Don't process the URL license if it's malformed
	const isValidLicenseCode =
		!urlLicenseCode ||
		(urlLicenseCode.length === 6 && !urlLicenseCode.includes(','))

	// Effect to handle auto-validation when licenseKey is in URL - only runs once
	useEffect(() => {
		if (
			urlLicenseCode &&
			urlLicenseCode.length === 6 &&
			!hasCheckedUrlLicense &&
			isValidLicenseCode
		) {
			setHasCheckedUrlLicense(true)

			// Validate the license from URL immediately
			const validateUrlLicense = async () => {
				setLicenseStatus('loading') // Set loading state for URL validation
				const result = await validateLicenseCode(urlLicenseCode)

				if (result && result.isValid) {
					setLicenseStatus('valid')
					setIsLicenseError(false)
					setErrors((prev) => ({ ...prev, licenseCode: undefined }))
					setFormData((prev) => ({
						...prev,
						licenseCode: urlLicenseCode, // Make sure form data has the validated code
						licenseTier: result.licenseTier,
					}))
					setLicenseMessage(result.message || '')
				} else {
					setLicenseStatus('invalid')
					setIsLicenseError(result.isError)

					// Use different messages based on whether it's an error or invalid license
					const errorMessage = result.isError
						? m['quiz.greeting.validation.licenseError']()
						: m['quiz.greeting.validation.licenseInvalid']()

					setLicenseMessage(errorMessage)
					// Set the form data with the invalid license code so it shows in the input field
					setFormData((prev) => ({
						...prev,
						licenseCode: urlLicenseCode, // Show the invalid license code in the input
					}))
					setErrors((prev) => ({
						...prev,
						licenseCode: errorMessage,
					}))
				}
			}

			validateUrlLicense()
		} else if (!urlLicenseCode && !hasCheckedUrlLicense) {
			// If there's no URL license code, mark as checked so manual validation can work
			setHasCheckedUrlLicense(true)
		}
	}, [urlLicenseCode, hasCheckedUrlLicense, navigate, isValidLicenseCode]) // Add navigate to dependency array

	// Effect for manual license validation - only runs when form data changes from user input
	useEffect(() => {
		if (!hasCheckedUrlLicense) return

		if (urlLicenseCode && formData.licenseCode === urlLicenseCode) return

		if (validationTimeoutRef.current) {
			clearTimeout(validationTimeoutRef.current)
		}

		if (formData.licenseCode.length < 6) {
			setLicenseStatus('idle')
			setLicenseMessage('')
			setIsLicenseError(false)
			return
		}

		if (formData.licenseCode.length === 6) {
			setLicenseStatus('loading')

			validationTimeoutRef.current = setTimeout(async () => {
				const result = await validateLicenseCode(formData.licenseCode)

				if (result && result.isValid) {
					setLicenseStatus('valid')
					setIsLicenseError(false)
					setErrors((prev) => ({ ...prev, licenseCode: undefined }))
					setLicenseMessage('')
					setFormData((prev) => ({
						...prev,
						licenseTier: result.licenseTier,
					}))
				} else {
					setLicenseStatus('invalid')
					setIsLicenseError(result.isError)

					const errorMessage = result.isError
						? m['quiz.greeting.validation.licenseError']()
						: m['quiz.greeting.validation.licenseInvalid']()

					setLicenseMessage(errorMessage)
					setErrors((prev) => ({
						...prev,
						licenseCode: errorMessage,
					}))
				}
			}, 500)
		}

		return () => {
			if (validationTimeoutRef.current) {
				clearTimeout(validationTimeoutRef.current)
			}
		}
	}, [formData.licenseCode, hasCheckedUrlLicense, urlLicenseCode])

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}))

		if (errors[name as keyof FormData]) {
			setErrors((prev) => ({ ...prev, [name]: undefined }))
		}

		// If user is manually changing the license code and it's different from URL,
		// remove the URL parameter to prevent conflicts
		if (name === 'licenseCode' && urlLicenseCode && value !== urlLicenseCode) {
			const newSearchParams = new URLSearchParams(searchParams.toString())
			newSearchParams.delete('licenseKey')
			navigate({ search: newSearchParams.toString() }, { replace: true })
		}
	}

	const validateForm = (): boolean => {
		const newErrors: Partial<FormData> = {}

		if (!formData.licenseCode.trim()) {
			newErrors.licenseCode = m['quiz.greeting.validation.licenseRequired']()
		} else if (licenseStatus === 'invalid') {
			if (isLicenseError) {
				newErrors.licenseCode = m['quiz.greeting.validation.licenseError']()
			} else {
				newErrors.licenseCode = m['quiz.greeting.validation.licenseInvalid']()
			}
		} else if (licenseStatus !== 'valid') {
			newErrors.licenseCode = m['quiz.greeting.validation.licenseRequired']()
		}

		if (!formData.firstName.trim()) {
			newErrors.firstName = m['quiz.greeting.validation.firstNameRequired']()
		}
		if (!formData.lastName.trim()) {
			newErrors.lastName = m['quiz.greeting.validation.lastNameRequired']()
		}
		if (!formData.email.trim()) {
			newErrors.email = m['quiz.greeting.validation.emailRequired']()
		} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
			newErrors.email = m['quiz.greeting.validation.emailInvalid']()
		}
		if (!formData.agreeToEmail) {
			newErrors.agreeToEmail = false
		}

		setErrors(newErrors)
		return Object.keys(newErrors).length === 0
	}

	const handleSubmit = (e: FormEvent) => {
		e.preventDefault()
		if (validateForm()) {
			onSubmit(formData)
		}
	}

	return (
		<div className="quiz-form-container">
			<h4 className="quiz-form-title">
				{m['quiz.greeting.title']()}
				<br />
				{m['quiz.greeting.subtitle']()}
			</h4>

			<div className="form-wrapper">
				<form onSubmit={handleSubmit} className="space-y-4">
					{/* Redeem License Code */}
					<div className="relative">
						<div className="relative">
							<input
								type="text"
								name="licenseCode"
								value={formData.licenseCode}
								onChange={handleInputChange}
								placeholder={m['quiz.greeting.licenseCodePlaceholder']()}
								maxLength={6}
								className={`quiz-input pr-12 ${
									licenseStatus === 'invalid' || errors.licenseCode
										? 'quiz-input-error'
										: ''
								} ${licenseStatus === 'valid' ? 'border-green-700' : ''} ${licenseStatus === 'valid' && searchParams.get('licenseKey') === formData.licenseCode ? 'bg-gray-100 cursor-not-allowed' : ''}`}
								required
								disabled={
									licenseStatus === 'valid' &&
									searchParams.get('licenseKey') === formData.licenseCode
										? true
										: false
								}
							/>

							{/* Status indicator in input */}
							<div className="absolute right-3 top-1/2 -translate-y-1/2">
								{licenseStatus === 'loading' && (
									<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></div>
								)}
								{licenseStatus === 'valid' && (
									<svg
										className="w-5 h-5 text-green-700"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M5 13l4 4L19 7"
										/>
									</svg>
								)}
								{licenseStatus === 'invalid' && (
									<svg
										className="w-5 h-5 text-red-500"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M6 18L18 6M6 6l12 12"
										/>
									</svg>
								)}
							</div>
						</div>

						{/* Success message */}
						{licenseStatus === 'valid' && licenseMessage && (
							<p className="text-green-600 text-sm mt-1">{licenseMessage}</p>
						)}

						{/* Error message - only show if there's an error */}
						{errors.licenseCode && (
							<p className="quiz-error-message">{errors.licenseCode}</p>
						)}
					</div>

					{/* First Name */}
					<div>
						<input
							type="text"
							name="firstName"
							value={formData.firstName}
							onChange={handleInputChange}
							placeholder={m['quiz.greeting.firstNamePlaceholder']()}
							className={`quiz-input ${errors.firstName ? 'quiz-input-error' : ''}`}
							required
						/>
						{errors.firstName && (
							<p className="quiz-error-message">{errors.firstName}</p>
						)}
					</div>

					{/* Last Name */}
					<div>
						<input
							type="text"
							name="lastName"
							value={formData.lastName}
							onChange={handleInputChange}
							placeholder={m['quiz.greeting.lastNamePlaceholder']()}
							className={`quiz-input ${errors.lastName ? 'quiz-input-error' : ''}`}
							required
						/>
						{errors.lastName && (
							<p className="quiz-error-message">{errors.lastName}</p>
						)}
					</div>

					{/* Email */}
					<div>
						<input
							type="email"
							name="email"
							value={formData.email}
							onChange={handleInputChange}
							placeholder={m['quiz.greeting.emailPlaceholder']()}
							className={`quiz-input ${errors.email ? 'quiz-input-error' : ''}`}
							required
						/>
						{errors.email && (
							<p className="quiz-error-message">{errors.email}</p>
						)}
					</div>

					{/* Checkbox */}
					<div className="flex items-center gap-3">
						<input
							type="checkbox"
							id="agreeToEmail"
							name="agreeToEmail"
							checked={formData.agreeToEmail}
							onChange={handleInputChange}
							className="quiz-checkbox shrink-0"
						/>
						<label htmlFor="agreeToEmail" className="quiz-checkbox-label">
							{m['quiz.greeting.agreeToEmail']()}
						</label>
					</div>

					{/* Submit Button */}
					<div className="pt-4">
						<QuizButton
							type="submit"
							variant="primary"
							size="large"
							disabled={!isFormValid()}
							className="quiz-submit-btn"
						>
							{m['quiz.greeting.startQuiz']()}
						</QuizButton>
					</div>
				</form>
			</div>
		</div>
	)
}

export default GreetingForm

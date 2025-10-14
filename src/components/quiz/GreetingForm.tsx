import {
	type ChangeEvent,
	type FormEvent,
	useEffect,
	useRef,
	useState,
} from 'react'
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
}

const GreetingForm = ({ onSubmit }: GreetingFormProps) => {
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

	useEffect(() => {
		if (validationTimeoutRef.current) {
			clearTimeout(validationTimeoutRef.current)
		}

		if (formData.licenseCode.length < 6) {
			setLicenseStatus('idle')
			setLicenseMessage('')
			return
		}

		// If code is exactly 6 characters, validate after a short delay
		if (formData.licenseCode.length === 6) {
			setLicenseStatus('loading')

			validationTimeoutRef.current = setTimeout(async () => {
				try {
					const result = await validateLicenseCode(formData.licenseCode)

					if (result.isValid) {
						setLicenseStatus('valid')
						setErrors((prev) => ({ ...prev, licenseCode: undefined }))
					} else {
						setLicenseStatus('invalid')
						setLicenseMessage(m['quiz.greeting.validation.licenseInvalid']())
						setErrors((prev) => ({
							...prev,
							licenseCode: m['quiz.greeting.validation.licenseInvalid'](),
						}))
					}
				} catch (error) {
					setLicenseStatus('invalid')
					setLicenseMessage(m['quiz.greeting.validation.licenseError']())
					setErrors((prev) => ({
						...prev,
						licenseCode: m['quiz.greeting.validation.licenseError'](),
					}))
				}
			}, 500)
		}

		// Cleanup function
		return () => {
			if (validationTimeoutRef.current) {
				clearTimeout(validationTimeoutRef.current)
			}
		}
	}, [formData.licenseCode])

	const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
		const { name, value, type, checked } = e.target
		setFormData((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}))
		// Clear error for this field when user starts typing
		if (errors[name as keyof FormData]) {
			setErrors((prev) => ({ ...prev, [name]: undefined }))
		}
	}

	const validateForm = (): boolean => {
		const newErrors: Partial<FormData> = {}

		if (!formData.licenseCode.trim()) {
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
								} ${licenseStatus === 'valid' ? 'border-green-700' : ''}`}
								required
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

						{/* Error message */}
						{licenseStatus === 'invalid' && errors.licenseCode && (
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
							className="quiz-checkbox"
						/>
						<label htmlFor="agreeToEmail" className="quiz-checkbox-label">
							{m['quiz.greeting.agreeToEmail']()}
						</label>
					</div>

					{/* Submit Button */}
					<div className="pt-4">
						<button
							type="submit"
							disabled={!isFormValid()}
							className="quiz-submit-btn"
						>
							{m['quiz.greeting.startQuiz']()}
						</button>
					</div>
				</form>
			</div>
		</div>
	)
}

export default GreetingForm

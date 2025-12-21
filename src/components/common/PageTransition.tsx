import { AnimatePresence, motion, type Transition } from 'framer-motion'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
	children: ReactNode
	type?: 'fade' | 'slide' | 'scale' | 'slideUp'
}

const fadeVariants = {
	initial: {
		opacity: 0.8,
	},
	in: {
		opacity: 1,
	},
	out: {
		opacity: 0.8,
	},
}

const adminFadeVariants = {
	initial: {
		opacity: 0.7,
	},
	in: {
		opacity: 1,
	},
	out: {
		opacity: 0.7,
	},
}

const slideVariants = {
	initial: {
		opacity: 0,
		x: 100,
	},
	in: {
		opacity: 1,
		x: 0,
	},
	out: {
		opacity: 0,
		x: -100,
	},
}

const slideUpVariants = {
	initial: {
		opacity: 0,
		y: 50,
	},
	in: {
		opacity: 1,
		y: 0,
	},
	out: {
		opacity: 0,
		y: -50,
	},
}

const scaleVariants = {
	initial: {
		opacity: 0,
		scale: 0.95,
	},
	in: {
		opacity: 1,
		scale: 1,
	},
	out: {
		opacity: 0,
		scale: 1.05,
	},
}

const pageTransition: Transition = {
	type: 'tween',
	ease: 'easeInOut',
	duration: 0.3,
}

const variantsMap = {
	fade: fadeVariants,
	slide: slideVariants,
	slideUp: slideUpVariants,
	scale: scaleVariants,
}

const adminVariantsMap = {
	fade: adminFadeVariants,
	slide: slideVariants,
	slideUp: slideUpVariants,
	scale: scaleVariants,
}

export const PageTransition = ({
	children,
	type = 'fade',
}: PageTransitionProps) => {
	const location = useLocation()

	const isAdminRoute =
		location.pathname.startsWith('/dashboard') ||
		location.pathname.startsWith('/admin') ||
		location.pathname.startsWith('/response/')

	const variants = isAdminRoute ? adminVariantsMap[type] : variantsMap[type]

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={location.pathname}
				initial="initial"
				animate="in"
				exit="out"
				variants={variants}
				transition={pageTransition}
				className={isAdminRoute ? 'dark bg-background' : 'bg-background'}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	)
}

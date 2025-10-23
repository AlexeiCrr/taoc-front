import { AnimatePresence, motion, type Transition } from 'framer-motion'
import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

interface PageTransitionProps {
	children: ReactNode
	type?: 'fade' | 'slide' | 'scale' | 'slideUp'
}

const fadeVariants = {
	initial: {
		opacity: 0,
	},
	in: {
		opacity: 1,
	},
	out: {
		opacity: 0,
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

export const PageTransition = ({
	children,
	type = 'fade',
}: PageTransitionProps) => {
	const location = useLocation()
	const variants = variantsMap[type]

	return (
		<AnimatePresence mode="wait">
			<motion.div
				key={location.pathname}
				initial="initial"
				animate="in"
				exit="out"
				variants={variants}
				transition={pageTransition}
			>
				{children}
			</motion.div>
		</AnimatePresence>
	)
}

import { ThemeProvider } from '../ThemeProvider'

interface AdminLayoutProps {
	children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="admin-theme">
			{children}
		</ThemeProvider>
	)
}

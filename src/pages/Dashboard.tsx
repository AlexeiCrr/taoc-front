import useAuthStore from '../stores/authStore'

export default function Dashboard() {
	const user = useAuthStore((s) => s.user)
	const logout = useAuthStore((s) => s.logout)

	const claims = user?.attributes ? Object.entries(user.attributes) : []

	return (
		<div className="min-h-screen p-6 md:p-10">
			<div className="max-w-4xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-2xl font-semibold">Dashboard</h1>
					<button
						className="px-4 py-2 rounded bg-gray-900 text-white hover:bg-gray-800"
						onClick={() => logout()}
					>
						Logout
					</button>
				</div>

				<div className="space-y-4">
					<div className="rounded border p-4">
						<h2 className="text-lg font-medium mb-2">Welcome</h2>
						<p className="text-sm text-gray-600">
							Signed in as <span className="font-mono">{user?.email || user?.username}</span>
						</p>
					</div>

					<div className="rounded border p-4 overflow-auto">
						<h3 className="font-medium mb-2">ID Token Claims</h3>
						<table className="w-full text-sm">
							<tbody>
								{claims.map(([k, v]) => (
									<tr key={k} className="border-t">
										<td className="py-1 pr-4 align-top font-mono text-gray-600">{k}</td>
										<td className="py-1 font-mono break-all">{String(v)}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	)
}

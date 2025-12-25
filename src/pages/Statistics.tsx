import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useAdminStore from '@/stores/adminStore'
import { useEffect } from 'react'
import { FrequencyAverageScoresChart } from '@/components/admin/charts/FrequencyAverageScoresChart'
import { FrequencyUserCountChart } from '@/components/admin/charts/FrequencyUserCountChart'
import { MonthlyTrendsChart } from '@/components/admin/charts/MonthlyTrendsChart'
import { TimeSpentChart } from '@/components/admin/charts/TimeSpentChart'
import { ChevronLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Statistics() {
  const { statistics, isLoadingStatistics, statisticsError, fetchStatistics } =
    useAdminStore()

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        await fetchStatistics()
      } catch (error) {
        console.error('Failed to load statistics:', error)
      }
    }
    loadStatistics()
  }, [fetchStatistics])

  // Loading state
  if (isLoadingStatistics) {
    return (
      <div className="min-h-screen bg-background font-roboto">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-8">
            <div className="h-64 bg-muted animate-pulse rounded-xl" />
            <div className="h-64 bg-muted animate-pulse rounded-xl" />
            <div className="h-64 bg-muted animate-pulse rounded-xl" />
          </div>
        </main>
      </div>
    )
  }

  // Error state
  if (statisticsError) {
    return (
      <div className="min-h-screen bg-background font-roboto">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-destructive">
                Error loading statistics: {statisticsError}
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  // No data state
  if (!statistics) {
    return (
      <div className="min-h-screen bg-background font-roboto">
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">
                No statistics data available
              </p>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background font-roboto">
      <header className="bg-card shadow-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Back to Dashboard
          </Link>
          <h3 className="text-3xl font-bold text-foreground !mt-4 !mb-4">
            Statistics Dashboard
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            General population analytics and trends
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Average Scores */}
          <Card>
            <CardHeader>
              <CardTitle>Average Scores by Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <FrequencyAverageScoresChart
                data={statistics.frequencyAverageScores}
              />
            </CardContent>
          </Card>

          {/* Chart 2: User Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>User Distribution by Frequency</CardTitle>
            </CardHeader>
            <CardContent>
              <FrequencyUserCountChart data={statistics.frequencyUserCounts} />
            </CardContent>
          </Card>

          {/* Chart 3: Monthly Trends */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly User Activity Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <MonthlyTrendsChart />
            </CardContent>
          </Card>

          {/* Chart 4: Time Analysis */}
          <Card>
            <CardHeader>
              <CardTitle>Time to Complete Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <TimeSpentChart data={statistics.timeSpentStatistics} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

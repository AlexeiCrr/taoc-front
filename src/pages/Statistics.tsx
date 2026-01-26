import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import useAdminStore from '@/stores/adminStore'
import { useEffect, useCallback } from 'react'
import { FrequencyAverageScoresChart } from '@/components/admin/charts/FrequencyAverageScoresChart'
import { FrequencyUserCountChart } from '@/components/admin/charts/FrequencyUserCountChart'
import { MonthlyTrendsChart } from '@/components/admin/charts/MonthlyTrendsChart'
import { TimeSpentChart } from '@/components/admin/charts/TimeSpentChart'
import { StatisticsDateFilter, type StatisticsFilters } from '@/components/admin/StatisticsDateFilter'
import { ChevronLeft, Loader2 } from 'lucide-react'
import { Link, useSearchParams } from 'react-router-dom'

export default function Statistics() {
  const { statistics, isLoadingStatistics, statisticsError, fetchStatistics } =
    useAdminStore()
  const [searchParams, setSearchParams] = useSearchParams()

  // Get initial filters from URL
  const initialFilters: StatisticsFilters = {
    dateFrom: searchParams.get('dateFrom') || undefined,
    dateTo: searchParams.get('dateTo') || undefined,
  }

  // Load statistics on mount with URL params
  useEffect(() => {
    const loadStatistics = async () => {
      try {
        await fetchStatistics(initialFilters.dateFrom || initialFilters.dateTo ? initialFilters : undefined)
      } catch (error) {
        console.error('Failed to load statistics:', error)
      }
    }
    loadStatistics()
  }, []) // Only run on mount

  const handleFilterChange = useCallback((filters: StatisticsFilters) => {
    // Update URL params
    const newParams = new URLSearchParams()
    if (filters.dateFrom) newParams.set('dateFrom', filters.dateFrom)
    if (filters.dateTo) newParams.set('dateTo', filters.dateTo)
    setSearchParams(newParams)

    // Fetch with new filters
    fetchStatistics(filters.dateFrom || filters.dateTo ? filters : undefined)
  }, [fetchStatistics, setSearchParams])

  // Error state - show full error page
  if (statisticsError && !statistics) {
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

  // Initial loading state (no data yet)
  if (isLoadingStatistics && !statistics) {
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
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
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
        <StatisticsDateFilter
          onFilterChange={handleFilterChange}
          initialFilters={initialFilters}
        />

        {/* Content wrapper with loading overlay */}
        <div className="relative">
          {/* Loading overlay - shows spinner over stale data */}
          {isLoadingStatistics && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2 bg-card px-4 py-2 rounded-lg shadow-lg border">
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Updating...</span>
              </div>
            </div>
          )}

          <div className="mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <p className="text-4xl font-bold text-foreground">
                    {statistics.frequencyUserCounts.reduce((sum, item) => sum + item.userCount, 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    People have taken the assessment
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: User Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>User Distribution by Frequency</CardTitle>
              </CardHeader>
              <CardContent>
                <FrequencyUserCountChart data={statistics.frequencyUserCounts} />
              </CardContent>
            </Card>

            {/* Chart 2: Average Scores */}
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

            {/* Chart 3: Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Monthly User Activity Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <MonthlyTrendsChart data={statistics.monthlyUserStatistics} />
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
        </div>
      </main>
    </div>
  )
}

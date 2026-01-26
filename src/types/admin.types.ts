// Admin related types
export interface AdminResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdOn: string;
  licenseCode?: string;
  licenseTier?: number;
  quizStartedAt?: Date;
  frequencies: FrequencyMap;
  answers?: Answer[];
}

export interface FrequencyMap {
  [key: string]: number;
}

export interface Answer {
  questionId: number;
  frequencyId?: string;
  value: number;
}

export interface ResponseFilters {
  search?: string
  email?: string
  licenseCode?: string
  date?: string
  dateFrom?: string
  dateTo?: string
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface PaginatedAdminResponses {
  items: AdminResponse[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ResendEmailResult {
  success: boolean;
  message: string;
}

export interface UpdateUserDataParams {
  responseId: number;
  firstName: string;
  lastName: string;
  email: string;
}

// Statistics API types (from /responses/statistics endpoint)

export interface FrequencyAverageScore {
  frequency: string
  averageScore: number
  totalResponses: number
}

export interface FrequencyUserCount {
  frequency: string
  userCount: number
  percentage: number
}

export interface TimeSpentCategory {
  category: string
  userCount: number
  percentage: number
}

export interface TimeByFrequency {
  frequency: string
  averageTimeMinutes: number
  userCount: number
}

export interface TimeSpentStatistics {
  sampleSize: number
  averageTimeMinutes: number
  categories: TimeSpentCategory[]
  fastestCompletion?: {
    timeMinutes: number
    primaryFrequency: string
  }
  slowestCompletion?: {
    timeMinutes: number
    primaryFrequency: string
  }
  timeByFrequency: TimeByFrequency[]
}

export interface StatisticsResponse {
  frequencyAverageScores: FrequencyAverageScore[]
  frequencyUserCounts: FrequencyUserCount[]
  timeSpentStatistics: TimeSpentStatistics
  monthlyUserStatistics: MonthlyTrendData[]
}

export interface MonthlyTrendData {
  month: string // "YYYY-MM" format
  userCount: number
}
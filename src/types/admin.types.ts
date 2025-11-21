// Admin related types
export interface AdminResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdOn: string;
  licenseCode?: string;
  quizStartedAt?: string;
  frequencies: FrequencyMap;
  answers?: Answer[];
  phoneNumber?: string;
  country?: string;
}

export interface FrequencyMap {
  [key: string]: string;
}

export interface Answer {
  id: number;
  description: string;
  value: number;
  frequencyName: string;
}

export interface PaginatedResponse {
  items: AdminResponse[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface ResponseFilters {
  page?: number;
  name?: string;
  email?: string;
  licenseCode?: string;
  date?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
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

export interface FrequencyAverageScore {
  frequency: string;
  averageScore: number;
  totalResponses: number;
}

export interface FrequencyUserCount {
  frequency: string;
  userCount: number;
  percentage: number;
}

export interface TimeSpentCategory {
  category: string;
  userCount: number;
  percentage: number;
}

export interface TimeSpentStatistics {
  sampleSize: number;
  averageTimeMinutes: number;
  categories: TimeSpentCategory[];
}

export interface StatisticsResponse {
  frequencyAverageScores: FrequencyAverageScore[];
  frequencyUserCounts: FrequencyUserCount[];
  timeSpentStatistics: TimeSpentStatistics;
}
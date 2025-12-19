// Admin related types
export interface AdminResponse {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  createdOn: string;
  licenseCode?: string; 
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
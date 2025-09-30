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
  search: string;
  dateRange: DateRange | null;
  licenseCode?: string;
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
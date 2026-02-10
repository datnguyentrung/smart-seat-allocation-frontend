// API Response Wrapper Type
export interface ApiResponse<T> {
  data: T;
  error: string | null;
  message: string;
  statusCode: number;
}

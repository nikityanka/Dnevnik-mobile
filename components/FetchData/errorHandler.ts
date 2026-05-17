export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export class ApiException extends Error {
  constructor(
    public message: string,
    public code?: string,
    public status?: number
  ) {
    super(message);
    this.name = 'ApiException';
  }
}

export const handleApiError = (error: unknown): ApiError => {
  if (error instanceof ApiException) {
    return { message: error.message, code: error.code, status: error.status };
  }
  
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string }; status?: number } };
    return {
      message: axiosError.response?.data?.message || 'Произошла ошибка при запросе',
      status: axiosError.response?.status,
    };
  }
  
  if (error instanceof Error) {
    return { message: error.message };
  }
  
  return { message: 'Неизвестная ошибка' };
};

export const getErrorMessage = (error: unknown): string => {
  const apiError = handleApiError(error);
  return apiError.message;
};

export const isNetworkError = (error: unknown): boolean => {
  if (error && typeof error === 'object' && 'code' in error) {
    const err = error as { code?: string };
    return err.code === 'ECONNABORTED' || err.code === 'ERR_NETWORK';
  }
  return false;
};

export const createAbortController = (): AbortController => {
  return new AbortController();
};

export const withAbortSignal = <T>(
  promise: Promise<T>,
  signal: AbortSignal
): Promise<T> => {
  return new Promise((resolve, reject) => {
    promise.then(resolve).catch(reject);
    signal.addEventListener('abort', () => {
      reject(new ApiException('Запрос отменён', 'ABORTED', 0));
    });
  });
};
// app/lib/apiResponse.ts
export type ApiResponse<T> = {
    data?: T;
    error?: string;
    message?: string;
    isOk: boolean;
    pagination?: {
        page: number;
        pageSize: number;
        totalPages: number;
    };
};

export function successResponse<T>(data: T, message?: string, pagination?: ApiResponse<T>['pagination']): ApiResponse<T> {
    return {
        data,
        message: message || 'Success',
        isOk: true,
        pagination,
    };
}

export function errorResponse(error: string, message?: string): ApiResponse<null> {
    return {
        error,
        isOk: false,
        message: message || 'Error',
    };
}

export function paginationResponse(total: number, page: number, pageSize: number): ApiResponse<null>['pagination'] {
    const totalPages = Math.ceil(total / pageSize);
    return { page, pageSize, totalPages };
}
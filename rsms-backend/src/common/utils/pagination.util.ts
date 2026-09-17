import { APP_CONSTANTS } from '../constants/app.constants';

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export function normalizePagination(query: PaginationQuery) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(
    APP_CONSTANTS.MAX_PAGE_SIZE,
    Math.max(1, Number(query.limit) || APP_CONSTANTS.DEFAULT_PAGE_SIZE),
  );
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function buildPaginatedResult<T>(
  data: T[],
  total: number,
  page: number,
  limit: number,
): PaginatedResult<T> {
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

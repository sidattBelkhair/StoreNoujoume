import { LaravelPage } from '../models/app.model';

export interface UnwrappedPage<T> {
  items: T[];
  currentPage: number;
  lastPage: number;
}

export function unwrapPage<T>(data: T[] | LaravelPage<T>): UnwrappedPage<T> {
  if (Array.isArray(data)) {
    return { items: data, currentPage: 1, lastPage: 1 };
  }
  return {
    items: data.data ?? [],
    currentPage: data.current_page ?? 1,
    lastPage: data.last_page ?? 1,
  };
}

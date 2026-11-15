import { es } from '../i18n/es';
import type { CreatedGift, PersonSummary, PersonWithGifts } from './types';

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError(es.errors.network, 0);
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    // The backend always returns a Spanish `message` ready to show.
    const message = typeof body?.message === 'string' ? body.message : es.errors.generic;
    throw new ApiError(message, res.status);
  }
  return body as T;
}

export const api = {
  listPeople: () => request<PersonSummary[]>('/people'),
  getPerson: (id: string) => request<PersonWithGifts>(`/people/${encodeURIComponent(id)}`),
  createGift: (input: { personName: string; giftName: string; url: string }) =>
    request<CreatedGift>('/gifts', { method: 'POST', body: JSON.stringify(input) }),
  deleteGift: (id: string) =>
    request<{ id: string }>(`/gifts/${encodeURIComponent(id)}`, { method: 'DELETE' }),
};

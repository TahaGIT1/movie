import axios from 'axios';
import type { MediaItem, Theatre } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
export const http = axios.create({ baseURL: API_BASE_URL, headers: { 'Content-Type': 'application/json' } });
http.interceptors.request.use((config) => {
  const token = localStorage.getItem('bmm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
http.interceptors.response.use((response) => response, (error) => {
  if (!error.response) error.message = 'Unable to reach BookMyMovie. Start the API server and check your connection.';
  return Promise.reject(error);
});

export const errorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) return error.response?.data?.message || error.message;
  return error instanceof Error ? error.message : 'Something went wrong.';
};
export interface User { id: string; name: string; email: string; phone?: string; role: 'USER' | 'ADMIN' }
export interface AuthResult { token: string; user: User }
export const authService = {
  async login(email: string, password: string) { return (await http.post<AuthResult>('/auth/login', { email, password })).data; },
  async register(input: { name: string; email: string; phone?: string; password: string }) { return (await http.post<AuthResult>('/auth/register', input)).data; },
  async me() { return (await http.get<{ user: User }>('/auth/me')).data.user; },
  logout() { localStorage.removeItem('bmm_token'); localStorage.removeItem('bmm_user'); },
};
export const movieService = {
  async list(params?: Record<string, string>) { return (await http.get<MediaItem[]>('/movies', { params })).data; },
  async get(id: string) { return (await http.get<MediaItem>(`/movies/${id}`)).data; },
  async create(input: Partial<MediaItem>) { return (await http.post<MediaItem>('/movies', input)).data; },
  async update(id: string, input: Partial<MediaItem>) { return (await http.put<MediaItem>(`/movies/${id}`, input)).data; },
  async remove(id: string) { await http.delete(`/movies/${id}`); },
};
export const theatreService = {
  async list(city?: string) { return (await http.get<Theatre[]>('/theatres', { params: city ? { city } : {} })).data; },
  async listShows(params?: Record<string, string>) { return (await http.get('/shows', { params })).data; },
};
export const bookingService = {
  async seats(showId: string) { return (await http.get(`/shows/${showId}/seats`)).data; },
  async lock(showId: string, seats: string[]) { return (await http.post('/bookings/lock', { showId, seats })).data; },
  async create(showId: string, seats: string[], couponCode?: string) { return (await http.post('/bookings', { showId, seats, couponCode })).data; },
  async mine() { return (await http.get('/bookings/my')).data; },
  async ticket(id: string) { return (await http.get(`/bookings/${id}/ticket`)).data; },
  async get(id: string) { return (await http.get(`/bookings/${id}`)).data; },
  async cancel(id: string) { return (await http.post(`/bookings/${id}/cancel`)).data; },
};
export const paymentService = {
  async createOrder(bookingId: string) { return (await http.post('/payment/create-order', { bookingId })).data; },
  async verify(payload: Record<string, string>) { return (await http.post('/payment/verify', payload)).data; },
  async fail(orderId: string) { return (await http.post('/payment/failure', { orderId })).data; },
};
export const couponService = { async validate(code: string, amount: number) { return (await http.post('/coupons/validate', { code, amount })).data; } };
export const adminService = {
  async dashboard() { return (await http.get('/admin/dashboard')).data; },
  async users() { return (await http.get('/admin/users')).data; },
  async bookings(params?: Record<string, string>) { return (await http.get('/admin/bookings', { params })).data; },
  async verifyTicket(bookingId: string) { return (await http.post('/admin/verify-ticket', { bookingId })).data; },
};

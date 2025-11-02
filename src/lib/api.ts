const API_BASE_URL = 'http://localhost:5000/api';

let authToken: string | null = localStorage.getItem('authToken');

export function setAuthToken(token: string | null) {
  authToken = token;
  if (token) {
    localStorage.setItem('authToken', token);
  } else {
    localStorage.removeItem('authToken');
  }
}

export function getAuthToken() {
  return authToken;
}

async function apiCall(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: any
) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const options: RequestInit = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `API error: ${response.status}`);
  }

  return response.json();
}

export const api = {
  auth: {
    register: (email: string, password: string) =>
      apiCall('/auth/register', 'POST', { email, password }),

    login: (email: string, password: string) =>
      apiCall('/auth/login', 'POST', { email, password }),
  },

  movies: {
    getAll: () => apiCall('/movies'),
  },

  shows: {
    getByMovieId: (movieId: number) =>
      apiCall(`/shows?movie_id=${movieId}`),
  },

  seats: {
    getByShowId: (showId: number) =>
      apiCall(`/seats/${showId}`),
  },

  bookings: {
    create: (showId: number, seatIds: number[]) =>
      apiCall('/bookings', 'POST', { show_id: showId, seat_ids: seatIds }),
  },
};

export interface Movie {
  id: number;
  title: string;
  description: string;
  genre: string;
  duration: number;
  rating: number;
  poster_url: string;
}

export interface Theater {
  id: number;
  name: string;
  location: string;
}

export interface Screen {
  id: number;
  name: string;
  total_seats: number;
  theater: Theater;
}

export interface Show {
  id: number;
  movie_id: number;
  show_time: string;
  price: number;
  available_seats: number;
  screen: Screen;
}

export interface Seat {
  id: number;
  show_id: number;
  seat_number: string;
  is_booked: boolean;
}

export interface User {
  id: number;
  email: string;
}

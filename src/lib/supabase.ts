import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      theaters: {
        Row: {
          id: string;
          name: string;
          location: string;
          created_at: string;
        };
      };
      screens: {
        Row: {
          id: string;
          theater_id: string;
          capacity: number;
          screen_type: string;
          screen_number: string;
          created_at: string;
        };
      };
      movies: {
        Row: {
          id: string;
          title: string;
          genre: string;
          language: string;
          duration: number;
          rating: string;
          description: string;
          poster_url: string;
          created_at: string;
        };
      };
      shows: {
        Row: {
          id: string;
          movie_id: string;
          screen_id: string;
          show_date: string;
          show_time: string;
          ticket_price: number;
          created_at: string;
        };
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          created_at: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          customer_id: string;
          show_id: string;
          booking_date: string;
          total_amount: number;
          payment_status: string;
          created_at: string;
        };
      };
      booking_seats: {
        Row: {
          id: string;
          booking_id: string;
          seat_number: string;
          created_at: string;
        };
      };
      payments: {
        Row: {
          id: string;
          booking_id: string;
          amount: number;
          payment_date: string;
          payment_method: string;
          transaction_id: string;
          created_at: string;
        };
      };
    };
  };
};

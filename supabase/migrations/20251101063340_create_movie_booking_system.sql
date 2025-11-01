/*
  # Online Movie Ticket Booking System Database Schema

  ## Overview
  This migration creates a complete movie ticket booking system with theaters, screens, movies, shows, customers, bookings, seats, and payments.

  ## New Tables

  ### 1. `theaters`
  - `id` (uuid, primary key) - Unique theater identifier
  - `location` (text) - Theater location/address
  - `name` (text) - Theater name
  - `created_at` (timestamptz) - Record creation timestamp

  ### 2. `screens`
  - `id` (uuid, primary key) - Unique screen identifier
  - `theater_id` (uuid, foreign key) - References theaters table
  - `capacity` (integer) - Total seating capacity
  - `screen_type` (text) - Screen type (IMAX, Dolby, Standard, etc.)
  - `screen_number` (text) - Screen number/name
  - `created_at` (timestamptz) - Record creation timestamp

  ### 3. `movies`
  - `id` (uuid, primary key) - Unique movie identifier
  - `title` (text) - Movie title
  - `genre` (text) - Movie genre
  - `language` (text) - Movie language
  - `duration` (integer) - Duration in minutes
  - `rating` (text) - Movie rating (U, UA, A, etc.)
  - `description` (text) - Movie description
  - `poster_url` (text) - Movie poster image URL
  - `created_at` (timestamptz) - Record creation timestamp

  ### 4. `shows`
  - `id` (uuid, primary key) - Unique show identifier
  - `movie_id` (uuid, foreign key) - References movies table
  - `screen_id` (uuid, foreign key) - References screens table
  - `show_date` (date) - Show date
  - `show_time` (time) - Show time
  - `ticket_price` (decimal) - Ticket price for this show
  - `created_at` (timestamptz) - Record creation timestamp

  ### 5. `customers`
  - `id` (uuid, primary key) - References auth.users
  - `name` (text) - Customer name
  - `email` (text) - Customer email
  - `phone` (text) - Customer phone number
  - `created_at` (timestamptz) - Record creation timestamp

  ### 6. `bookings`
  - `id` (uuid, primary key) - Unique booking identifier
  - `customer_id` (uuid, foreign key) - References customers table
  - `show_id` (uuid, foreign key) - References shows table
  - `booking_date` (timestamptz) - Booking creation timestamp
  - `total_amount` (decimal) - Total booking amount
  - `payment_status` (text) - Payment status (pending, completed, failed)
  - `created_at` (timestamptz) - Record creation timestamp

  ### 7. `booking_seats`
  - `id` (uuid, primary key) - Unique record identifier
  - `booking_id` (uuid, foreign key) - References bookings table
  - `seat_number` (text) - Seat number/identifier
  - `created_at` (timestamptz) - Record creation timestamp

  ### 8. `payments`
  - `id` (uuid, primary key) - Unique payment identifier
  - `booking_id` (uuid, foreign key) - References bookings table
  - `amount` (decimal) - Payment amount
  - `payment_date` (timestamptz) - Payment timestamp
  - `payment_method` (text) - Payment method (card, upi, wallet, etc.)
  - `transaction_id` (text) - External transaction identifier
  - `created_at` (timestamptz) - Record creation timestamp

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated users to manage their own data
  - Add policies for public read access to movies, theaters, screens, and shows
  - Restrict booking and payment modifications to respective customers
*/

-- Create theaters table
CREATE TABLE IF NOT EXISTS theaters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE theaters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view theaters"
  ON theaters FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert theaters"
  ON theaters FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create screens table
CREATE TABLE IF NOT EXISTS screens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theater_id uuid NOT NULL REFERENCES theaters(id) ON DELETE CASCADE,
  capacity integer NOT NULL DEFAULT 0,
  screen_type text NOT NULL DEFAULT 'Standard',
  screen_number text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE screens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view screens"
  ON screens FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert screens"
  ON screens FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create movies table
CREATE TABLE IF NOT EXISTS movies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  genre text NOT NULL,
  language text NOT NULL,
  duration integer NOT NULL,
  rating text NOT NULL,
  description text DEFAULT '',
  poster_url text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE movies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view movies"
  ON movies FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert movies"
  ON movies FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create shows table
CREATE TABLE IF NOT EXISTS shows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  movie_id uuid NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  screen_id uuid NOT NULL REFERENCES screens(id) ON DELETE CASCADE,
  show_date date NOT NULL,
  show_time time NOT NULL,
  ticket_price decimal(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE shows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view shows"
  ON shows FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert shows"
  ON shows FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  phone text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own customer data"
  ON customers FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own customer data"
  ON customers FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own customer data"
  ON customers FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Create bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  show_id uuid NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  booking_date timestamptz DEFAULT now(),
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bookings"
  ON bookings FOR SELECT
  TO authenticated
  USING (auth.uid() = customer_id);

CREATE POLICY "Users can insert own bookings"
  ON bookings FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = customer_id);

CREATE POLICY "Users can update own bookings"
  ON bookings FOR UPDATE
  TO authenticated
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- Create booking_seats table
CREATE TABLE IF NOT EXISTS booking_seats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  seat_number text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE booking_seats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view seats for their bookings"
  ON booking_seats FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_seats.booking_id
      AND bookings.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert seats for their bookings"
  ON booking_seats FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = booking_seats.booking_id
      AND bookings.customer_id = auth.uid()
    )
  );

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  amount decimal(10,2) NOT NULL,
  payment_date timestamptz DEFAULT now(),
  payment_method text NOT NULL,
  transaction_id text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payments for their bookings"
  ON payments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id
      AND bookings.customer_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert payments for their bookings"
  ON payments FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = payments.booking_id
      AND bookings.customer_id = auth.uid()
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_screens_theater ON screens(theater_id);
CREATE INDEX IF NOT EXISTS idx_shows_movie ON shows(movie_id);
CREATE INDEX IF NOT EXISTS idx_shows_screen ON shows(screen_id);
CREATE INDEX IF NOT EXISTS idx_shows_date ON shows(show_date);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_show ON bookings(show_id);
CREATE INDEX IF NOT EXISTS idx_booking_seats_booking ON booking_seats(booking_id);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON payments(booking_id);
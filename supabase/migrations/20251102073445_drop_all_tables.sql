/*
  # Drop all movie booking system tables

  This migration removes all tables created for the movie booking system.
  All data will be deleted.
*/

DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS booking_seats CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS shows CASCADE;
DROP TABLE IF EXISTS movies CASCADE;
DROP TABLE IF EXISTS screens CASCADE;
DROP TABLE IF EXISTS theaters CASCADE;
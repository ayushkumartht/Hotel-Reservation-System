-- =====================================================
--  HOTEL RESERVATION SYSTEM
--  File 7 : Cleanup
--  Deletes the whole project database (all tables, views and data).
--  Only run this when you want to remove the project from MySQL.
-- =====================================================

DROP DATABASE IF EXISTS hotel_db;

-- Check: hotel_db should not be in this list any more
SHOW DATABASES;

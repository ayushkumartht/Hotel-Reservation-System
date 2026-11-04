-- =====================================================
--  HOTEL RESERVATION SYSTEM
--  File 5 : Useful Views
--  A view is a saved SELECT query that works like a table.
--  Run this AFTER 01_create_tables.sql and 02_insert_data.sql
-- =====================================================

USE hotel_db;


-- View 1 : rooms that can be booked right now
CREATE OR REPLACE VIEW available_rooms AS
SELECT room_id, room_number, room_type, price_per_night
FROM rooms
WHERE status = 'Available';


-- View 2 : bookings that are not paid yet (cancelled bookings are ignored)
CREATE OR REPLACE VIEW unpaid_bookings AS
SELECT b.booking_id,
       CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
       c.phone,
       b.check_in,
       b.check_out
FROM bookings b
JOIN customers c     ON b.customer_id = c.customer_id
LEFT JOIN payments p ON b.booking_id = p.booking_id
WHERE p.payment_id IS NULL
  AND b.booking_status <> 'Cancelled';


-- View 3 : how many bookings each staff member has handled
CREATE OR REPLACE VIEW staff_summary AS
SELECT s.staff_id, s.staff_name, s.role,
       COUNT(b.booking_id) AS bookings_handled
FROM staff s
LEFT JOIN bookings b ON s.staff_id = b.staff_id
GROUP BY s.staff_id, s.staff_name, s.role;


-- Using the views
SELECT * FROM available_rooms;
SELECT * FROM unpaid_bookings;
SELECT * FROM staff_summary;

-- A view can be used like a table, so we can filter it too
SELECT room_number, price_per_night
FROM available_rooms
WHERE room_type = 'Suite';

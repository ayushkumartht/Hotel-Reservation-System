-- =====================================================
--  HOTEL RESERVATION SYSTEM
--  File 4 : Check-in Story
--  The same steps are shown in "Story Mode" on the Docs page.
--  Run this AFTER 01_create_tables.sql and 02_insert_data.sql
--  (it also works after 03_queries.sql)
-- =====================================================

USE hotel_db;


-- STEP 1 : A new guest, Riya Kapoor, arrives at the hotel.
--          She wants a Deluxe room from 15 Nov to 17 Nov 2026.
--          Receptionist Amit Kumar (staff_id 3) will help her.


-- STEP 2 : Save the customer's details
INSERT INTO customers VALUES
(11, 'Riya', 'Kapoor', '9810000011', 'riya.kapoor@gmail.com', 'Lucknow');


-- STEP 3 : Find an available Deluxe room
SELECT room_id, room_number, room_type, price_per_night
FROM rooms
WHERE status = 'Available' AND room_type = 'Deluxe';


-- STEP 4 : Create the booking (room_id 5 = room 201, staff_id 3 = Amit)
INSERT INTO bookings VALUES
(12, 11, 5, 3, '2026-11-15', '2026-11-17', 'Confirmed');


-- STEP 5 : Mark the room as booked
UPDATE rooms
SET status = 'Booked'
WHERE room_id = 5;


-- STEP 6 : Check-in day - see the booking with customer name and room number
SELECT b.booking_id, c.first_name, c.last_name,
       r.room_number, b.check_in, b.check_out
FROM bookings b
JOIN customers c ON b.customer_id = c.customer_id
JOIN rooms r     ON b.room_id = r.room_id
WHERE b.booking_id = 12;


-- STEP 7 : Check-out day - calculate the bill
SELECT b.booking_id,
       DATEDIFF(b.check_out, b.check_in) AS nights,
       r.price_per_night,
       DATEDIFF(b.check_out, b.check_in) * r.price_per_night AS total_bill
FROM bookings b
JOIN rooms r ON b.room_id = r.room_id
WHERE b.booking_id = 12;


-- STEP 8 : Take the payment
INSERT INTO payments VALUES
(8, 12, 8000.00, '2026-11-17', 'UPI');


-- STEP 9 : Complete the booking and free the room
UPDATE bookings
SET booking_status = 'Completed'
WHERE booking_id = 12;

UPDATE rooms
SET status = 'Available'
WHERE room_id = 5;


-- STEP 10 : The end - Riya's full stay from all 5 tables
SELECT c.first_name, c.last_name, s.staff_name, r.room_number,
       b.check_in, b.check_out, b.booking_status,
       p.amount, p.payment_method
FROM bookings b
JOIN customers c ON b.customer_id = c.customer_id
JOIN rooms r     ON b.room_id = r.room_id
JOIN staff s     ON b.staff_id = s.staff_id
JOIN payments p  ON b.booking_id = p.booking_id
WHERE b.booking_id = 12;

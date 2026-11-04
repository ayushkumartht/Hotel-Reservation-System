-- =====================================================
--  HOTEL RESERVATION SYSTEM
--  File 3 : SQL Queries
--  Run this AFTER 01_create_tables.sql and 02_insert_data.sql
-- =====================================================

USE hotel_db;


-- =====================================================
-- PART A : BASIC SELECT QUERIES
-- =====================================================

-- Q1. Show all customers
SELECT * FROM customers;

-- Q2. Show all rooms that are available
SELECT room_number, room_type, price_per_night
FROM rooms
WHERE status = 'Available';

-- Q3. Show all rooms from costliest to cheapest
SELECT room_number, room_type, price_per_night
FROM rooms
ORDER BY price_per_night DESC;

-- Q4. Show rooms with price between 2000 and 5000
SELECT room_number, room_type, price_per_night
FROM rooms
WHERE price_per_night BETWEEN 2000 AND 5000;

-- Q5. Show customers whose first name starts with 'A'
SELECT first_name, last_name, city
FROM customers
WHERE first_name LIKE 'A%';

-- Q6. Show customers from Delhi, Mumbai or Pune
SELECT first_name, last_name, city
FROM customers
WHERE city IN ('Delhi', 'Mumbai', 'Pune');


-- =====================================================
-- PART B : AGGREGATE FUNCTIONS, GROUP BY, HAVING
-- =====================================================

-- Q7. Total number of rooms in the hotel
SELECT COUNT(*) AS total_rooms
FROM rooms;

-- Q8. Number of rooms of each type
SELECT room_type, COUNT(*) AS number_of_rooms
FROM rooms
GROUP BY room_type;

-- Q9. Total money collected by the hotel
SELECT SUM(amount) AS total_revenue
FROM payments;

-- Q10. Money collected by each payment method
SELECT payment_method, SUM(amount) AS total_amount
FROM payments
GROUP BY payment_method;

-- Q11. Minimum, maximum and average room price
SELECT MIN(price_per_night) AS min_price,
       MAX(price_per_night) AS max_price,
       AVG(price_per_night) AS avg_price
FROM rooms;

-- Q12. Room types that have more than 2 rooms
SELECT room_type, COUNT(*) AS number_of_rooms
FROM rooms
GROUP BY room_type
HAVING COUNT(*) > 2;


-- =====================================================
-- PART C : JOINS
-- =====================================================

-- Q13. Show every booking with customer name and room number (INNER JOIN)
SELECT b.booking_id,
       c.first_name,
       c.last_name,
       r.room_number,
       r.room_type,
       b.check_in,
       b.check_out,
       b.booking_status
FROM bookings b
JOIN customers c ON b.customer_id = c.customer_id
JOIN rooms r     ON b.room_id = r.room_id;

-- Q14. Calculate the bill of each booking
--      bill = number of nights * price per night
SELECT b.booking_id,
       c.first_name,
       r.room_number,
       DATEDIFF(b.check_out, b.check_in) AS nights,
       r.price_per_night,
       DATEDIFF(b.check_out, b.check_in) * r.price_per_night AS total_bill
FROM bookings b
JOIN customers c ON b.customer_id = c.customer_id
JOIN rooms r     ON b.room_id = r.room_id;

-- Q15. Customers who have never made a booking (LEFT JOIN)
SELECT c.customer_id, c.first_name, c.last_name
FROM customers c
LEFT JOIN bookings b ON c.customer_id = b.customer_id
WHERE b.booking_id IS NULL;

-- Q16. Number of bookings handled by each staff member
SELECT s.staff_name, s.role, COUNT(b.booking_id) AS bookings_handled
FROM staff s
LEFT JOIN bookings b ON s.staff_id = b.staff_id
GROUP BY s.staff_id, s.staff_name, s.role;

-- Q17. Bookings that are not paid yet (and not cancelled)
SELECT b.booking_id, c.first_name, b.check_in, b.check_out
FROM bookings b
JOIN customers c     ON b.customer_id = c.customer_id
LEFT JOIN payments p ON b.booking_id = p.booking_id
WHERE p.payment_id IS NULL
  AND b.booking_status <> 'Cancelled';


-- =====================================================
-- PART D : SUBQUERIES
-- =====================================================

-- Q18. Rooms that cost more than the average room price
SELECT room_number, room_type, price_per_night
FROM rooms
WHERE price_per_night > (SELECT AVG(price_per_night) FROM rooms);

-- Q19. Customers who have booked a Suite
SELECT first_name, last_name
FROM customers
WHERE customer_id IN (
    SELECT customer_id
    FROM bookings
    WHERE room_id IN (SELECT room_id FROM rooms WHERE room_type = 'Suite')
);

-- Q20. The highest payment made
SELECT payment_id, booking_id, amount, payment_method
FROM payments
WHERE amount = (SELECT MAX(amount) FROM payments);


-- =====================================================
-- PART E : VIEW
-- =====================================================

-- Q21. Create a view to see booking details easily
CREATE OR REPLACE VIEW booking_details AS
SELECT b.booking_id,
       CONCAT(c.first_name, ' ', c.last_name) AS customer_name,
       r.room_number,
       r.room_type,
       b.check_in,
       b.check_out,
       DATEDIFF(b.check_out, b.check_in) AS nights,
       DATEDIFF(b.check_out, b.check_in) * r.price_per_night AS total_bill,
       b.booking_status
FROM bookings b
JOIN customers c ON b.customer_id = c.customer_id
JOIN rooms r     ON b.room_id = r.room_id;

-- Q22. Use the view
SELECT * FROM booking_details;


-- =====================================================
-- PART F : INSERT, UPDATE, DELETE
-- =====================================================

-- Q23. New booking: Meera (customer 10) books room 303 (room 10)
INSERT INTO bookings VALUES
(11, 10, 10, 2, '2026-11-10', '2026-11-12', 'Confirmed');

UPDATE rooms
SET status = 'Booked'
WHERE room_id = 10;

-- Q24. Customer of booking 7 checks out -> booking completed, room free again
UPDATE bookings
SET booking_status = 'Completed'
WHERE booking_id = 7;

UPDATE rooms
SET status = 'Available'
WHERE room_id = 2;

-- Q25. Give a salary hike of 10% to staff member 2
UPDATE staff
SET salary = salary * 1.10
WHERE staff_id = 2;

-- Q26. Delete the cancelled booking (booking 5)
--      (it has no payment, so it can be deleted safely)
DELETE FROM bookings
WHERE booking_id = 5;

-- Check the changes
SELECT * FROM bookings;
SELECT * FROM rooms;
SELECT * FROM staff;


-- =====================================================
-- PART G : MORE USEFUL QUERIES
-- (these run after Part F, so they use the changed data)
-- =====================================================

-- Q27. Rooms that have never been booked (NOT IN + subquery)
SELECT room_number, room_type, status
FROM rooms
WHERE room_id NOT IN (SELECT room_id FROM bookings);

-- Q28. The customer who has spent the most money (GROUP BY + ORDER BY + LIMIT)
SELECT c.first_name, c.last_name, SUM(p.amount) AS total_spent
FROM customers c
JOIN bookings b ON c.customer_id = b.customer_id
JOIN payments p ON b.booking_id = p.booking_id
GROUP BY c.customer_id, c.first_name, c.last_name
ORDER BY total_spent DESC
LIMIT 1;

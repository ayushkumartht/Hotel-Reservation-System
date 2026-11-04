-- =====================================================
--  HOTEL RESERVATION SYSTEM
--  File 6 : Practice Questions with Answers
--  Try to write each query yourself first, then check the answer.
--  The answers are for the fresh data of 02_insert_data.sql.
--  Run this AFTER 01_create_tables.sql and 02_insert_data.sql
-- =====================================================

USE hotel_db;


-- Q1. Show the first name and last name of customers who live in Pune.
SELECT first_name, last_name
FROM customers
WHERE city = 'Pune';


-- Q2. Show the cheapest room.
SELECT room_number, room_type, price_per_night
FROM rooms
ORDER BY price_per_night ASC
LIMIT 1;


-- Q3. How many bookings were cancelled?
SELECT COUNT(*) AS cancelled_bookings
FROM bookings
WHERE booking_status = 'Cancelled';


-- Q4. Show staff members who earn more than 20000, highest salary first.
SELECT staff_name, role, salary
FROM staff
WHERE salary > 20000
ORDER BY salary DESC;


-- Q5. How much money was paid by UPI?
SELECT SUM(amount) AS upi_total
FROM payments
WHERE payment_method = 'UPI';


-- Q6. Show the bookings that are longer than 3 nights.
SELECT booking_id, DATEDIFF(check_out, check_in) AS nights
FROM bookings
WHERE DATEDIFF(check_out, check_in) > 3;


-- Q7. Show the customer name and room number of all Completed bookings.
SELECT c.first_name, c.last_name, r.room_number
FROM bookings b
JOIN customers c ON b.customer_id = c.customer_id
JOIN rooms r     ON b.room_id = r.room_id
WHERE b.booking_status = 'Completed';


-- Q8. Which room type has earned the most money?
SELECT r.room_type, SUM(p.amount) AS earned
FROM payments p
JOIN bookings b ON p.booking_id = b.booking_id
JOIN rooms r    ON b.room_id = r.room_id
GROUP BY r.room_type
ORDER BY earned DESC;


-- Q9. Which staff members have never handled a booking?
SELECT staff_name, role
FROM staff
WHERE staff_id NOT IN (SELECT staff_id FROM bookings);


-- Q10. Which customers have booked more than once?
SELECT c.first_name, c.last_name, COUNT(*) AS number_of_bookings
FROM customers c
JOIN bookings b ON c.customer_id = b.customer_id
GROUP BY c.customer_id, c.first_name, c.last_name
HAVING COUNT(*) > 1;

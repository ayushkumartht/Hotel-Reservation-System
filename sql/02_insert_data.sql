-- =====================================================
--  HOTEL RESERVATION SYSTEM
--  File 2 : Insert Sample Data
--  Run this AFTER 01_create_tables.sql
-- =====================================================

USE hotel_db;


-- -----------------------------------------------------
-- CUSTOMERS (10 records)
-- -----------------------------------------------------
INSERT INTO customers VALUES
(1,  'Aman',      'Gupta',    '9810000001', 'aman.gupta@gmail.com',   'Delhi'),
(2,  'Sneha',     'Patel',    '9810000002', 'sneha.patel@gmail.com',  'Ahmedabad'),
(3,  'Rohit',     'Mehta',    '9810000003', 'rohit.mehta@gmail.com',  'Mumbai'),
(4,  'Kavya',     'Nair',     '9810000004', 'kavya.nair@gmail.com',   'Kochi'),
(5,  'Arjun',     'Reddy',    '9810000005', 'arjun.reddy@gmail.com',  'Hyderabad'),
(6,  'Pooja',     'Joshi',    '9810000006', 'pooja.joshi@gmail.com',  'Pune'),
(7,  'Karan',     'Malhotra', '9810000007', 'karan.m@gmail.com',      'Chandigarh'),
(8,  'Anjali',    'Das',      '9810000008', 'anjali.das@gmail.com',   'Kolkata'),
(9,  'Siddharth', 'Jain',     '9810000009', 'sid.jain@gmail.com',     'Jaipur'),
(10, 'Meera',     'Iyer',     '9810000010', 'meera.iyer@gmail.com',   'Chennai');


-- -----------------------------------------------------
-- ROOMS (10 records)
-- -----------------------------------------------------
INSERT INTO rooms VALUES
(1,  '101', 'Single', 1500.00, 'Available'),
(2,  '102', 'Single', 1500.00, 'Booked'),
(3,  '103', 'Double', 2500.00, 'Available'),
(4,  '104', 'Double', 2500.00, 'Booked'),
(5,  '201', 'Deluxe', 4000.00, 'Available'),
(6,  '202', 'Deluxe', 4000.00, 'Booked'),
(7,  '203', 'Double', 2500.00, 'Maintenance'),
(8,  '301', 'Suite',  7000.00, 'Available'),
(9,  '302', 'Suite',  7000.00, 'Booked'),
(10, '303', 'Single', 1500.00, 'Available');


-- -----------------------------------------------------
-- STAFF (5 records)
-- -----------------------------------------------------
INSERT INTO staff VALUES
(1, 'Rahul Verma',  'Manager',      '9876500001', 50000.00),
(2, 'Priya Sharma', 'Receptionist', '9876500002', 25000.00),
(3, 'Amit Kumar',   'Receptionist', '9876500003', 25000.00),
(4, 'Neha Singh',   'Housekeeping', '9876500004', 18000.00),
(5, 'Vikram Rao',   'Accountant',   '9876500005', 30000.00);


-- -----------------------------------------------------
-- BOOKINGS (10 records)
-- (booking_id, customer_id, room_id, staff_id, check_in, check_out, status)
-- -----------------------------------------------------
INSERT INTO bookings VALUES
(1,  1, 3, 2, '2026-09-01', '2026-09-04', 'Completed'),
(2,  2, 5, 3, '2026-09-10', '2026-09-12', 'Completed'),
(3,  3, 1, 2, '2026-09-15', '2026-09-20', 'Completed'),
(4,  4, 8, 1, '2026-10-01', '2026-10-03', 'Completed'),
(5,  5, 3, 3, '2026-10-05', '2026-10-06', 'Cancelled'),
(6,  1, 5, 2, '2026-10-10', '2026-10-14', 'Completed'),
(7,  6, 2, 2, '2026-11-01', '2026-11-05', 'Confirmed'),
(8,  7, 4, 3, '2026-11-02', '2026-11-04', 'Confirmed'),
(9,  8, 6, 3, '2026-11-02', '2026-11-07', 'Confirmed'),
(10, 9, 9, 2, '2026-11-03', '2026-11-06', 'Confirmed');


-- -----------------------------------------------------
-- PAYMENTS (7 records)
-- Booking 5 was cancelled, so it has no payment.
-- Bookings 8 and 10 will pay at check-out (not paid yet).
-- -----------------------------------------------------
INSERT INTO payments VALUES
(1, 1, 7500.00,  '2026-09-04', 'Card'),
(2, 2, 8000.00,  '2026-09-12', 'UPI'),
(3, 3, 7500.00,  '2026-09-20', 'Cash'),
(4, 4, 14000.00, '2026-10-03', 'Card'),
(5, 6, 16000.00, '2026-10-14', 'UPI'),
(6, 7, 6000.00,  '2026-11-01', 'UPI'),
(7, 9, 20000.00, '2026-11-02', 'Card');


-- Check the data
SELECT * FROM customers;
SELECT * FROM rooms;
SELECT * FROM staff;
SELECT * FROM bookings;
SELECT * FROM payments;

-- Number of rows in every table (42 rows in total)
SELECT 'customers' AS table_name, COUNT(*) AS total_rows FROM customers
UNION ALL
SELECT 'rooms', COUNT(*) FROM rooms
UNION ALL
SELECT 'staff', COUNT(*) FROM staff
UNION ALL
SELECT 'bookings', COUNT(*) FROM bookings
UNION ALL
SELECT 'payments', COUNT(*) FROM payments;

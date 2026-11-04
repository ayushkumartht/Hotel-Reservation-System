-- =====================================================
--  HOTEL RESERVATION SYSTEM
--  File 1 : Create Database and Tables
--  Database : MySQL
-- =====================================================

-- Create a fresh database
DROP DATABASE IF EXISTS hotel_db;
CREATE DATABASE hotel_db;
USE hotel_db;


-- -----------------------------------------------------
-- Table 1 : CUSTOMERS
-- Stores details of the guests who book rooms
-- -----------------------------------------------------
CREATE TABLE customers (
    customer_id   INT PRIMARY KEY,
    first_name    VARCHAR(50)  NOT NULL,
    last_name     VARCHAR(50),
    phone         VARCHAR(15)  NOT NULL UNIQUE,
    email         VARCHAR(100) UNIQUE,
    city          VARCHAR(50)
);


-- -----------------------------------------------------
-- Table 2 : ROOMS
-- Stores details of all the rooms in the hotel
-- room_type : Single / Double / Deluxe / Suite
-- status    : Available / Booked / Maintenance
-- -----------------------------------------------------
CREATE TABLE rooms (
    room_id          INT PRIMARY KEY,
    room_number      VARCHAR(10)  NOT NULL UNIQUE,
    room_type        VARCHAR(20)  NOT NULL CHECK (room_type IN ('Single', 'Double', 'Deluxe', 'Suite')),
    price_per_night  DECIMAL(8,2) NOT NULL CHECK (price_per_night > 0),
    status           VARCHAR(20)  DEFAULT 'Available'
);


-- -----------------------------------------------------
-- Table 3 : STAFF
-- Stores details of hotel employees
-- -----------------------------------------------------
CREATE TABLE staff (
    staff_id    INT PRIMARY KEY,
    staff_name  VARCHAR(50) NOT NULL,
    role        VARCHAR(30) NOT NULL,
    phone       VARCHAR(15),
    salary      DECIMAL(10,2)
);


-- -----------------------------------------------------
-- Table 4 : BOOKINGS
-- Connects a customer with a room for some dates.
-- staff_id = the staff member who made the booking
-- booking_status : Confirmed / Cancelled / Completed
-- -----------------------------------------------------
CREATE TABLE bookings (
    booking_id      INT PRIMARY KEY,
    customer_id     INT  NOT NULL,
    room_id         INT  NOT NULL,
    staff_id        INT,
    check_in        DATE NOT NULL,
    check_out       DATE NOT NULL,
    booking_status  VARCHAR(20) DEFAULT 'Confirmed',
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (room_id)     REFERENCES rooms(room_id),
    FOREIGN KEY (staff_id)    REFERENCES staff(staff_id),
    CHECK (check_out > check_in)
);


-- -----------------------------------------------------
-- Table 5 : PAYMENTS
-- One payment for one booking (booking_id is UNIQUE)
-- payment_method : Cash / Card / UPI
-- -----------------------------------------------------
CREATE TABLE payments (
    payment_id      INT PRIMARY KEY,
    booking_id      INT NOT NULL UNIQUE,
    amount          DECIMAL(10,2) NOT NULL,
    payment_date    DATE NOT NULL,
    payment_method  VARCHAR(20),
    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)
);


-- Check that all tables are created
SHOW TABLES;

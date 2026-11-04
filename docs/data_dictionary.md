# Data Dictionary

A data dictionary lists every table and column of the database with its meaning.
Database name: **hotel_db** (MySQL 8.0)

## customers
| Column | Type | Key / Constraint | Meaning |
|--------|------|------------------|---------|
| customer_id | INT | PRIMARY KEY | Unique number of the customer |
| first_name | VARCHAR(50) | NOT NULL | First name |
| last_name | VARCHAR(50) | | Last name |
| phone | VARCHAR(15) | NOT NULL, UNIQUE | Mobile number |
| email | VARCHAR(100) | UNIQUE | Email address |
| city | VARCHAR(50) | | City of the customer |

## rooms
| Column | Type | Key / Constraint | Meaning |
|--------|------|------------------|---------|
| room_id | INT | PRIMARY KEY | Unique number used inside the database |
| room_number | VARCHAR(10) | NOT NULL, UNIQUE | Number on the door, like 101 |
| room_type | VARCHAR(20) | NOT NULL, CHECK (Single / Double / Deluxe / Suite) | Type of the room |
| price_per_night | DECIMAL(8,2) | NOT NULL, CHECK (> 0) | Price for one night |
| status | VARCHAR(20) | DEFAULT 'Available', CHECK (Available / Booked / Maintenance) | Current state of the room |

## staff
| Column | Type | Key / Constraint | Meaning |
|--------|------|------------------|---------|
| staff_id | INT | PRIMARY KEY | Unique number of the employee |
| staff_name | VARCHAR(50) | NOT NULL | Name |
| role | VARCHAR(30) | NOT NULL | Manager / Receptionist / Housekeeping / Accountant |
| phone | VARCHAR(15) | | Phone number |
| salary | DECIMAL(10,2) | | Monthly salary |

## bookings
| Column | Type | Key / Constraint | Meaning |
|--------|------|------------------|---------|
| booking_id | INT | PRIMARY KEY | Unique number of the booking |
| customer_id | INT | NOT NULL, FOREIGN KEY to customers | Who booked |
| room_id | INT | NOT NULL, FOREIGN KEY to rooms | Which room |
| staff_id | INT | FOREIGN KEY to staff | Who made the booking |
| check_in | DATE | NOT NULL | Arrival date |
| check_out | DATE | NOT NULL, CHECK (check_out > check_in) | Leaving date |
| booking_status | VARCHAR(20) | DEFAULT 'Confirmed', CHECK (Confirmed / Cancelled / Completed) | State of the booking |

## payments
| Column | Type | Key / Constraint | Meaning |
|--------|------|------------------|---------|
| payment_id | INT | PRIMARY KEY | Unique number of the payment |
| booking_id | INT | NOT NULL, UNIQUE, FOREIGN KEY to bookings | Booking that was paid (one payment per booking) |
| amount | DECIMAL(10,2) | NOT NULL | Money paid |
| payment_date | DATE | NOT NULL | Date of the payment |
| payment_method | VARCHAR(20) | | Cash / Card / UPI |

## Relationships
| From | To | Type | Column |
|------|----|------|--------|
| customers | bookings | One to Many | bookings.customer_id |
| rooms | bookings | One to Many | bookings.room_id |
| staff | bookings | One to Many | bookings.staff_id |
| bookings | payments | One to One | payments.booking_id (UNIQUE) |

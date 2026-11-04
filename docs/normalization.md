# Normalization

Normalization means splitting data into separate tables so that every fact is stored **only once**.

## The problem: one big table
| booking_id | customer_name | phone | room_number | price_per_night |
|------------|---------------|-------|-------------|-----------------|
| 1 | Aman Gupta | 9810000001 | 103 | 2500 |
| 6 | Aman Gupta | 9810000001 | 201 | 4000 |
| 5 | Arjun Reddy | 9810000005 | 103 | 2500 |

- Aman's phone number is stored two times, and the price of room 103 is stored two times.
- If Aman changes his phone number, every row must be changed. If one row is missed, the data is wrong (update anomaly).
- A new room cannot be saved until somebody books it (insertion anomaly).

## First Normal Form (1NF)
Every cell has only **one value**. There are no lists and no repeating columns.
In our tables every customer has one phone number in one column, and every booking has one room.

## Second Normal Form (2NF)
The table is in 1NF, and every column depends on the **whole primary key**.
All our tables have a single-column primary key (customer_id, room_id, staff_id, booking_id, payment_id),
so a column can never depend on only a part of the key.

## Third Normal Form (3NF)
The table is in 2NF, and **no column depends on another non-key column**.

| Fact | Stored only in | bookings stores |
|------|----------------|-----------------|
| Customer name, phone | customers | customer_id |
| Room number, price | rooms | room_id |
| Staff name, role | staff | staff_id |

The total bill is **not** stored, because it can be calculated:
`DATEDIFF(check_out, check_in) * price_per_night`.

## Result
All 5 tables of the project are in **3NF**.

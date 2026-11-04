# SQL Files

Run the files **in this order** in MySQL Workbench or the MySQL command line.

| Order | File | What it does |
|-------|------|--------------|
| 1 | `01_create_tables.sql` | Creates the `hotel_db` database and the 5 tables with all keys and constraints |
| 2 | `02_insert_data.sql` | Inserts the sample data (10 customers, 10 rooms, 5 staff, 10 bookings, 7 payments) |
| 3 | `03_queries.sql` | All the queries: SELECT, GROUP BY, JOINs, subqueries, view, INSERT, UPDATE, DELETE |
| 4 | `04_checkin_story.sql` | The check-in story of one guest (the same steps as Story Mode on the Docs page) |

- Running `01_create_tables.sql` again deletes the database and creates it fresh, so you can start again at any time.
- `04_checkin_story.sql` works after file 2 or after file 3.
- Every query is explained on the Docs page (`html/docs.html`).

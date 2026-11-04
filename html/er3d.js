/* =========================================================
   3D INTERACTIVE ER DIAGRAM  +  STORY MODE
   Hotel Reservation System - DBMS CA Project

   How it works (in short):
   - Every table is placed at a point in 3D space (x, y, z).
   - On every frame the points are rotated (yaw / pitch) and
     projected on the flat screen: far things look small,
     near things look big (perspective).
   - Plain JavaScript + <canvas>. No library is needed.
   ========================================================= */

(function () {
    'use strict';

    var canvas = document.getElementById('er-canvas');
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext('2d');

    var viewer = document.getElementById('er-viewer');
    var panel = document.getElementById('er-panel');
    function $(id) { return document.getElementById(id); }

    var reduceMotion = window.matchMedia &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function escapeHtml(s) {
        return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function hl(code) {
        return window.DocsSQL ? window.DocsSQL.highlight(code) : escapeHtml(code);
    }

    /* =====================================================
       1. DATA - tables (entities) and relationships
       ===================================================== */
    var ENTITIES = {
        customers: {
            label: 'CUSTOMERS', pos: [-430, 0, 0], rows: 10,
            desc: 'Stores the details of every guest of the hotel. One customer can make many bookings.',
            cols: [
                { n: 'customer_id', t: 'INT', k: 'PK', d: 'Unique number of each customer (Primary Key).' },
                { n: 'first_name', t: 'VARCHAR(50)', d: 'NOT NULL - must always be filled.' },
                { n: 'last_name', t: 'VARCHAR(50)', d: 'Can be left empty.' },
                { n: 'phone', t: 'VARCHAR(15)', d: 'NOT NULL + UNIQUE - two customers cannot have the same phone.' },
                { n: 'email', t: 'VARCHAR(100)', d: 'UNIQUE - two customers cannot have the same email.' },
                { n: 'city', t: 'VARCHAR(50)', d: 'City the customer comes from.' }
            ],
            sql: 'CREATE TABLE customers (\n' +
                '    customer_id   INT PRIMARY KEY,\n' +
                '    first_name    VARCHAR(50)  NOT NULL,\n' +
                '    last_name     VARCHAR(50),\n' +
                '    phone         VARCHAR(15)  NOT NULL UNIQUE,\n' +
                '    email         VARCHAR(100) UNIQUE,\n' +
                '    city          VARCHAR(50)\n' +
                ');'
        },
        rooms: {
            label: 'ROOMS', pos: [430, 0, 0], rows: 10,
            desc: 'Every room of the hotel with its type, price per night and current status.',
            cols: [
                { n: 'room_id', t: 'INT', k: 'PK', d: 'Unique number of each room (Primary Key).' },
                { n: 'room_number', t: 'VARCHAR(10)', d: 'Number on the door, e.g. 101. NOT NULL + UNIQUE.' },
                { n: 'room_type', t: 'VARCHAR(20)', d: 'Single / Double / Deluxe / Suite.' },
                { n: 'price_per_night', t: 'DECIMAL(8,2)', d: 'Price of one night. CHECK makes sure it is more than 0.' },
                { n: 'status', t: 'VARCHAR(20)', d: 'Available / Booked / Maintenance. DEFAULT is Available.' }
            ],
            sql: 'CREATE TABLE rooms (\n' +
                '    room_id          INT PRIMARY KEY,\n' +
                '    room_number      VARCHAR(10)  NOT NULL UNIQUE,\n' +
                '    room_type        VARCHAR(20)  NOT NULL,\n' +
                '    price_per_night  DECIMAL(8,2) NOT NULL CHECK (price_per_night > 0),\n' +
                "    status           VARCHAR(20)  DEFAULT 'Available'\n" +
                ');'
        },
        staff: {
            label: 'STAFF', pos: [0, 110, -440], rows: 5,
            desc: 'People who work in the hotel. A receptionist or the manager makes the bookings.',
            cols: [
                { n: 'staff_id', t: 'INT', k: 'PK', d: 'Unique number of each staff member (Primary Key).' },
                { n: 'staff_name', t: 'VARCHAR(50)', d: 'NOT NULL - name of the employee.' },
                { n: 'role', t: 'VARCHAR(30)', d: 'Manager / Receptionist / Housekeeping / Accountant.' },
                { n: 'phone', t: 'VARCHAR(15)', d: 'Phone number of the employee.' },
                { n: 'salary', t: 'DECIMAL(10,2)', d: 'Monthly salary.' }
            ],
            sql: 'CREATE TABLE staff (\n' +
                '    staff_id    INT PRIMARY KEY,\n' +
                '    staff_name  VARCHAR(50) NOT NULL,\n' +
                '    role        VARCHAR(30) NOT NULL,\n' +
                '    phone       VARCHAR(15),\n' +
                '    salary      DECIMAL(10,2)\n' +
                ');'
        },
        bookings: {
            label: 'BOOKINGS', pos: [0, 0, 0], rows: 10,
            desc: 'The centre of the whole system. Each row says WHO (customer) booked WHICH room, for WHICH dates, and which staff member made the booking.',
            cols: [
                { n: 'booking_id', t: 'INT', k: 'PK', d: 'Unique number of each booking (Primary Key).' },
                { n: 'customer_id', t: 'INT', k: 'FK', d: 'Foreign Key to customers - who made the booking.' },
                { n: 'room_id', t: 'INT', k: 'FK', d: 'Foreign Key to rooms - which room is booked.' },
                { n: 'staff_id', t: 'INT', k: 'FK', d: 'Foreign Key to staff - who created the booking.' },
                { n: 'check_in', t: 'DATE', d: 'Arrival date. NOT NULL.' },
                { n: 'check_out', t: 'DATE', d: 'Leaving date. CHECK (check_out > check_in).' },
                { n: 'booking_status', t: 'VARCHAR(20)', d: 'Confirmed / Cancelled / Completed. DEFAULT is Confirmed.' }
            ],
            sql: 'CREATE TABLE bookings (\n' +
                '    booking_id      INT PRIMARY KEY,\n' +
                '    customer_id     INT  NOT NULL,\n' +
                '    room_id         INT  NOT NULL,\n' +
                '    staff_id        INT,\n' +
                '    check_in        DATE NOT NULL,\n' +
                '    check_out       DATE NOT NULL,\n' +
                "    booking_status  VARCHAR(20) DEFAULT 'Confirmed',\n" +
                '    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),\n' +
                '    FOREIGN KEY (room_id)     REFERENCES rooms(room_id),\n' +
                '    FOREIGN KEY (staff_id)    REFERENCES staff(staff_id),\n' +
                '    CHECK (check_out > check_in)\n' +
                ');'
        },
        payments: {
            label: 'PAYMENTS', pos: [0, -50, 420], rows: 7,
            desc: 'Money paid for a booking. One booking can have only one payment.',
            cols: [
                { n: 'payment_id', t: 'INT', k: 'PK', d: 'Unique number of each payment (Primary Key).' },
                { n: 'booking_id', t: 'INT', k: 'FK', d: 'Foreign Key to bookings. UNIQUE, so one booking = one payment.' },
                { n: 'amount', t: 'DECIMAL(10,2)', d: 'Money paid. NOT NULL.' },
                { n: 'payment_date', t: 'DATE', d: 'Date of the payment. NOT NULL.' },
                { n: 'payment_method', t: 'VARCHAR(20)', d: 'Cash / Card / UPI.' }
            ],
            sql: 'CREATE TABLE payments (\n' +
                '    payment_id      INT PRIMARY KEY,\n' +
                '    booking_id      INT NOT NULL UNIQUE,\n' +
                '    amount          DECIMAL(10,2) NOT NULL,\n' +
                '    payment_date    DATE NOT NULL,\n' +
                '    payment_method  VARCHAR(20),\n' +
                '    FOREIGN KEY (booking_id) REFERENCES bookings(booking_id)\n' +
                ');'
        }
    };
    var ENTITY_IDS = Object.keys(ENTITIES);

    var RELS = {
        makes: {
            label: 'MAKES', from: 'customers', to: 'bookings', card: ['1', 'N'], type: 'One to Many (1 : N)',
            desc: 'One customer can make many bookings, but every booking belongs to only one customer.',
            sql: '-- inside CREATE TABLE bookings\nFOREIGN KEY (customer_id) REFERENCES customers(customer_id)',
            example: 'Aman Gupta (customer 1) has made 2 bookings: booking 1 and booking 6.'
        },
        reserved: {
            label: 'RESERVED', from: 'rooms', to: 'bookings', card: ['1', 'N'], type: 'One to Many (1 : N)',
            desc: 'One room can be booked many times (on different dates), but every booking is for only one room.',
            sql: '-- inside CREATE TABLE bookings\nFOREIGN KEY (room_id) REFERENCES rooms(room_id)',
            example: 'Room 103 is used in booking 1 and booking 5. Room 201 is used in booking 2 and booking 6.'
        },
        handles: {
            label: 'HANDLES', from: 'staff', to: 'bookings', card: ['1', 'N'], type: 'One to Many (1 : N)',
            desc: 'One staff member can make many bookings, but each booking is made by one staff member.',
            sql: '-- inside CREATE TABLE bookings\nFOREIGN KEY (staff_id) REFERENCES staff(staff_id)',
            example: 'Priya Sharma (staff 2) handled 5 bookings: 1, 3, 6, 7 and 10.'
        },
        has: {
            label: 'HAS', from: 'bookings', to: 'payments', card: ['1', '1'], type: 'One to One (1 : 1)',
            desc: 'One booking has at most one payment, and each payment is for exactly one booking. The UNIQUE on payments.booking_id makes it one-to-one.',
            sql: '-- inside CREATE TABLE payments\nbooking_id INT NOT NULL UNIQUE,\nFOREIGN KEY (booking_id) REFERENCES bookings(booking_id)',
            example: 'Booking 9 has payment 7 (Rs. 20000 by Card). Booking 8 has no payment yet.'
        }
    };
    var REL_IDS = Object.keys(RELS);

    // A relationship diamond sits in the middle of its two tables
    REL_IDS.forEach(function (id) {
        var r = RELS[id], a = ENTITIES[r.from].pos, b = ENTITIES[r.to].pos;
        r.pos = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
    });

    function mid(a, b) {
        var p = ENTITIES[a].pos, q = ENTITIES[b].pos;
        return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];
    }

    /* =====================================================
       2. STORY MODE - one guest from check-in to check-out
       (same SQL as sql/04_checkin_story.sql)
       ===================================================== */
    var STORY = [
        {
            title: 'A guest arrives at the hotel',
            text: '<b>Riya Kapoor</b> from Lucknow walks into Grand Stay Hotel. She wants a <b>Deluxe room</b> for 2 nights, from <b>15 Nov</b> to <b>17 Nov 2026</b>. Receptionist <b>Amit Kumar</b> (staff_id 3) opens the Hotel Reservation System. Let us follow every step and see which table of the database is used.',
            focus: ['customers', 'staff'], links: [], cols: { staff: ['staff_id', 'staff_name', 'role'] },
            badges: { staff: 'Amit at the desk' },
            cam: { yaw: -0.45, pitch: 0.5, zoom: 1, center: [0, 0, 0] },
            sql: 'USE hotel_db;   -- open our database',
            tables: [{
                title: 'staff - the receptionist who helps Riya',
                head: ['staff_id', 'staff_name', 'role'],
                rows: [{ hi: true, c: ['3', 'Amit Kumar', 'Receptionist'] }]
            }]
        },
        {
            title: "Save the customer's details",
            text: 'Riya is a new customer, so her details are added to the <b>customers</b> table using <code>INSERT</code>. She gets <b>customer_id = 11</b>. This is the <b>Primary Key</b>, so no other customer can have the number 11. Because <code>phone</code> is <b>UNIQUE</b>, the same phone number cannot be saved twice.',
            focus: ['customers'], links: [], cols: { customers: ['*'] },
            badges: { customers: '+1 ROW' }, delta: { customers: 1 },
            cam: { yaw: 0.35, pitch: 0.42, zoom: 1.7, center: ENTITIES.customers.pos },
            sql: "INSERT INTO customers VALUES\n(11, 'Riya', 'Kapoor', '9810000011', 'riya.kapoor@gmail.com', 'Lucknow');",
            tables: [{
                title: 'customers (last 2 rows)',
                head: ['customer_id', 'first_name', 'last_name', 'phone', 'city'],
                rows: [['10', 'Meera', 'Iyer', '9810000010', 'Chennai'],
                       { isNew: true, c: ['11', 'Riya', 'Kapoor', '9810000011', 'Lucknow'] }]
            }]
        },
        {
            title: 'Find a free Deluxe room',
            text: 'Amit searches the <b>rooms</b> table. The <code>WHERE</code> clause keeps only the rooms that are <b>Available</b> AND of type <b>Deluxe</b>. Room 202 is also Deluxe, but it is already Booked, so it is filtered out. Riya gets <b>room 201</b> (room_id 5) at Rs. 4000 per night.',
            focus: ['rooms'], links: [], cols: { rooms: ['room_number', 'room_type', 'price_per_night', 'status'] },
            badges: { rooms: 'SELECT ... WHERE' },
            cam: { yaw: -0.35, pitch: 0.42, zoom: 1.7, center: ENTITIES.rooms.pos },
            sql: "SELECT room_id, room_number, room_type, price_per_night\nFROM rooms\nWHERE status = 'Available' AND room_type = 'Deluxe';",
            tables: [{
                title: 'Result of the query',
                head: ['room_id', 'room_number', 'room_type', 'price_per_night'],
                rows: [{ hi: true, c: ['5', '201', 'Deluxe', '4000.00'] }]
            }]
        },
        {
            title: 'Create the booking',
            text: 'A new row is added to <b>bookings</b>. It does not store Riya\'s name or the room price again. It only stores <b>IDs</b>: customer_id <b>11</b> (Riya), room_id <b>5</b> (room 201) and staff_id <b>3</b> (Amit). These are <b>Foreign Keys</b>. Watch the moving dots: the IDs flow from CUSTOMERS, ROOMS and STAFF into BOOKINGS. If we used a customer_id that does not exist, MySQL would stop us with an error. The <code>CHECK</code> makes sure check-out is after check-in.',
            focus: ['customers', 'rooms', 'staff', 'bookings'], links: ['makes', 'reserved', 'handles'],
            cols: { bookings: ['*'] }, badges: { bookings: '+1 ROW' }, delta: { bookings: 1 },
            cam: { yaw: -0.2, pitch: 0.55, zoom: 0.95, center: [20, 30, -60] },
            sql: "INSERT INTO bookings VALUES\n(12, 11, 5, 3, '2026-11-15', '2026-11-17', 'Confirmed');",
            tables: [{
                title: 'bookings (new row)',
                head: ['booking_id', 'customer_id', 'room_id', 'staff_id', 'check_in', 'check_out', 'booking_status'],
                rows: [{ isNew: true, c: ['12', '11', '5', '3', '2026-11-15', '2026-11-17', 'Confirmed'] }]
            }]
        },
        {
            title: 'Mark the room as Booked',
            text: 'Room 201 is not free any more, so its <b>status</b> is changed with <code>UPDATE</code>. The <code>WHERE room_id = 5</code> part is very important: without it, <b>every</b> room in the hotel would become Booked!',
            focus: ['rooms'], links: [], cols: { rooms: ['room_id', 'status'] },
            badges: { rooms: 'status = Booked' },
            cam: { yaw: -0.6, pitch: 0.42, zoom: 1.7, center: ENTITIES.rooms.pos },
            sql: "UPDATE rooms\nSET status = 'Booked'\nWHERE room_id = 5;",
            tables: [{
                title: 'rooms (changed row)',
                head: ['room_id', 'room_number', 'room_type', 'status'],
                rows: [['5', '201', 'Deluxe', { from: 'Available', to: 'Booked' }]]
            }]
        },
        {
            title: 'Check-in day',
            text: 'On 15 Nov Riya comes to the front desk and Amit checks her booking. The booking row only has IDs, so a <b>JOIN</b> brings the name from <b>customers</b> and the room number from <b>rooms</b>. Rows are matched where the IDs are equal (<code>b.customer_id = c.customer_id</code>). Riya gets the key of room 201. She is checked in!',
            focus: ['customers', 'bookings', 'rooms'], links: ['makes', 'reserved'],
            cols: {
                customers: ['customer_id', 'first_name', 'last_name'],
                bookings: ['booking_id', 'customer_id', 'room_id', 'check_in', 'check_out'],
                rooms: ['room_id', 'room_number']
            },
            badges: { bookings: 'JOIN' },
            cam: { yaw: 0, pitch: 0.3, zoom: 0.95, center: [0, 0, 0] },
            sql: 'SELECT b.booking_id, c.first_name, c.last_name,\n       r.room_number, b.check_in, b.check_out\nFROM bookings b\nJOIN customers c ON b.customer_id = c.customer_id\nJOIN rooms r     ON b.room_id = r.room_id\nWHERE b.booking_id = 12;',
            tables: [{
                title: 'Result of the JOIN',
                head: ['booking_id', 'first_name', 'last_name', 'room_number', 'check_in', 'check_out'],
                rows: [{ hi: true, c: ['12', 'Riya', 'Kapoor', '201', '2026-11-15', '2026-11-17'] }]
            }]
        },
        {
            title: 'Check-out: calculate the bill',
            text: 'On 17 Nov Riya checks out. The bill is not stored anywhere, it is <b>calculated</b>. <code>DATEDIFF(check_out, check_in)</code> gives the number of nights: 17 - 15 = <b>2 nights</b>. Then 2 x Rs. 4000 (price_per_night from <b>rooms</b>) = <b>Rs. 8000</b>.',
            focus: ['bookings', 'rooms'], links: ['reserved'],
            cols: { bookings: ['booking_id', 'room_id', 'check_in', 'check_out'], rooms: ['room_id', 'price_per_night'] },
            badges: { bookings: '2 nights', rooms: 'x 4000' },
            cam: { yaw: -0.15, pitch: 0.38, zoom: 1.3, center: mid('bookings', 'rooms') },
            sql: 'SELECT b.booking_id,\n       DATEDIFF(b.check_out, b.check_in) AS nights,\n       r.price_per_night,\n       DATEDIFF(b.check_out, b.check_in) * r.price_per_night AS total_bill\nFROM bookings b\nJOIN rooms r ON b.room_id = r.room_id\nWHERE b.booking_id = 12;',
            tables: [{
                title: 'Result: the bill',
                head: ['booking_id', 'nights', 'price_per_night', 'total_bill'],
                rows: [{ hi: true, c: ['12', '2', '4000.00', '8000.00'] }]
            }]
        },
        {
            title: 'Take the payment',
            text: 'Riya pays <b>Rs. 8000 by UPI</b>. A new row is added to <b>payments</b> with booking_id <b>12</b> (Foreign Key). Because <code>booking_id</code> is <b>UNIQUE</b> in payments, booking 12 can never be paid twice. This is the <b>1 : 1</b> relationship.',
            focus: ['bookings', 'payments'], links: ['has'],
            cols: { payments: ['*'] },
            badges: { payments: '+1 ROW' }, delta: { payments: 1 },
            cam: { yaw: 0.3, pitch: 0.75, zoom: 1.2, center: mid('bookings', 'payments') },
            sql: "INSERT INTO payments VALUES\n(8, 12, 8000.00, '2026-11-17', 'UPI');",
            tables: [{
                title: 'payments (last 2 rows)',
                head: ['payment_id', 'booking_id', 'amount', 'payment_date', 'payment_method'],
                rows: [['7', '9', '20000.00', '2026-11-02', 'Card'],
                       { isNew: true, c: ['8', '12', '8000.00', '2026-11-17', 'UPI'] }]
            }]
        },
        {
            title: 'Check-out complete',
            text: 'Two <code>UPDATE</code> statements finish the stay: the booking becomes <b>Completed</b> and room 201 becomes <b>Available</b> again, ready for the next guest.',
            focus: ['bookings', 'rooms'], links: ['reserved'],
            cols: { bookings: ['booking_id', 'booking_status'], rooms: ['room_id', 'status'] },
            badges: { bookings: 'Completed', rooms: 'Available' },
            cam: { yaw: -0.3, pitch: 0.45, zoom: 1.25, center: mid('bookings', 'rooms') },
            sql: "UPDATE bookings\nSET booking_status = 'Completed'\nWHERE booking_id = 12;\n\nUPDATE rooms\nSET status = 'Available'\nWHERE room_id = 5;",
            tables: [{
                title: 'bookings (changed row)',
                head: ['booking_id', 'booking_status'],
                rows: [['12', { from: 'Confirmed', to: 'Completed' }]]
            }, {
                title: 'rooms (changed row)',
                head: ['room_id', 'room_number', 'status'],
                rows: [['5', '201', { from: 'Booked', to: 'Available' }]]
            }]
        },
        {
            title: 'The End - one stay, five tables',
            text: "Riya's whole stay is now saved in the database. One query that JOINs <b>all 5 tables</b> shows the complete story. Every table is connected to <b>bookings</b> through Foreign Keys. That is the main idea of this ER diagram.",
            extra: '<ul class="story-summary">' +
                '<li><b>customers</b>: +1 row (Riya, customer 11)</li>' +
                '<li><b>rooms</b>: room 201 went Available &rarr; Booked &rarr; Available</li>' +
                '<li><b>staff</b>: Amit Kumar handled the booking</li>' +
                '<li><b>bookings</b>: +1 row (booking 12, now Completed)</li>' +
                '<li><b>payments</b>: +1 row (Rs. 8000 by UPI)</li></ul>',
            focus: ENTITY_IDS.slice(), links: REL_IDS.slice(), cols: {},
            badges: {},
            cam: { pitch: 0.5, zoom: 0.88, center: [0, -10, 60] }, spin: true,
            sql: 'SELECT c.first_name, c.last_name, s.staff_name, r.room_number,\n       b.check_in, b.check_out, b.booking_status,\n       p.amount, p.payment_method\nFROM bookings b\nJOIN customers c ON b.customer_id = c.customer_id\nJOIN rooms r     ON b.room_id = r.room_id\nJOIN staff s     ON b.staff_id = s.staff_id\nJOIN payments p  ON b.booking_id = p.booking_id\nWHERE b.booking_id = 12;',
            tables: [{
                title: 'Result: the full stay',
                head: ['first_name', 'last_name', 'staff_name', 'room_number', 'check_in', 'check_out', 'booking_status', 'amount', 'payment_method'],
                rows: [{ hi: true, c: ['Riya', 'Kapoor', 'Amit Kumar', '201', '2026-11-15', '2026-11-17', 'Completed', '8000.00', 'UPI'] }]
            }]
        }
    ];

    // Row count of every table after each story step (for the "11 rows" text)
    var BASE_ROWS = {};
    ENTITY_IDS.forEach(function (id) { BASE_ROWS[id] = ENTITIES[id].rows; });
    STORY.forEach(function (S, i) {
        var prev = i === 0 ? BASE_ROWS : STORY[i - 1].counts;
        S.counts = {};
        ENTITY_IDS.forEach(function (id) {
            S.counts[id] = prev[id] + ((S.delta && S.delta[id]) || 0);
        });
    });

    /* =====================================================
       3. CAMERA / 3D MATHS
       ===================================================== */
    var FOCAL = 2000;          // bigger = less perspective
    var FLOOR_Y = -170;        // height of the grid floor
    var CARD_W = 224, HEAD_H = 48, ROW_H = 21;
    var DIA_W = 100, DIA_H = 46;
    var DEFAULT_CAM = { yaw: -0.4, pitch: 0.5, zoom: 1, center: [0, 0, 20] };
    var STEP_MS = 9000;        // time of one story step when playing (1x)

    var view = { yaw: -0.4, pitch: 0.5, zoom: 1, cx: 0, cy: 0, cz: 20 };
    var camTarget = null;
    var W = 0, H = 0, fit = 1;

    function project(p) {
        var x = p[0] - view.cx, y = p[1] - view.cy, z = p[2] - view.cz;
        var cyw = Math.cos(view.yaw), syw = Math.sin(view.yaw);
        var x1 = x * cyw + z * syw;          // turn left / right (yaw)
        var z1 = -x * syw + z * cyw;
        var cp = Math.cos(view.pitch), sp = Math.sin(view.pitch);
        var y2 = y * cp - z1 * sp;           // tilt up / down (pitch)
        var z2 = y * sp + z1 * cp;
        var d = FOCAL - z2;
        var s = (FOCAL / Math.max(d, 1)) * fit * view.zoom;   // perspective scale
        return { x: W / 2 + x1 * s, y: H / 2 - y2 * s, s: s, z: z2, bad: d < 150 };
    }

    function lerp3(a, b, t) {
        return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
    }
    function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
    function angleDiff(a, b) {
        var d = (a - b) % (Math.PI * 2);
        if (d > Math.PI) d -= Math.PI * 2;
        if (d < -Math.PI) d += Math.PI * 2;
        return d;
    }

    function setCam(c, merge) {
        var t = merge && camTarget ? camTarget : {};
        if (c.yaw != null) t.yaw = c.yaw;
        if (c.pitch != null) t.pitch = c.pitch;
        if (c.zoom != null) t.zoom = c.zoom;
        if (c.center) t.center = c.center.slice();
        camTarget = t;
    }

    /* =====================================================
       4. STATE
       ===================================================== */
    var mode = 'explore';       // 'explore' or 'story'
    var step = 0, playing = false, speed = 1, stepTimer = 0;
    var SPEEDS = [1, 1.5, 2];
    var selection = null;       // { type: 'e' | 'r', id }
    var hover = null;
    var showCols = false;
    var autoRotate = !reduceMotion;
    var time = 0, lastInteract = -99999, flashAt = -99999;
    var hitList = [];
    var drag = null;

    ENTITY_IDS.forEach(function (id) { ENTITIES[id].alpha = 1; ENTITIES[id].open = 0; });
    REL_IDS.forEach(function (id) { RELS[id].alpha = 1; });

    function computeState() {
        var st = { focus: null, strong: {}, links: {}, cols: {}, badges: {}, open: {}, counts: BASE_ROWS };
        if (mode === 'story') {
            var S = STORY[step];
            st.focus = {};
            S.focus.forEach(function (id) { st.focus[id] = true; st.strong[id] = true; });
            S.links.forEach(function (id) { st.links[id] = true; });
            Object.keys(S.cols).forEach(function (id) {
                st.cols[id] = {};
                S.cols[id].forEach(function (c) { st.cols[id][c] = true; });
            });
            st.badges = S.badges || {};
            st.counts = S.counts;
            ENTITY_IDS.forEach(function (id) { st.open[id] = !!S.cols[id]; });
        } else {
            if (selection) {
                st.focus = {};
                if (selection.type === 'e') {
                    st.focus[selection.id] = true;
                    st.strong[selection.id] = true;
                    REL_IDS.forEach(function (rid) {
                        var r = RELS[rid];
                        if (r.from === selection.id || r.to === selection.id) {
                            st.links[rid] = true;
                            st.focus[r.from] = true;
                            st.focus[r.to] = true;
                        }
                    });
                } else {
                    var r = RELS[selection.id];
                    st.links[selection.id] = true;
                    st.focus[r.from] = st.strong[r.from] = true;
                    st.focus[r.to] = st.strong[r.to] = true;
                }
            }
            ENTITY_IDS.forEach(function (id) {
                st.open[id] = showCols ||
                    (selection && selection.type === 'e' && selection.id === id) ||
                    (hover && hover.type === 'e' && hover.id === id);
            });
        }
        return st;
    }

    /* =====================================================
       5. UPDATE (runs every frame)
       ===================================================== */
    var state = computeState();

    function update(dt) {
        state = computeState();
        // smooth movement (or instant, if the user asked the system for less motion)
        var k = reduceMotion ? 1 : 1 - Math.exp(-dt / 280);

        if (camTarget) {
            var done = true;
            if (camTarget.yaw != null) {
                var dy = angleDiff(camTarget.yaw, view.yaw);
                view.yaw += dy * k;
                if (Math.abs(dy) < 0.002) camTarget.yaw = null; else done = false;
            }
            if (camTarget.pitch != null) {
                var dp = camTarget.pitch - view.pitch;
                view.pitch += dp * k;
                if (Math.abs(dp) < 0.002) camTarget.pitch = null; else done = false;
            }
            if (camTarget.zoom != null) {
                var dz = camTarget.zoom - view.zoom;
                view.zoom += dz * k;
                if (Math.abs(dz) < 0.002) camTarget.zoom = null; else done = false;
            }
            if (camTarget.center) {
                var c = camTarget.center;
                view.cx += (c[0] - view.cx) * k;
                view.cy += (c[1] - view.cy) * k;
                view.cz += (c[2] - view.cz) * k;
                if (Math.abs(c[0] - view.cx) + Math.abs(c[1] - view.cy) + Math.abs(c[2] - view.cz) < 0.5) camTarget.center = null;
                else done = false;
            }
            if (done) camTarget = null;
        }

        // slow automatic turning
        var spinStory = mode === 'story' && STORY[step].spin;
        var canSpin = (mode === 'explore' && autoRotate) || (spinStory && !reduceMotion);
        if (canSpin && !drag && !hover && !(camTarget && camTarget.yaw != null) && time - lastInteract > 2500) {
            view.yaw += dt * 0.00012;
        }

        // fade / open / close animations
        ENTITY_IDS.forEach(function (id) {
            var e = ENTITIES[id];
            var a = (!state.focus || state.focus[id]) ? 1 : 0.14;
            e.alpha += (a - e.alpha) * k;
            e.open += ((state.open[id] ? 1 : 0) - e.open) * k;
        });
        REL_IDS.forEach(function (id) {
            var a = (!state.focus || state.links[id]) ? 1 : 0.12;
            RELS[id].alpha += (a - RELS[id].alpha) * k;
        });

        // story autoplay
        if (mode === 'story' && playing) {
            stepTimer += dt * speed;
            if (stepTimer >= STEP_MS) {
                if (step < STORY.length - 1) goStep(step + 1, true);
                else { playing = false; stepTimer = 0; updateStoryControls(); }
            }
        }
        if (mode === 'story') {
            var frac = (step + (playing ? Math.min(stepTimer / STEP_MS, 1) : 0)) / (STORY.length - 1);
            $('er-progress').style.width = (Math.min(frac, 1) * 100).toFixed(2) + '%';
        }
    }

    /* =====================================================
       6. DRAWING
       ===================================================== */
    function roundRect(x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function shortType(t) { return t.replace(/\(.*\)/, ''); }

    function cardHeight(e) {
        return HEAD_H + (e.cols.length * ROW_H + 10) * e.open;
    }

    function drawBackground() {
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, W, H);
        var g = ctx.createRadialGradient(W / 2, H * 0.42, 0, W / 2, H * 0.42, Math.max(W, H) * 0.75);
        g.addColorStop(0, 'rgba(255,255,255,0.08)');
        g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
    }

    function drawFloor() {
        var GRID = 900, STEP = 100;
        var c0 = project([view.cx, FLOOR_Y, view.cz]);
        var grad = ctx.createRadialGradient(c0.x, c0.y, 0, c0.x, c0.y, Math.max(1, 820 * c0.s));
        grad.addColorStop(0, 'rgba(255,255,255,0.20)');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (var i = -GRID; i <= GRID; i += STEP) {
            seg([i, FLOOR_Y, -GRID], [i, FLOOR_Y, GRID]);
            seg([-GRID, FLOOR_Y, i], [GRID, FLOOR_Y, i]);
        }
        ctx.stroke();

        function seg(a, b) {
            var pa = project(a), pb = project(b);
            if (pa.bad || pb.bad) return;
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
        }
    }

    function drawShadows() {
        ENTITY_IDS.forEach(function (id) {
            var e = ENTITIES[id], p = e.p, fp = e.fp;
            if (fp.bad) return;
            var a = e.alpha;
            // shadow on the floor
            var rx = 95 * fp.s, ry = rx * Math.max(0.12, Math.sin(view.pitch));
            ctx.save();
            ctx.translate(fp.x, fp.y);
            ctx.scale(1, ry / rx);
            var g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
            g.addColorStop(0, 'rgba(255,255,255,' + (0.16 * a) + ')');
            g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.fillStyle = g;
            ctx.beginPath();
            ctx.arc(0, 0, rx, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            // dashed line from the card down to the floor
            ctx.save();
            ctx.setLineDash([3, 4]);
            ctx.strokeStyle = 'rgba(255,255,255,' + (0.22 * a) + ')';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y + cardHeight(e) * p.s / 2);
            ctx.lineTo(fp.x, fp.y);
            ctx.stroke();
            ctx.restore();
        });
    }

    function drawLinks() {
        var sec = time / 1000;
        REL_IDS.forEach(function (id) {
            var r = RELS[id], A = ENTITIES[r.from], B = ENTITIES[r.to];
            var active = !!state.links[id];
            var a = r.alpha;
            var s = r.p.s;

            ctx.save();
            if (active) { ctx.shadowColor = 'rgba(255,255,255,0.7)'; ctx.shadowBlur = 10; }
            ctx.strokeStyle = 'rgba(255,255,255,' + ((active ? 0.95 : 0.42) * a) + ')';
            ctx.lineWidth = (active ? 2.6 : 1.4) * s;
            ctx.beginPath();
            ctx.moveTo(A.p.x, A.p.y);
            ctx.lineTo(r.p.x, r.p.y);
            ctx.lineTo(B.p.x, B.p.y);
            ctx.stroke();
            ctx.restore();

            // moving dots = IDs travelling through the foreign key
            if (reduceMotion && !active) return;
            var n = active ? 4 : 2;
            var spd = active ? 0.45 : 0.12;
            ctx.save();
            if (active) { ctx.shadowColor = '#fff'; ctx.shadowBlur = 12; }
            ctx.fillStyle = 'rgba(255,255,255,' + ((active ? 1 : 0.6) * a) + ')';
            for (var i = 0; i < n; i++) {
                var t = (sec * spd + i / n) % 1;
                var P = t < 0.5 ? lerp3(A.pos, r.pos, t * 2) : lerp3(r.pos, B.pos, (t - 0.5) * 2);
                var pp = project(P);
                ctx.beginPath();
                ctx.arc(pp.x, pp.y, (active ? 4.2 : 2.6) * pp.s, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        });
    }

    function drawCard(id) {
        var e = ENTITIES[id], p = e.p, s = p.s;
        var strong = !!state.strong[id];
        var hovered = hover && hover.type === 'e' && hover.id === id;
        var w = CARD_W * s, h = cardHeight(e) * s;
        var x = p.x - w / 2, y = p.y - h / 2;
        hitList.push({ type: 'e', id: id, x: x, y: y, w: w, h: h });

        var flash = reduceMotion ? 0 : Math.max(0, 1 - (time - flashAt) / 900);

        ctx.save();
        ctx.globalAlpha = e.alpha;

        // body + glow
        if (strong) {
            ctx.shadowColor = 'rgba(255,255,255,0.6)';
            ctx.shadowBlur = (14 + 26 * flash) * s;
        }
        roundRect(x, y, w, h, 6 * s);
        ctx.fillStyle = '#0a0a0a';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = (strong ? 2.2 : hovered ? 1.8 : 1.2) * s;
        ctx.strokeStyle = (strong || hovered) ? '#fff' : 'rgba(255,255,255,0.6)';
        ctx.stroke();

        // everything inside the card is clipped to the card
        ctx.save();
        roundRect(x, y, w, h, 6 * s);
        ctx.clip();

        // header
        ctx.fillStyle = strong ? '#fff' : '#1c1c1c';
        ctx.fillRect(x, y, w, HEAD_H * s);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = strong ? '#000' : '#fff';
        ctx.font = 'bold ' + (17 * s) + 'px Arial, Helvetica, sans-serif';
        ctx.fillText(e.label, p.x, y + 19 * s);
        ctx.font = (12 * s) + 'px Arial, Helvetica, sans-serif';
        ctx.fillStyle = strong ? '#444' : '#aaa';
        var cnt = state.counts[id];
        ctx.fillText(cnt + ' rows' + (cnt !== BASE_ROWS[id] ? '  (+' + (cnt - BASE_ROWS[id]) + ')' : ''), p.x, y + 36 * s);

        // columns
        if (e.open > 0.02) {
            var hiCols = state.cols[id];
            var top = y + HEAD_H * s + 5 * s;
            for (var i = 0; i < e.cols.length; i++) {
                var c = e.cols[i];
                var ry = top + i * ROW_H * s;
                if (ry > y + h) break;
                var hi = hiCols && (hiCols['*'] || hiCols[c.n]);
                var rowMid = ry + (ROW_H * s) / 2 - 1 * s;
                if (hi) {
                    ctx.fillStyle = '#fff';
                    ctx.fillRect(x + 4 * s, ry, w - 8 * s, ROW_H * s - 2 * s);
                }
                if (c.k) {
                    var bx = x + 10 * s, bw = 26 * s, bh = 13 * s, by = rowMid - bh / 2;
                    if (c.k === 'PK') {
                        ctx.fillStyle = hi ? '#000' : '#fff';
                        ctx.fillRect(bx, by, bw, bh);
                        ctx.fillStyle = hi ? '#fff' : '#000';
                    } else {
                        ctx.strokeStyle = hi ? '#000' : '#fff';
                        ctx.lineWidth = 1 * s;
                        ctx.strokeRect(bx, by, bw, bh);
                        ctx.fillStyle = hi ? '#000' : '#fff';
                    }
                    ctx.textAlign = 'center';
                    ctx.font = 'bold ' + (9 * s) + 'px Arial, Helvetica, sans-serif';
                    ctx.fillText(c.k, bx + bw / 2, rowMid + 0.5 * s);
                }
                ctx.textAlign = 'left';
                ctx.font = (13 * s) + 'px Consolas, "Courier New", monospace';
                ctx.fillStyle = hi ? '#000' : '#eee';
                ctx.fillText(c.n, x + 44 * s, rowMid);
                ctx.textAlign = 'right';
                ctx.font = (11 * s) + 'px Consolas, "Courier New", monospace';
                ctx.fillStyle = hi ? '#444' : '#888';
                ctx.fillText(shortType(c.t), x + w - 10 * s, rowMid);
            }
        }
        ctx.restore();
        ctx.restore();
    }

    function drawDiamond(id) {
        var r = RELS[id], p = r.p, s = p.s;
        var on = !!state.links[id] || (selection && selection.type === 'r' && selection.id === id);
        var hovered = hover && hover.type === 'r' && hover.id === id;
        var hw = (DIA_W / 2) * s, hh = (DIA_H / 2) * s;
        hitList.push({ type: 'r', id: id, cx: p.x, cy: p.y, hw: hw, hh: hh });

        ctx.save();
        ctx.globalAlpha = r.alpha;
        if (on) { ctx.shadowColor = 'rgba(255,255,255,0.6)'; ctx.shadowBlur = 14 * s; }
        ctx.beginPath();
        ctx.moveTo(p.x - hw, p.y);
        ctx.lineTo(p.x, p.y - hh);
        ctx.lineTo(p.x + hw, p.y);
        ctx.lineTo(p.x, p.y + hh);
        ctx.closePath();
        ctx.fillStyle = on ? '#fff' : '#000';
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.lineWidth = (on || hovered ? 2 : 1.3) * s;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        ctx.fillStyle = on ? '#000' : '#fff';
        ctx.font = 'bold ' + (12 * s) + 'px Arial, Helvetica, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(r.label, p.x, p.y + 0.5 * s);

        drawCardinality(r, ENTITIES[r.from].p, r.card[0]);
        drawCardinality(r, ENTITIES[r.to].p, r.card[1]);
        ctx.restore();
    }

    // "1" and "N" written just outside the diamond, next to the line
    function drawCardinality(r, ep, text) {
        var p = r.p, s = p.s;
        var dx = ep.x - p.x, dy = ep.y - p.y;
        var len = Math.sqrt(dx * dx + dy * dy) || 1;
        dx /= len; dy /= len;
        var hw = (DIA_W / 2) * s, hh = (DIA_H / 2) * s;
        var edge = 1 / (Math.abs(dx) / hw + Math.abs(dy) / hh || 1);
        var d = edge + 13 * s;
        var lx = p.x + dx * d - dy * 10 * s;
        var ly = p.y + dy * d + dx * 10 * s;
        ctx.font = 'bold ' + (14 * s) + 'px Arial, Helvetica, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 3 * s;
        ctx.strokeStyle = '#000';
        ctx.strokeText(text, lx, ly);
        ctx.fillStyle = '#fff';
        ctx.fillText(text, lx, ly);
    }

    // small labels above the cards in story mode ("+1 ROW", "JOIN" ...)
    function drawBadges() {
        Object.keys(state.badges).forEach(function (id) {
            var e = ENTITIES[id], p = e.p, s = Math.max(p.s, 0.75);
            var text = state.badges[id];
            var bob = reduceMotion ? 0 : Math.sin(time / 260) * 3;
            ctx.save();
            ctx.globalAlpha = reduceMotion ? 1 : Math.min(1, (time - flashAt) / 400);
            ctx.font = 'bold ' + (12 * s) + 'px Arial, Helvetica, sans-serif';
            var tw = ctx.measureText(text).width;
            var bw = tw + 18 * s, bh = 22 * s;
            var bx = p.x - bw / 2, by = p.y - cardHeight(e) * p.s / 2 - bh - 10 * s + bob;
            ctx.shadowColor = 'rgba(255,255,255,0.8)';
            ctx.shadowBlur = 12;
            roundRect(bx, by, bw, bh, bh / 2);
            ctx.fillStyle = '#fff';
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.fillStyle = '#000';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, p.x, by + bh / 2 + 0.5);
            ctx.restore();
        });
    }

    function drawOverlay() {
        ctx.save();
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
        if (mode === 'story') {
            var S = STORY[step];
            ctx.fillStyle = '#9e9e9e';
            ctx.font = 'bold 12px Arial, Helvetica, sans-serif';
            ctx.fillText('STORY MODE  ·  STEP ' + (step + 1) + ' / ' + STORY.length, 16, 14);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 20px Arial, Helvetica, sans-serif';
            ctx.fillText(S.title, 16, 32);
            if (step === STORY.length - 1) {
                ctx.textAlign = 'right';
                ctx.font = 'bold 30px Arial, Helvetica, sans-serif';
                ctx.fillStyle = 'rgba(255,255,255,' + (0.85 + Math.sin(time / 500) * 0.15) + ')';
                ctx.fillText('THE END', W - 18, 16);
            }
        } else {
            ctx.fillStyle = '#9e9e9e';
            ctx.font = 'bold 12px Arial, Helvetica, sans-serif';
            ctx.fillText('LIVE 3D  ·  hotel_db  ·  5 tables  ·  4 relationships', 16, 14);
        }
        ctx.restore();
    }

    function draw() {
        drawBackground();
        drawFloor();

        ENTITY_IDS.forEach(function (id) {
            var e = ENTITIES[id];
            e.p = project(e.pos);
            e.fp = project([e.pos[0], FLOOR_Y, e.pos[2]]);
        });
        REL_IDS.forEach(function (id) { RELS[id].p = project(RELS[id].pos); });

        drawShadows();
        drawLinks();

        // draw far things first, near things last (so near covers far)
        var items = [];
        ENTITY_IDS.forEach(function (id) { items.push({ k: 'e', id: id, z: ENTITIES[id].p.z }); });
        REL_IDS.forEach(function (id) { items.push({ k: 'r', id: id, z: RELS[id].p.z }); });
        items.sort(function (a, b) { return a.z - b.z; });

        hitList = [];
        items.forEach(function (it) {
            if (it.k === 'e') drawCard(it.id); else drawDiamond(it.id);
        });
        drawBadges();
        drawOverlay();
    }

    /* =====================================================
       7. MOUSE / TOUCH
       ===================================================== */
    function hitTest(mx, my) {
        for (var i = hitList.length - 1; i >= 0; i--) {
            var h = hitList[i];
            var a = h.type === 'e' ? ENTITIES[h.id].alpha : RELS[h.id].alpha;
            if (a < 0.5) continue;               // faded items cannot be clicked
            if (h.type === 'e') {
                if (mx >= h.x && mx <= h.x + h.w && my >= h.y && my <= h.y + h.h) return h;
            } else if (Math.abs(mx - h.cx) / h.hw + Math.abs(my - h.cy) / h.hh <= 1) {
                return h;
            }
        }
        return null;
    }

    function localPos(ev) {
        var r = canvas.getBoundingClientRect();
        return { x: ev.clientX - r.left, y: ev.clientY - r.top };
    }

    canvas.addEventListener('pointerdown', function (ev) {
        drag = { x: ev.clientX, y: ev.clientY, sx: ev.clientX, sy: ev.clientY, moved: false };
        try { canvas.setPointerCapture(ev.pointerId); } catch (err) { /* ignore */ }
    });

    canvas.addEventListener('pointermove', function (ev) {
        var m = localPos(ev);
        if (drag) {
            var dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
            drag.x = ev.clientX;
            drag.y = ev.clientY;
            if (Math.abs(ev.clientX - drag.sx) + Math.abs(ev.clientY - drag.sy) > 5) drag.moved = true;
            if (drag.moved) {
                view.yaw += dx * 0.006;
                view.pitch = clamp(view.pitch + dy * 0.005, 0.12, 1.3);
                if (camTarget) { camTarget.yaw = null; camTarget.pitch = null; }
                lastInteract = time;
                canvas.style.cursor = 'grabbing';
            }
        } else {
            var h = hitTest(m.x, m.y);
            hover = (h && mode === 'explore') ? { type: h.type, id: h.id } : null;
            canvas.style.cursor = hover ? 'pointer' : 'grab';
        }
    });

    canvas.addEventListener('pointerup', function (ev) {
        if (drag && !drag.moved && mode === 'explore') {
            var m = localPos(ev);
            var h = hitTest(m.x, m.y);
            select(h ? { type: h.type, id: h.id } : null);
        }
        drag = null;
        canvas.style.cursor = hover ? 'pointer' : 'grab';
    });
    canvas.addEventListener('pointercancel', function () { drag = null; });
    canvas.addEventListener('pointerleave', function () { if (!drag) hover = null; });

    // Ctrl + mouse wheel (or touchpad pinch) = zoom. Normal scrolling still scrolls the page.
    canvas.addEventListener('wheel', function (ev) {
        if (!ev.ctrlKey && !ev.metaKey) return;
        ev.preventDefault();
        var z = clamp(view.zoom * Math.exp(-ev.deltaY * 0.0015), 0.45, 2.6);
        view.zoom = z;
        if (camTarget) camTarget.zoom = null;
        lastInteract = time;
    }, { passive: false });

    /* =====================================================
       8. EXPLORE MODE - info panel
       ===================================================== */
    function select(sel) {
        selection = sel;
        if (sel) {
            var pos = sel.type === 'e' ? ENTITIES[sel.id].pos : RELS[sel.id].pos;
            setCam({ center: [pos[0] * 0.6, pos[1] * 0.6, pos[2] * 0.6], zoom: 1.15 });
        } else {
            setCam({ center: DEFAULT_CAM.center, zoom: DEFAULT_CAM.zoom });
        }
        lastInteract = time;
        renderExplorePanel();
    }

    function renderExplorePanel() {
        var html;
        if (!selection) {
            html =
                '<div class="story-grid"><div>' +
                '<span class="tag">EXPLORE</span>' +
                '<h3>Click any table or diamond</h3>' +
                '<p>Each <b>box</b> is a table (entity) and each <b>diamond</b> is a relationship. ' +
                'The moving dots show IDs travelling from one table to another through <b>Foreign Keys</b>. ' +
                'Start with <b>BOOKINGS</b>, the centre of the whole system.</p>' +
                '<div class="quick">' + ENTITY_IDS.map(function (id) {
                    return '<button type="button" data-select="' + id + '">' + ENTITIES[id].label + '</button>';
                }).join('') + '</div>' +
                '<p class="small-note">Want to see a real check-in happen step by step? ' +
                '<button type="button" class="link-btn" data-start-story>Start Story Mode &#9654;</button></p>' +
                '</div><div>' +
                '<h4>How to read the diagram</h4>' +
                '<table class="mini-table legend">' +
                '<tr><td><span class="key pk">PK</span></td><td>Primary Key - unique ID of each row</td></tr>' +
                '<tr><td><span class="key fk">FK</span></td><td>Foreign Key - points to a row of another table</td></tr>' +
                '<tr><td>&#9671;</td><td>Diamond - relationship between two tables</td></tr>' +
                '<tr><td><b>1</b> / <b>N</b></td><td>Cardinality - one / many</td></tr>' +
                '<tr><td>&bull;</td><td>Moving dot - an ID flowing through a Foreign Key</td></tr>' +
                '</table></div></div>';
        } else if (selection.type === 'e') {
            var e = ENTITIES[selection.id];
            var rels = REL_IDS.filter(function (rid) {
                return RELS[rid].from === selection.id || RELS[rid].to === selection.id;
            });
            html =
                '<div class="story-grid"><div>' +
                '<span class="tag">TABLE</span>' +
                '<h3>' + e.label + ' <small>' + e.rows + ' rows</small></h3>' +
                '<p>' + e.desc + '</p>' +
                '<div class="table-scroll"><table class="mini-table cols-table"><tr><th>Column</th><th>Type</th><th>Key</th><th>Meaning</th></tr>' +
                e.cols.map(function (c) {
                    return '<tr><td><code>' + c.n + '</code></td><td>' + c.t + '</td><td>' +
                        (c.k ? '<span class="key ' + c.k.toLowerCase() + '">' + c.k + '</span>' : '') +
                        '</td><td>' + c.d + '</td></tr>';
                }).join('') + '</table></div>' +
                '<h4>Relationships</h4><ul class="rel-list">' +
                rels.map(function (rid) {
                    var r = RELS[rid];
                    return '<li><button type="button" class="link-btn" data-rel="' + rid + '">' +
                        ENTITIES[r.from].label + ' &mdash; ' + r.label + ' &mdash; ' + ENTITIES[r.to].label +
                        '</button> (' + r.card[0] + ' : ' + r.card[1] + ')</li>';
                }).join('') + '</ul>' +
                '</div><div>' +
                '<h4>SQL that creates this table</h4>' +
                '<pre><code class="sql">' + escapeHtml(e.sql) + '</code></pre>' +
                '<button type="button" class="link-btn" data-select="">&larr; Back to all tables</button>' +
                '</div></div>';
        } else {
            var r = RELS[selection.id];
            html =
                '<div class="story-grid"><div>' +
                '<span class="tag">RELATIONSHIP</span>' +
                '<h3>' + ENTITIES[r.from].label + ' &mdash; ' + r.label + ' &mdash; ' + ENTITIES[r.to].label + '</h3>' +
                '<p><b>Cardinality: ' + r.type + '</b></p>' +
                '<p>' + r.desc + '</p>' +
                '<p><b>Example from our data:</b> ' + r.example + '</p>' +
                '<div class="quick">' +
                '<button type="button" data-select="' + r.from + '">Open ' + ENTITIES[r.from].label + '</button>' +
                '<button type="button" data-select="' + r.to + '">Open ' + ENTITIES[r.to].label + '</button>' +
                '</div></div><div>' +
                '<h4>How it is made in SQL</h4>' +
                '<pre><code class="sql">' + escapeHtml(r.sql) + '</code></pre>' +
                '<button type="button" class="link-btn" data-select="">&larr; Back to all tables</button>' +
                '</div></div>';
        }
        panel.innerHTML = html;
        if (window.DocsSQL) window.DocsSQL.enhance(panel);
    }

    /* =====================================================
       9. STORY MODE - panel and controls
       ===================================================== */
    function renderCell(c) {
        if (c && typeof c === 'object') {
            return '<td class="changed"><s>' + c.from + '</s> &rarr; ' + c.to + '</td>';
        }
        return '<td>' + c + '</td>';
    }

    function renderMiniTable(t) {
        return '<p class="mini-title">' + t.title + '</p>' +
            '<div class="table-scroll"><table class="mini-table"><tr>' +
            t.head.map(function (h) { return '<th>' + h + '</th>'; }).join('') + '</tr>' +
            t.rows.map(function (r) {
                var cells = Array.isArray(r) ? r : r.c;
                var cls = r.isNew ? ' class="new-row"' : (r.hi ? ' class="hi-row"' : '');
                return '<tr' + cls + '>' + cells.map(renderCell).join('') + '</tr>';
            }).join('') + '</table></div>';
    }

    function renderStoryPanel() {
        var S = STORY[step];
        panel.innerHTML =
            '<div class="story-grid"><div>' +
            '<span class="tag">STEP ' + (step + 1) + ' / ' + STORY.length + '</span>' +
            '<h3>' + S.title + '</h3>' +
            '<p>' + S.text + '</p>' + (S.extra || '') +
            (S.tables ? '<h4>What the database shows / changes</h4>' + S.tables.map(renderMiniTable).join('') : '') +
            '</div><div>' +
            '<h4>SQL that runs in this step</h4>' +
            '<pre><code class="sql">' + escapeHtml(S.sql) + '</code></pre>' +
            '</div></div>';
        if (window.DocsSQL) window.DocsSQL.enhance(panel);
    }

    // keep the current step in the page link, so it can be shared (docs.html#story-4)
    function setLink(hash) {
        if (!window.history || !history.replaceState) return;
        history.replaceState(null, '', location.pathname + location.search + hash);
    }

    function goStep(i, auto) {
        step = clamp(i, 0, STORY.length - 1);
        stepTimer = 0;
        flashAt = time;
        var c = STORY[step].cam;
        setCam({ yaw: c.yaw, pitch: c.pitch, zoom: c.zoom, center: c.center });
        renderStoryPanel();
        updateStoryControls();
        setLink('#story-' + (step + 1));
        if (!auto) lastInteract = time;
    }

    function startStory(at) {
        mode = 'story';
        selection = null;
        hover = null;
        playing = false;
        viewer.classList.add('story');
        $('er-mode-story').classList.add('on');
        $('er-mode-explore').classList.remove('on');
        goStep(at || 0);
    }

    function exitStory() {
        mode = 'explore';
        playing = false;
        viewer.classList.remove('story');
        $('er-mode-story').classList.remove('on');
        $('er-mode-explore').classList.add('on');
        setCam(DEFAULT_CAM);
        renderExplorePanel();
        setLink('');
    }

    function updateStoryControls() {
        var last = step === STORY.length - 1;
        $('er-prev').disabled = step === 0;
        $('er-next').innerHTML = last ? 'Restart &#8635;' : 'Next &#9654;';
        $('er-play').innerHTML = playing ? '&#10074;&#10074; Pause' : '&#9654; Play';
        $('er-play').classList.toggle('on', playing);
        var dots = $('er-dots');
        if (dots.children.length !== STORY.length) {
            dots.innerHTML = STORY.map(function (S, i) {
                return '<button type="button" data-step="' + i + '" title="Step ' + (i + 1) + ': ' + S.title + '"></button>';
            }).join('');
        }
        Array.prototype.forEach.call(dots.children, function (b, i) {
            b.classList.toggle('on', i === step);
            b.classList.toggle('seen', i < step);
        });
    }

    /* =====================================================
       10. BUTTONS
       ===================================================== */
    $('er-mode-explore').addEventListener('click', function () { if (mode !== 'explore') exitStory(); });
    $('er-mode-story').addEventListener('click', function () { if (mode !== 'story') startStory(0); });
    $('er-exit').addEventListener('click', exitStory);

    $('er-cols').addEventListener('click', function () {
        showCols = !showCols;
        this.classList.toggle('on', showCols);
        this.textContent = 'Columns: ' + (showCols ? 'ON' : 'OFF');
        setCam({ zoom: showCols ? 0.82 : 1 }, true);
    });
    $('er-rotate').addEventListener('click', function () {
        autoRotate = !autoRotate;
        this.classList.toggle('on', autoRotate);
        this.textContent = 'Auto-rotate: ' + (autoRotate ? 'ON' : 'OFF');
        lastInteract = -99999;
    });
    $('er-zoom-in').addEventListener('click', function () {
        setCam({ zoom: clamp((camTarget && camTarget.zoom) || view.zoom, 0.45, 2.6) * 1.25 }, true);
    });
    $('er-zoom-out').addEventListener('click', function () {
        setCam({ zoom: clamp(((camTarget && camTarget.zoom) || view.zoom) / 1.25, 0.45, 2.6) }, true);
    });
    $('er-reset').addEventListener('click', function () {
        if (mode === 'story') goStep(step);
        else { selection = null; setCam(DEFAULT_CAM); renderExplorePanel(); }
    });

    $('er-prev').addEventListener('click', function () { goStep(step - 1); });
    $('er-next').addEventListener('click', function () {
        goStep(step === STORY.length - 1 ? 0 : step + 1);
    });
    $('er-play').addEventListener('click', function () {
        if (!playing && step === STORY.length - 1) goStep(0);
        playing = !playing;
        stepTimer = 0;
        updateStoryControls();
    });
    $('er-speed').addEventListener('click', function () {
        speed = SPEEDS[(SPEEDS.indexOf(speed) + 1) % SPEEDS.length];
        this.textContent = 'Speed: ' + speed + 'x';
    });
    $('er-dots').addEventListener('click', function (ev) {
        var b = ev.target.closest('[data-step]');
        if (b) goStep(parseInt(b.getAttribute('data-step'), 10));
    });

    // buttons inside the info panel
    panel.addEventListener('click', function (ev) {
        var sel = ev.target.closest('[data-select]');
        if (sel) {
            var id = sel.getAttribute('data-select');
            select(id ? { type: 'e', id: id } : null);
            return;
        }
        var rel = ev.target.closest('[data-rel]');
        if (rel) select({ type: 'r', id: rel.getAttribute('data-rel') });
    });

    // any "Start story" button on the page (also the step list in section 4)
    document.addEventListener('click', function (ev) {
        var b = ev.target.closest('[data-start-story]');
        if (!b) return;
        ev.preventDefault();
        var at = parseInt(b.getAttribute('data-start-story'), 10) || 0;
        startStory(at);
        viewer.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });

    // FULL SCREEN: real browser full screen if possible, otherwise fill the window
    var fullBtn = $('er-full');
    function fsElement() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
    function setFull(on) {
        viewer.classList.toggle('er-full', on);
        document.body.classList.toggle('er-noscroll', on);
        fullBtn.classList.toggle('on', on);
        fullBtn.innerHTML = on ? '&#10005; Exit full screen' : '&#9974; Full screen';
    }
    fullBtn.addEventListener('click', function () {
        if (fsElement()) {
            (document.exitFullscreen || document.webkitExitFullscreen).call(document);
        } else if (viewer.classList.contains('er-full')) {
            setFull(false);
        } else {
            var req = viewer.requestFullscreen || viewer.webkitRequestFullscreen;
            if (req) {
                var p = req.call(viewer);
                if (p && p.catch) p.catch(function () { setFull(true); });
            } else {
                setFull(true);
            }
        }
    });
    function onFullChange() { setFull(fsElement() === viewer); }
    document.addEventListener('fullscreenchange', onFullChange);
    document.addEventListener('webkitfullscreenchange', onFullChange);

    // keyboard: F = full screen, left / right arrows move through the story, Esc leaves it
    document.addEventListener('keydown', function (ev) {
        if (ev.key === 'Escape' && viewer.classList.contains('er-full') && !fsElement()) {
            setFull(false);
            return;
        }
        var typing = /^(INPUT|TEXTAREA|SELECT)$/.test((ev.target && ev.target.tagName) || '');
        if ((ev.key === 'f' || ev.key === 'F') && visible && !typing && !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
            fullBtn.click();
            ev.preventDefault();
            return;
        }
        if (mode !== 'story' || !visible) return;
        var tag = (ev.target && ev.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        if (ev.key === 'ArrowRight') { goStep(step + 1); ev.preventDefault(); }
        else if (ev.key === 'ArrowLeft') { goStep(step - 1); ev.preventDefault(); }
        else if (ev.key === 'Escape') exitStory();
    });

    /* =====================================================
       11. SIZE + ANIMATION LOOP
       ===================================================== */
    function resize() {
        var rect = canvas.getBoundingClientRect();
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        W = Math.max(rect.width, 1);
        H = Math.max(rect.height, 1);
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        fit = Math.min(W / 1100, H / 640);
        draw();   // changing the canvas size clears it, so draw again at once
    }
    resize();
    if (window.ResizeObserver) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize);

    var visible = true, running = false, lastFrame = 0;
    function frame(now) {
        if (!visible) { running = false; return; }
        var dt = Math.min(50, now - lastFrame || 16);
        lastFrame = now;
        time += dt;
        update(dt);
        draw();
        requestAnimationFrame(frame);
    }
    function startLoop() {
        if (running) return;
        running = true;
        lastFrame = performance.now();
        requestAnimationFrame(frame);
    }
    // stop drawing when the diagram is not on the screen (saves battery)
    if (window.IntersectionObserver) {
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
            if (visible) startLoop();
        }).observe(canvas);
    }
    startLoop();

    // open a story step directly with a link like docs.html#story-4
    var m = /^#story(?:-(\d+))?$/.exec(location.hash);
    if (m) {
        startStory(m[1] ? parseInt(m[1], 10) - 1 : 0);
        setTimeout(function () { viewer.scrollIntoView({ block: 'start' }); }, 50);
    } else {
        renderExplorePanel();
    }
})();

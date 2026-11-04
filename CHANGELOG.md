# Changelog

All important changes of the Hotel Reservation System project.

## [1.1.0] - 2026-11-05
### Added
- SQL: Q27 (rooms never booked), Q28 (customer who spent the most), Q29 (money collected per month).
- SQL: `05_views.sql` (3 useful views), `06_practice_questions.sql` (10 questions with answers), `07_cleanup.sql`.
- CHECK constraints for room type, room status and booking status.
- Docs page: normalization section, "How to Run" section, links like `docs.html#q14`.
- 3D diagram: **F** key for full screen, current story step saved in the page link.
- Home page: "How Booking Works" section. Rooms and Bookings pages: summary lines.
- Project files: `.gitignore`, `.gitattributes`, `LICENSE`, `sql/README.md`, `docs/` folder.
- Black and white ER diagram (`er_diagram_bw.svg`) and an `er-diagram/README.md`.
- Docs page: search box for the queries, Q27 - Q29 explained.
- 3D diagram: `+` / `-` keys zoom and `0` resets the view.
- Booking form: check-in cannot be in the past, check-out must be after check-in.
- Favicon, print styles and a meta description for the website.

### Changed
- Booking form limits input length to the size of the database columns.
- Better layout on phones and a clear focus outline for keyboard users.

## [1.0.0] - 2026-11-03
### Added
- 5 tables, sample data and 26 queries in MySQL.
- ER diagram (SVG and PNG).
- 4 black and white HTML pages.
- Docs page with a live 3D ER diagram, Story Mode and full screen option.

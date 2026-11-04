# ER Diagram

| File | Description |
|------|-------------|
| `er_diagram.svg` | ER diagram with colours (vector image, never blurry) |
| `er_diagram.png` | Same diagram as a normal picture |
| `er_diagram_bw.svg` | Black and white version, good for printing |

## What the diagram shows
- **5 entities** (rectangles): CUSTOMER, ROOM, STAFF, BOOKING, PAYMENT
- **4 relationships** (diamonds): MAKES, RESERVED, HANDLES, HAS
- **Attributes** (ovals): the columns of each table. The underlined one is the primary key.

| Relationship | Between | Cardinality |
|--------------|---------|-------------|
| MAKES | CUSTOMER - BOOKING | 1 : N |
| RESERVED | ROOM - BOOKING | 1 : N |
| HANDLES | STAFF - BOOKING | 1 : N |
| HAS | BOOKING - PAYMENT | 1 : 1 |

A 3D live version of this diagram is on the Docs page (`html/docs.html`).

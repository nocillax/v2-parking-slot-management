This is **already very solid** — honestly, 90% there — but it can be made _Copilot-perfect_ with a few tweaks.

Copilot needs two things to perform at its best:

1. **Explicit intent and structure** (so it knows _what belongs where_ — e.g., backend logic, frontend flows, automation).
2. **Contextual linking** (so it can “see” how entities interact and what behaviors to code).

Your current PRD is clear for humans, but Copilot will sometimes miss implicit connections (like _who triggers what, when, and why_).

So below is a **fully restructured PRD**, written in a format that works **both as a detailed technical doc** _and_ a **Copilot prompt** — clear, explicit, and structured for implementation.

---

# 🚗 Parking Slot Management System – Detailed PRD (Copilot Ready)

## **1. Overview**

We are building a **real-time parking slot reservation and management system** using the **PERN Stack (PostgreSQL, Express, React, Node.js)**.

The platform allows **users** to discover, reserve, and manage parking slots; and enables **admins** to monitor lots, control pricing, and analyze data.
It also includes **automated system jobs** for reservation expiration, overstay handling, and analytics updates.

---

## **2. Core Modules**

1. **Authentication & Roles**
2. **Parking Lots & Slots**
3. **Reservation & Check-in System**
4. **Payments & Overstay Handling**
5. **Notifications & Waitlist**
6. **Analytics & Admin Dashboard**
7. **System Automation (Cron Jobs)**

---

## **3. Tech Stack**

- **Frontend:** React (Vite or CRA), Tailwind CSS
- **Backend:** Node.js + Express.js
- **Database:** PostgreSQL + Prisma / Sequelize ORM
- **Auth:** JWT (access + refresh tokens)
- **Notifications:** Email or in-app notification logs
- **Scheduler:** Node-cron / BullMQ

---

## **4. User Roles & Permissions**

| Role                    | Capabilities                                                                      |
| ----------------------- | --------------------------------------------------------------------------------- |
| **User**                | Register, reserve slots, check in/out, cancel reservations, join waitlist         |
| **Admin**               | Create/manage parking lots, slots, pricing, view analytics, manage users          |
| **System (Automation)** | Auto-expire reservations, flag overstays, trigger notifications, update analytics |

---

## **5. Functional Modules**

### **5.1 Authentication & Profiles**

- Users can register with:

  - `name`, `email`, `password`
  - Optional default `vehicle_number`

- JWT-based authentication
- Role stored in user record (`admin`, `user`)
- Admin accounts can be created manually or via seed data.

---

### **5.2 Parking Lots & Slots**

#### **Parking Lot**

- Managed by admin
- Contains metadata: `name`, `address`, `total_slots`, `floors`, `created_by`
- Each parking lot contains multiple `slots`.

#### **Slot**

- Belongs to a parking lot
- Attributes:

  - `id`
  - `slot_type` (`Normal`, `VIP`, `Handicapped`)
  - `status` (`Free`, `Reserved`, `Occupied`)
  - `hourly_rate`
  - `location_tag` (optional: floor, section, coordinates)

#### **Slot Lifecycle**

1. **Free → Reserved** (on booking)
2. **Reserved → Occupied** (on check-in)
3. **Occupied → Free** (on check-out or reservation timeout)
4. **Reserved → Expired** (if not checked in within grace period)

---

### **5.3 Reservation System**

#### **Create Reservation**

- User selects:

  - Parking lot
  - Slot type or specific slot
  - Start time, duration (hourly)
  - Optional vehicle number (required during check-in)

- System:

  - Locks the slot for that period
  - Authorizes payment (simulation OK)
  - Sets reservation status = `Active`

- Auto-cancels if:

  - Payment fails
  - Slot becomes unavailable before confirmation

#### **Cancel Reservation**

- User can cancel before `start_time`
- If within grace period, no penalty
- Cancelling after start time triggers partial payment or penalty

#### **Grace Period**

- e.g., 10 minutes after `start_time`
- If user hasn’t checked in:

  - System expires reservation
  - Frees the slot
  - Sends notification

---

### **5.4 Check-In & Check-Out Flow**

#### **Check-In**

- User provides `vehicle_number` at entry
- System validates reservation
- Updates:

  - Slot → `Occupied`
  - Reservation → `Checked-in`
  - `check_in_time` stored

#### **Check-Out**

- On leaving, system:

  - Calculates duration
  - Compares with reserved time
  - Flags overstay if exceeded
  - Calculates total due
  - Marks slot → `Free`
  - Marks reservation → `Completed`

---

### **5.5 Overstay Handling**

- Overstay detected if:

  - `actual_end_time > reserved_end_time`

- System flags reservation:

  - `status = Overstayed`
  - Applies overstay rate (e.g., 1.5× hourly rate)
  - Sends payment reminder

- User cannot make new reservations until payment cleared.

---

### **5.6 Payments**

- Each reservation has a `payment` record.
- Fields:

  - `amount`, `method`, `status`, `timestamp`

- Payment simulation:

  - “Pre-authorized” on reservation
  - “Finalized” on check-out

- Support for future real integration (Stripe, etc.)

---

### **5.7 Waitlist System**

- When all slots are full:

  - User joins `waitlist` for slot type or lot

- System:

  - Notifies first user in queue when a slot becomes available
  - Gives 5 minutes to confirm
  - If user doesn’t act → passes to next person

- Waitlist entries auto-expire after X hours.

---

### **5.8 Notifications**

Triggered automatically or manually:

- Reservation confirmation
- Check-in reminder (10 mins before)
- Reservation expired
- Overstay alert
- Payment receipt

For MVP: use in-app notifications or email simulation.

---

### **5.9 Analytics (Admin Dashboard)**

Metrics to track:

- Peak hours per lot
- Average occupancy rate
- Total revenue
- Overstay frequency
- Cancellation rate
- Slot type popularity

Admin can view these in a dashboard (frontend feature).

---

## **6. System Automation**

Automated background tasks (via cron job or worker queue):

```
Every 1 minute:
  For each active reservation:
    If (current_time > start_time + grace_period && !checked_in)
        → Mark as expired
        → Free slot
        → Notify user

    If (current_time > end_time && checked_in)
        → Mark as overstayed
        → Update payment
        → Notify user

Update analytics periodically:
  - Recalculate revenue, occupancy, and usage trends
```

---

## **7. Database Entities (ER Model)**

```
USERS (
  id PK,
  name,
  email,
  password,
  role ENUM('user','admin'),
  default_vehicle_no,
  created_at
)

PARKING_LOTS (
  id PK,
  name,
  address,
  total_slots,
  admin_id FK -> USERS.id
)

SLOTS (
  id PK,
  lot_id FK -> PARKING_LOTS.id,
  slot_type ENUM('Normal','VIP','Handicapped'),
  status ENUM('Free','Reserved','Occupied'),
  hourly_rate DECIMAL,
  location_tag
)

RESERVATIONS (
  id PK,
  user_id FK -> USERS.id,
  slot_id FK -> SLOTS.id,
  start_time,
  end_time,
  status ENUM('Active','Checked-in','Completed','Expired','Overstayed','Cancelled'),
  total_amount DECIMAL,
  payment_status ENUM('Pending','Paid','Failed'),
  vehicle_no,
  check_in_time,
  check_out_time
)

PAYMENTS (
  id PK,
  reservation_id FK -> RESERVATIONS.id,
  amount DECIMAL,
  method,
  status ENUM('Pending','Paid','Failed'),
  timestamp
)

WAITLIST (
  id PK,
  user_id FK -> USERS.id,
  slot_type_pref,
  created_at,
  status ENUM('Active','Fulfilled','Expired')
)

NOTIFICATIONS (
  id PK,
  user_id FK -> USERS.id,
  message,
  type,
  read BOOLEAN,
  created_at
)
```

---

## **8. Expected APIs (for Copilot Context)**

### **Auth**

- `POST /auth/register`
- `POST /auth/login`

### **Slots & Lots**

- `GET /lots`
- `GET /lots/:id/slots`
- `POST /lots/:id/slots` (Admin)
- `PATCH /slots/:id/status` (System/Admin)

### **Reservations**

- `POST /reservations`
- `GET /reservations/user`
- `PATCH /reservations/:id/cancel`
- `PATCH /reservations/:id/checkin`
- `PATCH /reservations/:id/checkout`

### **Payments**

- `POST /payments`
- `GET /payments/:reservationId`

### **Waitlist**

- `POST /waitlist`
- `GET /waitlist/user`

### **Analytics**

- `GET /admin/analytics`

---

## **9. Key Implementation Notes**

- Vehicle number **is optional during reservation** but **required at check-in** (it acts as the physical identifier at entry).
- Grace period logic handled by automation, not user-side.
- Dynamic pricing can be implemented later by time-based rules in `hourly_rate`.
- Future integrations:

  - Payment gateway (Stripe)
  - Sensors or license plate recognition (for check-in automation)
  - Real notification service (FCM / Twilio)

---

✅ **Use this PRD as the Copilot Prompt Root**
When you start coding, paste this as a comment in your main backend index file or README. Copilot will now have **a structured understanding** of:

- Entities and their relations
- API purposes
- System logic and transitions
- Automation flow

---

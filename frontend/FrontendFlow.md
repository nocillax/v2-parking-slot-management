Frontend Development Plan & User Flow

1. Core Objective
   To build a responsive, single-page application (SPA) using React and Tailwind CSS that consumes the existing backend APIs to provide a seamless experience for both Users and Admins.

2. Technology & Setup
   Framework: React (using Vite for setup)
   Styling: Tailwind CSS
   State Management: React Context API (for Auth and Notifications) or a lightweight library like Zustand.
   API Client: Axios (configured with an interceptor to automatically attach the JWT Bearer token to requests).
   Routing: React Router DOM.
3. Page & View Architecture
   The application will be structured around these main pages/views:

Public Pages (No Auth Required)

/login: Login form.
/register: Registration form.
User Pages (Auth Required)

/: Home/Discovery Page: The main page where users find facilities.
/reservations: My Reservations: A list of the user's past and upcoming reservations.
/reservations/:id: Reservation Details: Detailed view of a single reservation.
/waitlist: My Waitlist Entries: A list of the user's active waitlist positions.
/profile: User Profile: Manage user details and default location.
Admin Pages (Admin Role Required)

/admin/dashboard: Admin Dashboard: Overview of managed facilities.
/admin/facilities/:id: Facility Management: View/manage slots and reservations for a specific facility. 4. Key Reusable Components
Building these components first will accelerate development:

Navbar: Displays navigation links. Shows "Login/Register" for guests, "My Reservations/Profile/Logout" for users, and an additional "Admin Dashboard" link for admins.
LocationSelector: A set of cascading, searchable dropdowns for Division -> District -> Area.
FacilityCard: A card component to display summary information for a single facility in a list (name, address, available slots).
SlotGrid: A visual grid that displays slots for a facility, color-coded by status (Free, Reserved, Occupied).
DateTimePicker: A component for selecting start and end times.
NotificationBell: An icon in the navbar that shows a badge for unread notifications and opens a dropdown list when clicked.
AuthGuard / AdminGuard: Wrapper components that protect routes and redirect users if they don't have the required authentication or role. 5. Detailed User Flow Walkthroughs
This is the core logic for the frontend implementation.

Flow 1: The New User's First Reservation
Registration:

User lands on /register.
Fills out the form and submits.
API Call: POST /api/v1/auth/register.
On success, redirect to /login.
Login:

User lands on /login.
Enters credentials and submits.
API Call: POST /api/v1/auth/login.
On success, save the JWT access token to local storage and update the global Auth Context. Redirect to /.
Facility Discovery:

User is on the Home Page (/).
The LocationSelector component is prominent. User selects a Division, then a District, then an Area.
API Calls: GET /api/v1/locations/... for each dropdown.
Once an Area is selected, the page makes an API call to display facilities.
API Call: GET /api/v1/facilities?area_id={selected_area_id}.
The results are displayed as a list of FacilityCard components.
Making a Reservation:

User clicks on a FacilityCard. They are navigated to the Facility Detail page.
The page displays the SlotGrid component.
API Call: GET /api/v1/facilities/{facilityId}/slots.
User selects a start_time and end_time using the DateTimePicker.
User selects the number and type of slots they need (e.g., 1 VIP, 2 Normal).
User clicks "Reserve".
API Call: POST /api/v1/reservations with the facility ID, times, and requested slots.
On success (201 Created), show a confirmation message and redirect the user to /reservations.
Flow 2: The Waitlist Journey
Attempting to Reserve a Full Facility:

User follows Flow 1, but the POST /api/v1/reservations call fails with a 409 Conflict status.
The UI catches this specific error and displays a modal: "Sorry, no slots are available for your selected time. Would you like to join the waitlist?"
Joining the Waitlist:

User clicks "Yes, Join Waitlist".
API Call: POST /api/v1/facilities/{facilityId}/waitlist with the desired time and slot type.
On success, the modal closes, and a confirmation toast appears: "You've been added to the waitlist!"
Getting Notified and Claiming the Spot:

Later, another user checks out, freeing a slot. The backend automatically sends a notification.
The logged-in User B sees the NotificationBell icon show a "1".
API Call (on component mount): GET /api/v1/notifications/me.
User clicks the bell. The dropdown shows: "A VIP slot is now available! You have 5 minutes to claim it."
User clicks the notification. A confirmation modal appears: "Claim this VIP slot now?"
User clicks "Claim".
API Call: POST /api/v1/reservations/from-waitlist with the waitlist_id from the notification's metadata.
On success, show a confirmation and redirect to /reservations to show the newly created booking.
Flow 3: The Admin Experience
Check-in & Check-out:
Admin logs in and navigates to /admin/facilities/{facilityId}.
The page displays a table of all reservations for that facility.
API Call: GET /api/v1/facilities/{facilityId}/reservations.
For a reservation with status: "Active", there is a "Check-in" button.
Admin clicks "Check-in". A modal prompts for the vehicle_number.
Admin enters the number and confirms.
API Call: PATCH /api/v1/reservations/{reservationId}/check-in.
The UI automatically updates the reservation's status in the table to "Checked-in".
For a reservation with status: "Checked-in", there is a "Check-out" button. Admin clicks it.
API Call: PATCH /api/v1/reservations/{reservationId}/check-out.
The UI updates the status to "Completed" or "Overstayed".

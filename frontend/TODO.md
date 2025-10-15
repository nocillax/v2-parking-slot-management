# Frontend Development Plan: ParkEasy

This document outlines the step-by-step plan to build the frontend for the ParkEasy application. Each task is designed to be a logical, self-contained unit of work.

## Phase 1: Project Setup & Core Structure

- [x] **Task 1: Initialize Next.js Project**

  - [x] Use `create-next-app`.
  - [x] Configure with TypeScript, Tailwind CSS, and ESLint.
  - [x] Set up basic project structure (`/app`, `/components`, `/lib`, etc.).

- [x] **Task 2: UI & Layout**

  - [x] Install and initialize `shadcn/ui`.
  - [x] Create a root layout (`/app/layout.tsx`) with the base HTML structure, including font setup (Inter).
  - [x] Implement a persistent `Navbar` component (`/components/layout/Navbar.tsx`).
  - [x] Add a `Toaster` component for displaying notifications.
  - [x] Set up a dark theme by default in the root layout.

- [x] **Task 3: API Client & State Management**
  - [x] Install `axios` and `zustand`.
  - [x] Create a centralized API client using `axios` (`/lib/api.ts`).
    - [x] Configure the base URL from an environment variable (`NEXT_PUBLIC_API_URL`).
    - [x] Implement a request interceptor to automatically attach the JWT `Authorization` header.
  - [x] Create a `Zustand` store for authentication (`/stores/authStore.ts`).
    - [x] Manage `isAuthenticated`, `user`, and `token` state.
    - [x] Implement `login` and `logout` actions.
    - [x] Persist the auth state to `localStorage` to handle page refreshes.

## Phase 2: Authentication

- [x] **Task 1: Create Auth Pages & Forms**

  - [x] Create the `/login` and `/register` pages.
  - [x] Build the `LoginForm` and `RegisterForm` components using `react-hook-form`, `zod` for validation, and `shadcn/ui` components (`Card`, `Input`, `Button`, `Form`).

- [x] **Task 2: Implement Auth Logic**

  - [x] Connect the `RegisterForm` to the `/auth/register` backend endpoint.
  - [x] Connect the `LoginForm` to the `/auth/login` backend endpoint.
  - [x] On successful login, call the `login` action from the `authStore` to update the global state.
  - [x] Implement the `logout` functionality in the `Navbar`.
  - [x] Use the `useToast` hook to show success and error notifications for all auth operations.
  - [x] Add navigational links between the login and register pages.

- [ ] **Task 3: Protected Routes & Guards**
  - [ ] Create a higher-order component (HOC) or a wrapper component named `ProtectedRoute`.
  - [ ] This component will check if the user is authenticated using the `authStore`.
  - [ ] If the user is not authenticated, it will redirect them to the `/login` page.
  - [ ] If the user is authenticated, it will render the child components.
  - [ ] Wrap all pages that require authentication (e.g., `/dashboard`, `/profile`) with this `ProtectedRoute` component.

## Phase 3: Core Application Features

- [ ] **Task 4: Dashboard / Home Page**

  - [ ] Create the main dashboard page at `/`.
  - [ ] This page should be protected and only accessible to logged-in users.
  - [ ] Display a grid or list of available parking slots fetched from the backend (`/facilities`).
  - [ ] Implement filtering controls (e.g., by division, district, area).
  - [ ] Each parking slot card should show its status (Available, Reserved) and a "Reserve" button.

- [ ] **Task 5: Reservation Management (User)**

  - [ ] Create a "My Reservations" page (`/reservations`).
  - [ ] Fetch and display a list of the current user's active and past reservations from `/reservations/my-reservations`.
  - [ ] Implement the logic for creating a new reservation when a user clicks "Reserve" on the dashboard.
  - [ ] Add the ability for a user to cancel an active reservation.

- [ ] **Task 6: User Profile Management**
  - [ ] Create a user profile page (`/profile`).
  - [ ] Allow the user to view their details (name, email).
  - [ ] Allow the user to update their default vehicle number.

## Phase 4: Admin Panel

- [ ] **Task 7: Admin Role Guard**

  - [ ] Create a new guard or extend `ProtectedRoute` to check for user `role`.
  - [ ] Protect all `/admin/*` routes, making them accessible only to users with the `admin` role.

- [ ] **Task 8: Admin Dashboard**

  - [ ] Create the main admin dashboard page (`/admin`).
  - [ ] Display key statistics (e.g., total users, total slots, current reservations).

- [ ] **Task 9: User Management (Admin)**

  - [ ] Create a page at `/admin/users`.
  - [ ] Display all users in a data table (`shadcn/ui`'s DataTable).
  - [ ] Implement functionality to view user details and manage user roles.

- [ ] **Task 10: Parking Slot Management (Admin)**

  - [ ] Create a page at `/admin/facilities`.
  - [ ] Implement full CRUD (Create, Read, Update, Delete) functionality for parking slots.
  - [ ] Use a form within a `Dialog` or `Sheet` for creating/editing slots.

- [ ] **Task 11: Location Management (Admin)**
  - [ ] Create pages for managing Divisions, Districts, and Areas (`/admin/divisions`, etc.).
  - [ ] Implement full CRUD for each location type. This will likely involve creating reusable components for the data tables and forms.

## Phase 5: Final Polish

- [ ] **Task 12: Real-time Updates (Optional)**

  - [ ] Explore implementing WebSockets or server-sent events to show real-time updates of parking slot availability on the dashboard.

- [ ] **Task 13: Responsive Design & Accessibility**

  - [ ] Review all pages and ensure they are fully responsive on mobile, tablet, and desktop.
  - [ ] Perform an accessibility audit (keyboard navigation, screen reader support, color contrast).

- [ ] **Task 14: Final Testing & Deployment**
  - [ ] Write end-to-end tests for the main user flows.
  - [ ] Prepare the application for production deployment on Vercel.

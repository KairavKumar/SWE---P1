# Backend + Database Integration Map (From final.pdf)

This file maps implemented frontend actions to backend endpoints and expected database entities.

## Primary Integration Point In Code

- `shared/app-shell.js`

Look for these comment markers:

- `BACKEND API INTEGRATION POINT`
- `DATABASE INTEGRATION HINT`

These are the exact places where backend fetch calls and database wiring should be connected.

## Screen-Wise Functional Coverage

## Screen 1 (Student Dashboard)

- Assignment Upload button
  - API: `POST /api/assignment/upload`
  - DB: `submissions`
- Apply Leave button
  - API: `POST /api/leave/apply`
  - DB: `leave_requests`
- New Request button (Transcript/Bonafide)
  - API: `POST /api/transcript/request`
  - DB: `transcript_requests`
- Support button
  - API: `POST /api/logs/event`
  - DB: `audit_logs`

## Screen 2 (Security / Audit / RBAC)

- Download Audit Logs
  - API: `GET /api/logs/export`
  - DB: `audit_logs`
- Session status / auth support in shell
  - API: `GET /api/session/status`, `/api/auth/*`
  - DB/Cache: `sessions`, Redis blocklist

## Screen 3-4 (Faculty + Academic Workflows)

- Enroll / Enroll Now actions
  - API: `POST /api/courses/register`
  - DB: `enrollments`
- Review buttons for grading/approval interaction
  - API families:
    - `POST /submit-grades`
    - `POST /submit-assignment-grades`
    - `GET /students-enrolled`
  - DB: `grades`, `enrollments`, `assignments`

## Screen 5 (Hostel Student Workflows)

- Leave apply flow
  - API: `POST /api/leave/apply`
  - DB: `leave_requests`
- Draft + request actions for hostel/admin approvals
  - API family: `/api/hostel/transfer/*`, `/api/nodues/*`
  - DB: `hostel_transfer_requests`, `no_dues_forms`

## Screen 6 (Facilities + Complaints)

- Submit Complaint
  - API: `POST /api/complaints/raise`
  - DB: `complaints`
- View Details actions
  - API: `GET /api/complaints/view`, `GET /api/facility/dashboard`
  - DB: `complaints`, `facility_logs`, `assets`

## Screen 7 (Admin Clearance + Approvals)

- Review / queue actions
  - API families:
    - `GET /api/admin/approvals/pending`
    - `POST /api/admin/leaves/approve`
    - `POST /api/admin/leaves/reject`
    - `PUT /api/transcript/update-status`
  - DB: `approval_queue`, `leave_requests`, `transcript_requests`

## Screen 8 (HMC Minutes + Committee)

- Add decision item / Save Draft / Submit for Review
  - API: `POST /api/hmc/minutes`
  - DB: `hmc_minutes`
- Review details / archive
  - API family: `GET /api/hmc/verify`, `GET /api/logs/audit`
  - DB: `hmc_members`, `hmc_minutes`, `audit_logs`

## New Screens Recommendation (Optional, Not Mandatory)

From the PDF, if you want complete flow parity, add:

1. Auth Screen (Login + Forgot Password)
2. Profile Screen (View/Edit profile)
3. Messaging Screen (course channels + announcements)
4. Resource Screen (faculty upload + student download)
5. Feedback Screen (student submit + admin summary)

These can be added later using the same CSS tokens/patterns already present.

## Database Tables to Provision

- `users`
- `roles`
- `permissions`
- `sessions`
- `enrollments`
- `grades`
- `attendance`
- `assignments`
- `submissions`
- `transcript_requests`
- `leave_requests`
- `complaints`
- `messages`
- `announcements`
- `audit_logs`
- `hmc_minutes`
- `facility_logs`

## Notes

- Current implementation uses real backend API calls with `credentials: include` from `shared/app-shell.js`.
- Configure API host in `shared/runtime-config.js` (`window.APP_API_BASE`).

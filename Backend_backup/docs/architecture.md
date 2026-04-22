# Digital ID Attendance — Architecture & Flow

This document captures the high-level architecture, actors, data shapes, and request flow for the Digital ID Attendance capstone project. It's intended as a short, actionable spec we can use while implementing templates, views, and later the face-recognition and blockchain features.

## Actors / Roles
- Management (college admin)
  - Full access to all data and controls. Can view and export attendance for all classes and students.
  - Can manage courses, assign faculty to classes, and view blockchain audit data.
- Faculty
  - Access limited to classes assigned to the faculty member. Can view class lists and take attendance for their classes.
- Student
  - Can view personal attendance records, update profile (photo), and use face scan to mark attendance.

## Key Entities (data model summary)
- User (Django auth User)
  - username, email, password, is_staff, is_superuser
- StudentProfile
  - user (OneToOne), roll_number, photo, other metadata
- FacultyProfile
  - user (OneToOne), department, assigned_courses
- Course / Class
  - name, code, faculty (FK to FacultyProfile), schedule
- ClassSession
  - course, start_time, end_time, location (optional), created_by
- AttendanceRecord
  - session (FK ClassSession), student (FK StudentProfile), timestamp, status ('present'/'absent'/'late'), method ('face','manual'), blockchain_tx (nullable), notes

Notes: we can store attendance in SQLite for prototyping; later a production DB (Postgres) and a blockchain integration can be added. Keeping blockchain_tx as a short string allows optional integration.

## Authentication & Password Flow
- Initial credentials: college issues username/password to students (management responsibility).
- Forgotten password: standard Django password reset flow (email or admin-driven reset). Students can change their password after login via a change-password page.

## Attendance Flow (high level)
1. Faculty opens class session (or session pre-created by schedule). If the system supports scheduling, sessions can be auto-created.
2. When attendance window opens, students mark attendance by face scan: frontend captures a camera image (webcam or mobile). The image is POSTed to a recognition endpoint.
3. The recognition endpoint runs face-matching logic (OpenCV or ML model).
   - If a face matches a student profile with confidence above threshold, create AttendanceRecord with method='face' and status='present'.
   - If match is uncertain or multiple matches, return a controlled failure (ask user to try again or route to manual check).
4. Optionally, after attendance record is created, call blockchain service or a mock service to register the attendance entry and return a transaction hash; save it into `AttendanceRecord.blockchain_tx`.
5. Faculty and management can view records and filter by course, date, or student.

Sequence (simple):
- Frontend (camera) -> POST /api/recognize/ -> Backend matches -> create AttendanceRecord -> (optionally) call blockchain service -> respond with success + txHash

## Role-based access rules
- Management: has access to all views and endpoints. Use `is_staff` or a custom permission for management role.
- Faculty: access limited to classes where `course.faculty.user == request.user`.
- Student: can access only own attendance and profile pages.

## UI mapping (templates)
- Home (`home.html`) — guest hero + login. If authenticated, show quick dashboard links.
- Student dashboard (`student_dashboard.html`) — personal attendance table, photo, controls for updating profile.
- Faculty dashboard (`faculty_dashboard.html`) — list of assigned courses, quick links to sessions and attendance lists.
- Management dashboard (`admin_dashboard.html`) — overview statistics, export controls, user management links.
- Face scan page (`recognize.html` or an embedded modal) — camera capture UI and feedback.

## Success criteria & edge cases
- Success:
  - Face recognition marks attendance correctly for clear single-face captures.
  - User sees immediate feedback (success, retry, or manual fallback).
  - Attendance record stores timestamp and optional blockchain tx.
- Edge cases:
  - No face detected / multiple faces detected — show an informative error.
  - Student without a photo on record — prompt to upload profile photo first.
  - Offline/slow network — queue attendance locally or allow manual marking (faculty override).

## Next immediate steps (implementation order)
1. Add this document to repo (done).
2. Implement role-aware navigation and simple view routes for home, student, faculty, management dashboards (UI-only stubs acceptable at first).
3. Create a camera-capture page and a backend endpoint stub that accepts an image and returns a mocked match response (so frontend flow can be tested end-to-end).
4. Add a lightweight blockchain mock service (or stub function) that returns a fake tx hash; wire it into the attendance creation path.
5. Replace mock recognition with OpenCV-based matching when ready.

## Data shapes (example JSON)
- AttendanceRecord (response):
```json
{
  "id": 123,
  "student_id": 45,
  "status": "present",
  "timestamp": "2025-10-24T08:35:12Z",
  "blockchain_tx": "0xabc123..."
}
```

## Notes for developers
- Keep recognition and blockchain logic isolated behind service interfaces so we can swap mock/stub implementations and add real integrations later.
- Use Django permissions and decorators to enforce role-based access.

---
Created as the first implementation step to guide UI and backend work.

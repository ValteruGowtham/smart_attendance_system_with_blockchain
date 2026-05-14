# Requirements Document: Multi-Face Attendance Recognition

## Introduction

This document specifies requirements for enhancing the existing face recognition attendance system to support simultaneous detection and recognition of multiple students in a single camera capture. The current system processes one face at a time, requiring each student to individually present themselves to the camera. The enhanced system will enable batch attendance marking by detecting and recognizing all visible registered students in a single frame, significantly improving efficiency during class attendance sessions.

The system uses FaceNet embeddings (512-dimensional vectors) stored in the database for each registered student. The enhancement will leverage MTCNN's multi-face detection capabilities combined with the existing embedding comparison infrastructure.

## Glossary

- **Multi_Face_Recognizer**: The enhanced recognition module that detects and identifies multiple faces in a single image capture
- **Face_Detector**: MTCNN (Multi-task Cascaded Convolutional Networks) component that locates face regions in images
- **Face_Encoder**: InceptionResnetV1 model that generates 512-dimensional embeddings from detected face regions
- **Embedding**: A 512-dimensional numerical vector representing unique facial features
- **Similarity_Threshold**: Cosine similarity value (0.0-1.0) used to determine if two embeddings represent the same person (default: 0.6)
- **Attendance_Window**: Time period during which faculty can mark attendance for a specific class period
- **Recognition_Result**: Data structure containing student identification, confidence score, and face location for each detected face
- **Batch_Attendance_Operation**: Single database transaction that creates or updates attendance records for multiple students simultaneously
- **Unknown_Face**: A detected face that does not match any registered student embedding above the similarity threshold
- **Registered_Student**: A student with a stored face embedding in the database for the specified class (branch, year, section)
- **Camera_Capture**: Base64-encoded image data from the frontend webcam component
- **Class_Context**: The combination of branch, year, section, and period that defines which students are eligible for recognition

## Requirements

### Requirement 1: Multi-Face Detection

**User Story:** As a faculty member, I want the system to detect all faces present in a single camera capture, so that I can mark attendance for multiple students at once.

#### Acceptance Criteria

1. WHEN a Camera_Capture is submitted, THE Multi_Face_Recognizer SHALL detect all human faces present in the image
2. THE Face_Detector SHALL return bounding box coordinates for each detected face
3. WHEN no faces are detected, THE Multi_Face_Recognizer SHALL return an empty recognition result list
4. WHEN the image quality is insufficient for face detection, THE Multi_Face_Recognizer SHALL return a descriptive error message
5. THE Multi_Face_Recognizer SHALL process images with 1 to 20 faces within 3 seconds

### Requirement 2: Multi-Face Embedding Extraction

**User Story:** As a system, I want to extract face embeddings for all detected faces, so that I can compare them against registered student embeddings.

#### Acceptance Criteria

1. FOR ALL detected faces in a Camera_Capture, THE Face_Encoder SHALL generate a 512-dimensional embedding vector
2. WHEN a detected face region is too small or unclear, THE Face_Encoder SHALL skip that face and log a warning
3. THE Face_Encoder SHALL maintain embedding extraction quality equivalent to single-face processing
4. FOR ALL successfully extracted embeddings, THE Multi_Face_Recognizer SHALL preserve the association between embedding and face bounding box coordinates

### Requirement 3: Multi-Face Recognition Against Class Roster

**User Story:** As a faculty member, I want each detected face to be matched against the registered students in my selected class, so that only legitimate students are recognized.

#### Acceptance Criteria

1. FOR ALL extracted embeddings, THE Multi_Face_Recognizer SHALL compare against embeddings of Registered_Students in the Class_Context
2. THE Multi_Face_Recognizer SHALL use cosine similarity with the Similarity_Threshold to determine matches
3. WHEN an embedding matches multiple students above the threshold, THE Multi_Face_Recognizer SHALL select the student with the highest similarity score
4. WHEN an embedding does not match any student above the threshold, THE Multi_Face_Recognizer SHALL classify it as an Unknown_Face
5. THE Multi_Face_Recognizer SHALL return a Recognition_Result for each detected face containing student_id (or null), confidence_score, and face_location

### Requirement 4: Batch Attendance Marking

**User Story:** As a faculty member, I want attendance to be marked for all recognized students in a single operation, so that the process is efficient and atomic.

#### Acceptance Criteria

1. WHEN recognition is complete, THE Attendance_API SHALL create or update attendance records for all recognized students in a single Batch_Attendance_Operation
2. THE Attendance_API SHALL set status to "Present" and time to the period start time for all recognized students
3. WHEN a student already has a "Present" record for the same date and period, THE Attendance_API SHALL not modify the existing record
4. WHEN a student has an "Absent" record for the same date and period, THE Attendance_API SHALL update the status to "Present" and update the time
5. THE Batch_Attendance_Operation SHALL be atomic (all records succeed or all fail)
6. WHEN the Batch_Attendance_Operation completes, THE Attendance_API SHALL broadcast WebSocket updates for all affected students

### Requirement 5: Recognition Feedback Response

**User Story:** As a faculty member, I want to see which students were successfully recognized and which faces were unknown, so that I can verify the attendance marking was correct.

#### Acceptance Criteria

1. THE Attendance_API SHALL return a JSON response containing a list of recognized students with their names and registration IDs
2. THE Attendance_API SHALL return a list of Unknown_Faces with their count and face locations
3. THE Attendance_API SHALL return the updated attendance summary (present count, absent count, total, percentage)
4. THE Attendance_API SHALL return the complete attendance records list for the current class and period
5. WHEN no faces are recognized, THE Attendance_API SHALL return success=true with empty recognized_students list and appropriate message

### Requirement 6: Unknown Face Handling

**User Story:** As a faculty member, I want to be informed when unknown faces are detected, so that I can identify unauthorized individuals or students from other sections.

#### Acceptance Criteria

1. WHEN Unknown_Faces are detected, THE Attendance_API SHALL include them in the response with count and locations
2. THE Attendance_API SHALL not create attendance records for Unknown_Faces
3. THE Multi_Face_Recognizer SHALL log Unknown_Face detections with timestamp and Class_Context for security auditing
4. THE Attendance_API SHALL return a warning message when Unknown_Faces are present

### Requirement 7: Duplicate Detection Prevention

**User Story:** As a faculty member, I want the system to prevent marking the same student multiple times in a single capture, so that attendance records remain accurate.

#### Acceptance Criteria

1. WHEN multiple detected faces match the same student, THE Multi_Face_Recognizer SHALL select only the face with the highest confidence score
2. THE Multi_Face_Recognizer SHALL ensure each student appears at most once in the Recognition_Result list
3. THE Multi_Face_Recognizer SHALL log when duplicate matches are detected and resolved

### Requirement 8: Backward Compatibility with Single-Face Mode

**User Story:** As a faculty member, I want the system to continue working correctly when only one student is present, so that the existing workflow is not disrupted.

#### Acceptance Criteria

1. WHEN exactly one face is detected and recognized, THE Attendance_API SHALL return a response format compatible with the existing single-face implementation
2. THE Multi_Face_Recognizer SHALL process single-face captures with the same accuracy as the previous implementation
3. WHEN exactly one face is detected but not recognized, THE Attendance_API SHALL return the same error response as the previous implementation ("Unidentified face")

### Requirement 9: Performance Requirements

**User Story:** As a faculty member, I want multi-face recognition to complete quickly, so that I can efficiently mark attendance for large classes.

#### Acceptance Criteria

1. THE Multi_Face_Recognizer SHALL process captures with 1-5 faces within 2 seconds
2. THE Multi_Face_Recognizer SHALL process captures with 6-10 faces within 4 seconds
3. THE Multi_Face_Recognizer SHALL process captures with 11-20 faces within 6 seconds
4. WHEN processing exceeds these time limits, THE Multi_Face_Recognizer SHALL log a performance warning but complete the operation

### Requirement 10: Error Handling and Validation

**User Story:** As a faculty member, I want clear error messages when recognition fails, so that I can take corrective action.

#### Acceptance Criteria

1. WHEN the Camera_Capture is empty or invalid, THE Attendance_API SHALL return HTTP 400 with error message "Invalid image data"
2. WHEN Face_Detector initialization fails, THE Multi_Face_Recognizer SHALL return HTTP 500 with error message "Face detection service unavailable"
3. WHEN no students have embeddings in the Class_Context, THE Attendance_API SHALL return HTTP 400 with error message "No registered students with face embeddings found for this class"
4. WHEN the Attendance_Window is closed, THE Attendance_API SHALL return HTTP 400 with the existing cutoff error message
5. WHEN database transaction fails during Batch_Attendance_Operation, THE Attendance_API SHALL rollback all changes and return HTTP 500 with error message "Failed to save attendance records"

### Requirement 11: Confidence Score Tracking

**User Story:** As a system administrator, I want confidence scores stored with attendance records, so that I can audit recognition quality and adjust thresholds if needed.

#### Acceptance Criteria

1. FOR ALL recognized students, THE Attendance_API SHALL store the cosine similarity score in the confidence_score field
2. THE confidence_score SHALL be a float value between 0.0 and 1.0
3. WHEN displaying attendance records, THE Attendance_API SHALL include confidence_score in the JSON response
4. THE Multi_Face_Recognizer SHALL log recognition events with confidence scores for analysis

### Requirement 12: Concurrent Recognition Safety

**User Story:** As a faculty member, I want to safely submit multiple recognition requests without data corruption, so that attendance records remain consistent.

#### Acceptance Criteria

1. WHEN multiple recognition requests are submitted for the same Class_Context simultaneously, THE Attendance_API SHALL process them sequentially using database-level locking
2. THE Batch_Attendance_Operation SHALL use Django's select_for_update() or atomic transactions to prevent race conditions
3. WHEN a student's attendance record is being updated, THE Attendance_API SHALL prevent concurrent modifications to the same record


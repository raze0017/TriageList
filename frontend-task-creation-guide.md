# Frontend Guide: Task Creation Flow

This guide details the end-to-end integration for the "Create Task" UI. It covers the logic, the specific dropdowns to render, and the exact API responses the frontend will receive. 

There are two primary user flows: **Teacher** (scoped to their assignments) and **Admin** (unrestricted access).

---

## 🏗️ 1. Teacher Flow: The UI & Dropdown Logic

Teachers are restricted to creating tasks only for subjects and classes they are assigned to. 

### Step 1: "Class & Subject" Combo Dropdown
When the task modal opens, the first thing the teacher must select is their assigning context.
- **UI Element:** A single dropdown titled `Select Class & Subject`
- **Options Example:** `Class 10A — Mathematics`, `Class 11A — Physics`
- **API Call:** `GET /api/v1/academic/teacher-group-assignments?teacherId=<current_teacher_id>`
- **Response Shape:**
  ```json
  {
    "data": [
      {
        "id": "aa11-bb22...",
        "classroomGroup": { 
          "id": "group-uuid", 
          "name": "Class 10A", 
          "division": "A" 
        },
        "node": { 
          "id": "subject-node-uuid", 
          "label": "Mathematics" 
        }
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 50
  }
  ```
- **Frontend Action:** When the user makes a selection here, **store the `classroomGroup.id`** into your form state as `classroomGroupId`. Also, keep the `node.id` handy for Step 2.

### Step 2: "Topic / Chapter" Dropdown
Tasks are assigned to specific chapters/lessons, not the top-level subject. Once Step 1 is selected, fetch the sub-topics under that subject.
- **UI Element:** A dropdown titled `Select Topic/Chapter`
- **Options Example:** `Chapter 1: Arrays`, `Chapter 2: Variables`
- **API Call:** `GET /api/v1/curriculum/nodes/:subjectNodeId/descendants`
  *(Pass the `node.id` from Step 1 as the `subjectNodeId` param)*
- **Response Shape:**
  ```json
  {
    "nodeId": "subject-node-uuid",
    "descendants": [
      { "id": "chapter-uuid-1", "label": "Chapter 1: Arrays" },
      { "id": "chapter-uuid-2", "label": "Chapter 2: Variables" }
    ]
  }
  ```
  *(Note: Backend team is updating this endpoint to include the `label`. Currently, it might only return IDs. If so, fallback to fetching `GET /api/v1/curriculum/nodes` and filtering items where the `parentId` matches.)*
- **Frontend Action:** When the user selects a topic here, **store its [id](file:///home/raze/projects/eguru-keycloak/src/modules/tasks/tasks.middleware.js#7-8)** into your form state as `nodeId`.

### Step 3: Task Details & "Classroom" Allocation
The teacher fills out Title, Description, and Date/Time. Whether they need to pick a physical classroom depends on the `taskType`.
- **UI Element:** A dropdown titled `Select Physical Classroom`
- **Visibility Logic:** ONLY MUST be shown if `taskType === "timetable"`. Hide for `assignment` or `exam`.
- **API Call:** `GET /api/v1/classrooms`
- **Response Shape:**
  ```json
  {
    "data": [
      {
        "id": "room-uuid-1",
        "name": "Room 301",
        "loginId": "room_301",
        "timezone": "UTC"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 50
  }
  ```
- **Frontend Action:** Store the selected room's [id](file:///home/raze/projects/eguru-keycloak/src/modules/tasks/tasks.middleware.js#7-8) as `classroomId`.

---

## 👑 2. Admin Flow: The UI & Dropdown Logic

Admins are not scoped by assignments. They get the full lists.

### Step 1: "Curriculum Node" Dropdown (The full tree)
- **UI Element:** Cascading Dropdown or Tree Select for Curriculum.
- **API Call:** `GET /api/v1/curriculum/nodes`
- **Response Shape:**
  ```json
  [
    {
      "id": "node-uuid",
      "label": "Mathematics",
      "parentId": null,
      "nodeType": { "name": "subject" }
    },
    {
      "id": "chapter-uuid",
      "label": "Arrays",
      "parentId": "node-uuid",
      "nodeType": { "name": "chapter" }
    }
  ]
  ```
- **Frontend Action:** Admin browses the tree and selects a leaf node (chapter/topic). Form state `nodeId` = selected [id](file:///home/raze/projects/eguru-keycloak/src/modules/tasks/tasks.middleware.js#7-8).

### Step 2: "Classroom Group" Dropdown
- **UI Element:** Dropdown for `Select Group`
- **API Call:** `GET /api/v1/academic/classroom-groups`
- **Response Shape:**
  ```json
  {
    "data": [
      {
        "id": "group-uuid",
        "name": "Class 10A",
        "division": "A"
      }
    ],
    "total": 1
  }
  ```
- **Frontend Action:** Form state `classroomGroupId` = selected [id](file:///home/raze/projects/eguru-keycloak/src/modules/tasks/tasks.middleware.js#7-8).

### Step 3: "Classroom" Allocation
*(Same as Step 3 in the Teacher Flow)*

---

## 🚀 3. Final Submission Payload

Once the form is filled, submit it via `POST /api/v1/tasks`.

### Scenario A: Timetable Task (Requires Classroom & Start/End Times)
```json
{
  "title": "Arrays lecture",
  "description": "Basic array operations",
  "taskType": "timetable",            // Fixed task type
  "nodeId": "chapter-uuid",           // From Topic Dropdown
  "classroomGroupId": "group-uuid",   // From Step 1 assignment pick
  "classroomId": "room-uuid",         // From Classroom Dropdown
  "startAt": "2026-03-10T09:00:00Z",  // From DatePicker
  "endAt": "2026-03-10T10:00:00Z"     // From DatePicker
}
```

### Scenario B: Non-Timetable Task (Assignment / Exam)
```json
{
  "title": "Array Homework",
  "description": "Solve exercises 1-10",
  "taskType": "assignment",           // 'assignment' or 'exam' or 'other'
  "nodeId": "chapter-uuid",
  "classroomGroupId": "group-uuid",
  // ⛔ Do NOT send classroomId
  // ⛔ Do NOT send startAt / endAt
  "dueDate": "2026-03-15T23:59:59Z"   // Replaces startAt/endAt
}
```

### With File Uploads
If attaching files, do not send JSON. Create a `FormData` object instead:
```javascript
const formData = new FormData();
formData.append("title", "Arrays lecture");
formData.append("taskType", "timetable");
formData.append("nodeId", "chapter-uuid");
// ... append all other string variables ...

// Append binary files
formData.append("files", fileInput.files[0]);
formData.append("files", fileInput.files[1]);

fetch("/api/v1/tasks", {
  method: "POST",
  headers: { "Authorization": "Bearer <token>" }, // Notice: No Content-Type header (browser sets boundary)
  body: formData
});
```

## ⚠️ Important Considerations for the Frontend Team
1. **Dynamic Form Fields:** The form dynamically changes based on `taskType`. Be absolutely sure to strip out `classroomId`, `startAt`, and `endAt` from your state payload if the user switches from `timetable` to `assignment` before submitting. Provide a single `dueDate` field instead.
2. **File Conversions:** The UI doesn't need to poll or wait for DOCX to PDF conversions. If a teacher uploads a Word document, let the API accept it. The backend converts it to a viewer-friendly PDF asynchronously.
3. **No Direct Node Selection for Teachers:** Teachers strictly pick assignments, not nodes. The assignments API bridges the gap and provides both `group` and `subject` simultaneously, preventing teachers from assigning tasks outside their domain.

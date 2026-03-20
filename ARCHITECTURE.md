# 🏗️ School Management System - Architecture Guide

## Overview
This document provides a detailed guide on how to implement and use the architectural structure defined in README.md.

## Architecture Layers

### 1. Frontend Layer (app/ directory)
- **Root Routes**: `app/(root)/` - Main authenticated application routes
- **Route Organization**: Each feature (class, student, subject, teacher, routine) has its own folder
- **Page Components**: Use `.jsx` files for interactive components
- **Layout Files**: Use `layout.jsx` for shared layouts within route groups

**Pattern for each feature:**
```
feature/
├── page.jsx          # List view
├── [id]/
│   └── page.jsx      # Detail/edit view
└── add-feature/
    └── page.jsx      # Create view
```

### 2. Component Layer (components/ directory)

#### Common Components (`common-components/`)
Reusable form and table components:
- **Forms**: `ClassForm.jsx`, `ClassSectionForm.jsx`, `StudentForm.jsx`, `StudentForm.jsx`, `TeacherTable.jsx`
- **Tables**: `ClassTable.jsx`, `ClassRoutineDataTable.jsx`
- **Fields**: `sectionFied.jsx`, `TopFied.jsx`
- **Utilities**: `style.css` for local styles

#### Shared Components (`shared-component/`)
Layout and navigation components:
- `NavBar.jsx` - Top navigation
- `SideBar.jsx` - Side navigation
- `Footer.jsx` - Footer
- `Pagination.jsx` - Pagination control
- Update forms: `classUpdateForm.jsx`, `subjectUpdateForm.jsx`

#### UI Components (`ui/`)
Shadcn/UI components from component library.

### 3. Business Logic Layer (lib/ directory)

#### Server Actions (lib/actions/)
Handle CRUD operations server-side:
- `class.action.model.js` - Class operations
- `classroutine.action.js` - Class routine operations
- `classsection.action.js` - Section operations
- `subject.action.js` - Subject operations
- `teacher.actions.js` - Teacher operations
- `gradeResult.action.js` - Grade, Result, and Attendance operations (comprehensive management)

**Example Server Action Pattern:**
```javascript
'use server'

import { connectToDB } from '@/lib/Database/connectToDB'
import Class from '@/models/class.model'

export async function getAllClasses() {
  try {
    await connectToDB()
    const classes = await Class.find()
    return JSON.parse(JSON.stringify(classes))
  } catch (error) {
    throw new Error(`Failed to fetch classes: ${error.message}`)
  }
}
```

#### Database Utilities (lib/Database/)
- `connectToDB.js` - MongoDB connection with singleton pattern, connection pooling, and hot-reload handling

**Key Features:**
- Global cache prevents exhausting MongoDB Atlas connections on hot reloads
- Connection pooling with configurable min/max pool sizes
- Automatic retry with exponential backoff
- Proper timeout and socket management
- Safe for concurrent connection attempts

**Environment Variables for Database:**
```env
MONOGO_DB_URL=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGO_DB_NAME=SMS
MONGO_POOL_SIZE=10
MONGO_MIN_POOL_SIZE=2
```

**Usage Pattern:**
```javascript
// In any server action or API route
import { connectToDB } from '@/lib/Database/connectToDB'

export async function getStudents() {
  const mongoose = await connectToDB() // Returns cached connection
  const students = await Student.find()
  return students
}
```

#### Data Fetching (lib/DataFech/)
- `All-data.js` - Centralized data fetching utilities

#### Helpers (lib/utils.js)
- Common utility functions
- Data transformers
- Validators

### 4. Data Layer (models/ directory)

Mongoose schemas for each entity:
- `user.model.js` - Users
- `class.model.js` - Classes
- `section.model.js` - Sections (parts of classes)
- `student.model.js` - Students
- `teacher.model.js` - Teachers
- `subject.model.js` - Subjects
- `classroutine.model.js` - Class routines
- `classSection.model.js` - Class-Section relationships
- `day.model.js` - Days
- `parent.model.js` - Parent information
- `academicSection.model.js` - Academic sections/terms
- `grade.model.js` - Individual grades (marks per subject/exam)
- `result.model.js` - Term results (composite grades, GPA, promotion status)
- `attendance.model.js` - Student attendance records

### 5. Static Assets (public/ directory)
- `public/assets/images/` - Store all images here

## Implementation Workflow

### For Creating a New Feature:

1. **Create Page Routes** (app/(root)/feature/)
   - List page: `page.jsx`
   - Detail page: `[id]/page.jsx`
   - Add page: `add-feature/page.jsx`

2. **Create Server Actions** (lib/actions/)
   - Implement CRUD operations
   - Handle database queries
   - Return serialized data

3. **Create Forms/Tables** (components/common-components/)
   - Use Shadcn UI components
   - Create reusable forms
   - Create data tables with pagination

4. **Update Models** (models/)
   - Ensure schema exists
   - Define relationships
   - Add validations

5. **Integrate Components** (app/(root)/feature/)
   - Import server actions
   - Use components
   - Handle state and effects

### Example: Adding a New Feature

**Step 1: Page Route (app/(root)/course/page.jsx)**
```javascript
import { getAllCourses } from '@/lib/actions/course.action'
import CourseTable from '@/components/common-components/CourseTable'

export default async function CoursesPage() {
  const courses = await getAllCourses()
  return <CourseTable courses={courses} />
}
```

**Step 2: Server Action (lib/actions/course.action.js)**
```javascript
'use server'
import { connectToDB } from '@/lib/Database/connectToDB'
import Course from '@/models/course.model'

export async function getAllCourses() {
  try {
    await connectToDB()
    const courses = await Course.find()
    return JSON.parse(JSON.stringify(courses))
  } catch (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`)
  }
}
```

**Step 3: Component (components/common-components/CourseTable.jsx)**
```javascript
'use client'
import { Button } from '@/components/ui/button'

export default function CourseTable({ courses }) {
  return (
    <div>
      <h1>Courses</h1>
      <table>
        {/* Render courses */}
      </table>
    </div>
  )
}
```

**Step 4: Model (models/course.model.js)**
```javascript
import mongoose from 'mongoose'

const courseSchema = new mongoose.Schema({
  name: String,
  code: String,
  // ... other fields
})

export default mongoose.models.Course || mongoose.model('Course', courseSchema)
```

## Key Patterns

### 1. Server Actions Pattern
- Functions marked with `'use server'` run on server
- Use in form actions or event handlers
- Always connect to DB first
- Return serialized JSON data

### 2. Client Components
- Use `'use client'` directive for interactivity
- Import server actions to call from forms
- Handle loading and error states

### 3. Component Composition
- Break UI into reusable pieces
- Keep components focused and small
- Use Shadcn UI for consistency

### 4. Data Flow
1. User interacts with page
2. Client component calls server action
3. Server action queries database
4. Data is serialized and returned
5. Component updates with new data

## Environment Variables
Create `.env.local` (or update `.env`):
```
MONGODB_URI=your_mongodb_connection_string
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

## File Naming Conventions
- **Components**: `PascalCase.jsx`
- **Server Actions**: `feature.action.js` or `feature.actions.js`
- **Models**: `featureName.model.js`
- **Utilities**: `camelCase.js`
- **Styles**: `style.css` or `[feature].module.css`

## Authentication & Authorization

### NextAuth.js Setup
- **auth.config.js**: NextAuth configuration with credentials provider
- **auth.js**: NextAuth handlers export (signIn, signOut, auth)
- **middleware.js**: Role-based route protection

### Role-Based Access Control
- **Admin Role**: Access to `/admin/*` routes
- **Teacher Role**: Access to `/teacher/*` routes
- **Student Role**: Access to student-specific routes
- **Unauthenticated**: Redirected to `/login`

### Middleware Configuration
- Uses NextAuth `auth()` wrapper for session handling
- Lightweight matcher excludes static assets and API routes
- Edge Runtime compatible
- Automatic redirect with callback URL preservation

### Usage in Components
```javascript
// Server Components
import { auth } from '@/auth'

export default async function ProtectedPage() {
  const session = await auth()
  if (!session) redirect('/signin')
  return <div>Welcome {session.user.name}!</div>
}

// Client Components
'use client'
import { useSession } from 'next-auth/react'

export default function ClientComponent() {
  const { data: session } = useSession()
  return <div>Role: {session?.user?.role}</div>
}
```

## Additional Features: Grades, Results & Attendance

### Model Descriptions

#### Grade Model (grade.model.js)
Stores individual grades/marks for students:
- **Purpose**: Track marks for each subject/exam
- **Key Fields**:
  - `student`: Reference to Student
  - `subject`: Reference to Subject
  - `exam`: Type of exam (Midterm, Final, Quiz, Assignment, Project)
  - `marks`: Numeric marks (0-100)
  - `grade`: Letter grade (A+, A, B+, etc.)
  - `term`: Academic term
  - `teacher`: Teacher who entered the grade

**Use Case**: Teacher enters marks for an exam → Creates Grade record

#### Result Model (result.model.js)
Stores composite term results:
- **Purpose**: Store final term grades, GPA, position, and promotion status
- **Key Fields**:
  - `student`: Reference to Student
  - `term`: Academic term
  - `totalMarks`: Sum of all subject marks
  - `obtainedMarks`: Student's total marks
  - `percentage`: Percentage scored
  - `gpa`: Grade Point Average (0-4)
  - `position`: Class rank
  - `gradeDetails`: Array of subject-wise grades
  - `promoted`: Boolean for promotion to next class
  - `promotionRemarks`: Promotion status details

**Use Case**: Generate end-of-term results using all Grades → Creates Result record

#### Attendance Model (attendance.model.js)
Tracks daily student attendance:
- **Purpose**: Record student presence/absence for each day
- **Key Fields**:
  - `student`: Reference to Student
  - `class`: Reference to Class
  - `date`: Date of attendance
  - `status`: Present, Absent, Late, Leave, Half Day
  - `subject`: Optional subject reference
  - `teacher`: Teacher who marked attendance
  - `remarks`: Additional notes

**Use Case**: Teacher marks attendance → Creates Attendance record → Calculate stats

### Server Actions Available (gradeResult.action.js)

#### Grade Functions
- `createGrade(gradeData)` - Create new grade
- `getAllGrades(filters)` - Get all grades with filters
- `getGradeById(id)` - Get single grade
- `getStudentGrades(studentId)` - Get all grades for a student
- `updateGrade(id, updateData)` - Update grade
- `deleteGrade(id)` - Delete grade

#### Result Functions
- `createResult(resultData)` - Create term result
- `getAllResults(filters)` - Get all results
- `getStudentResult(studentId, term, session)` - Get specific student result
- `getClassResults(classId, term, session)` - Get class merit list
- `updateResult(id, updateData)` - Update result
- `deleteResult(id)` - Delete result

#### Attendance Functions
- `createAttendance(attendanceData)` - Record attendance
- `getAllAttendance(filters)` - Get attendance records
- `getStudentAttendance(studentId, startDate, endDate)` - Get student attendance in range
- `getClassAttendance(classId, date)` - Get class attendance for specific date
- `getAttendanceStats(studentId, startDate, endDate)` - Calculate attendance percentage
- `updateAttendance(id, updateData)` - Update attendance
- `deleteAttendance(id)` - Delete attendance
- `bulkCreateAttendance(records)` - Create multiple records at once

### Integration Example

```javascript
// In a page component (grade/page.jsx)
'use client'
import { getStudentGrades } from '@/lib/actions/gradeResult.action'
import GradeTable from '@/components/common-components/GradeTable'

export default async function GradesPage() {
  const grades = await getStudentGrades(studentId)
  return <GradeTable grades={grades} />
}

// In a form component
'use client'
import { createGrade } from '@/lib/actions/gradeResult.action'

export default function GradeForm() {
  async function handleSubmit(formData) {
    const grade = await createGrade({
      student: formData.studentId,
      subject: formData.subjectId,
      exam: formData.exam,
      marks: formData.marks,
    })
  }
  return <form onSubmit={handleSubmit}>...</form>
}
```

### Workflow: Creating a Grades/Results/Attendance Feature

1. **Create Mark Sheet Page** (app/(root)/grades/add-marks/page.jsx)
   - Form to enter grades for multiple students
   - Save using `bulkCreateGrades()` or individual `createGrade()`

2. **Create Student Grades View** (app/(root)/grades/[studentId]/page.jsx)
   - Display all grades using `getStudentGrades()`
   - Show subject-wise performance

3. **Create Result Page** (app/(root)/results/page.jsx)
   - Generate term results using grades
   - Show merit list using `getClassResults()`
   - Calculate GPA and position

4. **Create Attendance Page** (app/(root)/attendance/page.jsx)
   - Daily attendance marking form
   - Attendance reports and statistics

5. **Components to Create**
   - `GradeTable.jsx` - Display grades
   - `GradeForm.jsx` - Add/edit grades
   - `ResultCard.jsx` - Display result
   - `AttendanceForm.jsx` - Mark attendance
   - `AttendanceReport.jsx` - View attendance records
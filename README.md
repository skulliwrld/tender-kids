# school-management-system
 A software applications that help schools to streamline their operations and improve efficiency. SMS can be used to track student information, manage attendance, grade assignments, and communicate with parents.


# 🏫 Modern School Management System (SMS)

A high-performance, responsive school management platform built with **Next.js 15**, **MongoDB Atlas**, and **Auth.js v5**. Featuring a "Bento Box" dashboard design for an outstanding user experience.

## 🚀 The Stack (The Workbench)
- **Frontend**: Next.js 15 (App Router, JavaScript)
- **Styling**: Tailwind CSS + Shadcn UI
- **Database**: MongoDB Atlas (Mongoose)
- **Authentication**: Auth.js v5 (NextAuth)
- **Animations**: Framer Motion

## 🏗️ Architecture Overview

This application follows a modern full-stack architecture:

- **Frontend Layer**: Built with Next.js 15 using the App Router for server-side rendering and client-side navigation. Components are styled with Tailwind CSS and Shadcn UI for a consistent design system.

- **Backend Layer**: Utilizes Next.js Server Actions for server-side logic, handling CRUD operations without a separate API layer.

- **Data Layer**: MongoDB Atlas with Mongoose ODM for data modeling and database interactions.

- **Authentication**: Integrated with Auth.js v5 for secure user authentication and session management.

- **Component Architecture**: Modular component structure with reusable UI elements, forms, and tables organized in dedicated folders.

This architecture ensures scalability, maintainability, and a great user experience.

---

## 📂 Project Structure (The Engine Room)

```
/
├── app/                          # Next.js App Router
│   ├── layout.js                 # Root layout
│   ├── page.js                   # Home page
│   └── (root)/                   # Main application routes
│       ├── layout.jsx            # Root layout for authenticated area
│       ├── page.js               # Dashboard
│       ├── class/                # Class Management
│       │   ├── page.jsx          # Class list
│       │   ├── [id]/
│       │   │   └── page.jsx      # Class details
│       │   ├── add-class/
│       │   │   └── page.jsx      # Add new class
│       │   └── manage-section/
│       │       ├── page.jsx      # Manage sections
│       │       ├── [id]/
│       │       │   └── page.jsx  # Section details
│       │       └── add-section/
│       │           └── page.jsx  # Add section
│       ├── classroutine/         # Class Routine Management
│       │   ├── page.jsx
│       │   ├── [id]/
│       │   │   └── page.jsx
│       │   └── add-classroutine/
│       │       └── page.jsx
│       ├── student/              # Student Management
│       │   ├── add-student/
│       │   │   └── page.jsx
│       │   └── section/
│       │       └── page.jsx
│       ├── subject/              # Subject Management
│       │   ├── page.jsx
│       │   ├── [id]/
│       │   │   ├── page.jsx
│       │   │   └── update/
│       │   │       └── page.jsx
│       │   └── add-subject/
│       │       └── page.jsx
│       └── teacher/              # Teacher Management
│           ├── page.jsx
│           ├── [id]/
│           │   └── page.jsx
│           └── add-teacher/
│               └── page.jsx
├── components/                   # Reusable components
│   ├── globals.css               # Global styles
│   ├── Data.js                   # Mock/static data
│   ├── Linkk.jsx
│   ├── common-components/        # Shared forms and tables
│   │   ├── ClassForm.jsx
│   │   ├── ClassRoutineDataTable.jsx
│   │   ├── classRoutineForm.jsx
│   │   ├── ClassSectionForm.jsx
│   │   ├── ClassTable.jsx
│   │   ├── MAINCOMPONENT.jsx
│   │   ├── sectionFied.jsx
│   │   ├── StudentForm.jsx
│   │   ├── SubjectForm.jsx
│   │   ├── TeacherTable.jsx
│   │   ├── TopFied.jsx
│   │   ├── ULComponent.jsx
│   │   ├── userComponent.jsx
│   │   └── style.css
│   ├── shared-component/         # Layout components
│   │   ├── NavBar.jsx
│   │   ├── SideBar.jsx
│   │   ├── Footer.jsx
│   │   ├── Inner.jsx
│   │   ├── menuLink.jsx
│   │   ├── NavSpecial.jsx
│   │   ├── Pagination.jsx
│   │   ├── AddTeacherForm.jsx
│   │   ├── classUpdateForm.jsx
│   │   ├── subjectUpdateForm.jsx
│   │   ├── TeacherFieldForm.jsx
│   │   ├── RoutineField.jsx
│   │   └── sectionTable.jsx
│   └── ui/                       # Shadcn UI components
│       ├── alert-dialog.jsx
│       ├── alert.jsx
│       ├── button.jsx
│       ├── dialog.jsx
│       ├── dropdown-menu.jsx
│       ├── form.jsx
│       └── label.jsx
├── lib/                          # Utilities and business logic
│   ├── utils.js                  # Helper functions
│   ├── actions/                  # Server actions (API logic)
│   │   ├── class.action.model.js
│   │   ├── classroutine.action.js
│   │   ├── classsection.action.js
│   │   ├── subject.action.js
│   │   └── teacher.actions.js
│   ├── Database/                 # Database utilities
│   │   └── connectToDB.js
│   └── DataFech/                 # Data fetching utilities
│       └── All-data.js
├── models/                       # Mongoose schemas
│   ├── academicSection.model.js
│   ├── attendance.model.js       # Student attendance tracking
│   ├── class.model.js
│   ├── classroutine.model.js
│   ├── classSection.model.js
│   ├── day.model.js
│   ├── grade.model.js            # Individual grades/marks
│   ├── parent.model.js
│   ├── result.model.js           # Term results & composite grades
│   ├── section.model.js
│   ├── student.model.js
│   ├── subject.model.js
│   ├── teacher.model.js
│   └── user.model.js
├── public/                       # Static assets
│   └── assets/
│       └── images/
├── auth.config.js                # NextAuth configuration with role-based auth
├── auth.js                       # NextAuth handlers export
├── middleware.js                 # Role-based route protection middleware
├── .gitignore
├── .env.local                    # Environment variables
├── components.json               # Shadcn UI config
├── jsconfig.json                 # JavaScript path aliases
├── next.config.mjs               # Next.js configuration
├── package.json                  # Dependencies
├── postcss.config.js             # PostCSS config
├── tailwind.config.js            # Tailwind CSS config
└── README.md                     # This file
```
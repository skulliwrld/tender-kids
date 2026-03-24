# School Fees Management Module - Technical Documentation

## 1. ERD Diagram Description

### Core Entities and Relationships

```
┌─────────────────────┐       ┌─────────────────────┐
│   AcademicSession   │       │        Term         │
├─────────────────────┤       ├─────────────────────┤
│ _id                 │──1:N──│ _id                 │
│ name                │       │ name                │
│ startDate           │       │ academicSession     │
│ endDate             │       │ termNumber          │
│ isActive            │       │ startDate           │
│ isArchived          │       │ endDate             │
└─────────────────────┘       │ isActive            │
                               └──────────┬──────────┘
                                          │
                                          │ 1:N
                                          ▼
┌──────────────────────────────────────────────────────────────────┐
│                        FeeStructure                              │
├──────────────────────────────────────────────────────────────────┤
│ _id                 │ 1:N                         N:1           │
│ name                │──────────────────────────────┤           │
│ description         │                              │           │
│ academicSession     │──────────────────────────┐   │           │
│ term                │                          │   │           │
│ classLevel          │                          ▼   ▼           │
│ feeType             │                   ┌─────────────┐         │
│ amount              │                   │ StudentFee  │         │
│ currency            │                   ├─────────────┤         │
│ dueDate             │                   │ _id         │         │
│ isOptional          │                   │ student     │─────────│──► Student
│ penaltyAmount       │                   │ academicSession        │
│ isActive            │                   │ term                    │
└──────────────────────────────────────────────────────────────────┘
                                                 │ │
                                                 │ │ 1:N
                                                 │ ▼
                                          ┌─────────────┐
                                          │   Payment   │
                                          ├─────────────┤
                                          │ _id         │
                                          │ studentFee  │
                                          │ student     │
                                          │ amount      │
                                          │ paymentMethod
                                          │ transactionId
                                          │ receiptNumber
                                          │ paymentDate
                                          │ status      │
                                          └─────────────┘
```

### Entity Relationships Summary

| Relationship | Type | Description |
|-------------|------|-------------|
| AcademicSession → Term | 1:N | One academic session has multiple terms |
| AcademicSession → FeeStructure | 1:N | One session can have many fee structures |
| Term → FeeStructure | 1:N | One term can have many fee types |
| Class → FeeStructure | 1:N | One class can have many fee structures |
| Student → StudentFee | 1:N | One student can have many fee assignments |
| FeeStructure → StudentFee | 1:N | One fee structure can be assigned to many students |
| StudentFee → Payment | 1:N | One student fee can have multiple payments |

---

## 2. API Routes

### Base Route: `/api/fees`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/academic` | Get academic sessions/terms | Admin |
| POST | `/academic` | Create session/term | Admin |
| PUT | `/academic?id=<id>&type=session\|term` | Update session/term | Admin |
| DELETE | `/academic?id=<id>` | Delete session | Admin |
| GET | `/structure` | Get fee structures | All |
| POST | `/structure` | Create fee structure | Admin |
| POST | `/structure?action=assign` | Assign fee to students | Admin |
| PUT | `/structure?id=<id>` | Update fee structure | Admin |
| DELETE | `/structure?id=<id>` | Delete fee structure | Admin |
| GET | `/student-fees` | Get student fees | All |
| GET | `/student-fees?summary=true` | Get fee summary | All |
| PUT | `/student-fees?id=<id>&action=waive` | Waive fee | Admin |
| PUT | `/student-fees?id=<id>&action=recalculate` | Recalculate balance | Admin |
| GET | `/payments` | Get payments | All |
| POST | `/payments` | Create payment | All |
| PUT | `/payments?id=<id>&action=reverse` | Reverse payment | Admin |
| GET | `/reports?type=dashboard` | Admin dashboard | Admin |
| GET | `/reports?type=class-report&classId=<id>` | Class report | Admin |
| GET | `/reports?type=outstanding` | Outstanding balances | Admin |
| GET | `/reports?type=collection-stats` | Collection stats | Admin |

---

## 3. Service Layer Logic

### Fee Balance Calculation Algorithm

```javascript
// Core balance calculation in recalculateFeeBalance()
async function recalculateFeeBalance(studentFeeId) {
  // 1. Get all completed payments for this fee
  const payments = await Payment.find({ 
    studentFee: studentFeeId, 
    status: 'completed' 
  });
  
  // 2. Sum all payment amounts
  const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
  
  // 3. Get base amount and apply waiver if exists
  let finalAmount = studentFee.amount;
  if (studentFee.isWaived) {
    finalAmount -= studentFee.waiverAmount;
  }
  
  // 4. Calculate balance
  const balance = Math.max(0, finalAmount - totalPaid);
  
  // 5. Determine status
  const status = balance <= 0 ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';
  
  // 6. Update the student fee
  return await StudentFee.findByIdAndUpdate(studentFeeId, {
    amountPaid: totalPaid,
    balance,
    status
  }, { new: true });
}
```

### Payment Update Algorithm (with Transactions)

```javascript
// Atomic payment processing in createPayment()
async function createPayment(data) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    // 1. Validate fee exists and get current balance
    const studentFee = await StudentFee.findById(data.studentFee);
    const maxPayable = studentFee.balance;
    
    // 2. Validate payment doesn't exceed balance
    if (data.amount > maxPayable) {
      throw new Error(`Payment cannot exceed balance of ${maxPayable}`);
    }
    
    // 3. Create payment record
    const payment = await Payment.create([{...data}], { session });
    
    // 4. Recalculate balance
    const newBalance = await recalculateFeeBalanceAfterPayment(studentFee._id, session);
    
    // 5. Commit transaction
    await session.commitTransaction();
    
    return payment[0];
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```

---

## 4. Dashboard Queries

### Admin Dashboard Query

```javascript
// Aggregates for real-time dashboard
const dashboard = await StudentFee.aggregate([
  { $match: { academicSession, term } },
  {
    $group: {
      _id: null,
      totalExpected: { $sum: '$amount' },
      totalPaid: { $sum: '$amountPaid' },
      totalBalance: { $sum: '$balance' },
      feesCount: { $sum: 1 },
    },
  },
]);

// Status breakdown
const statusBreakdown = await StudentFee.aggregate([
  { $match: { academicSession, term } },
  {
    $group: {
      _id: '$status',
      count: { $sum: 1 },
      amount: { $sum: '$balance' },
    },
  },
]);

// Collection by method
const collectionByMethod = await Payment.aggregate([
  { $match: { academicSession, term, status: 'completed' } },
  {
    $group: {
      _id: '$paymentMethod',
      total: { $sum: '$amount' },
      count: { $sum: 1 },
    },
  },
]);
```

### Student Fee Summary Query

```javascript
const summary = await StudentFee.aggregate([
  { $match: { student: studentId } },
  {
    $group: {
      _id: null,
      totalOriginalAmount: { $sum: '$originalAmount' },
      totalAmount: { $sum: '$amount' },
      totalPaid: { $sum: '$amountPaid' },
      totalBalance: { $sum: '$balance' },
      totalWaived: { $sum: '$waiverAmount' },
      feesCount: { $sum: 1 },
    },
  },
]);
```

---

## 5. Folder Structure

```
tender-kids/
├── models/
│   ├── academicSession.model.js      # Academic year/session schema
│   ├── term.model.js                  # Term schema
│   ├── feeStructure.model.js          # Fee definition schema
│   ├── studentFee.model.js            # Student-specific fee assignment
│   ├── payment.model.js               # Payment records
│   └── ...existing models
│
├── lib/actions/
│   ├── academicSession.action.js      # Session/term CRUD operations
│   ├── feeStructure.action.js         # Fee structure management
│   ├── studentFee.action.js           # Student fee operations
│   ├── payment.action.js              # Payment processing
│   └── feeDashboard.action.js         # Analytics & reports
│
├── app/api/fees/
│   ├── academic/
│   │   └── route.js                   # Session/term API
│   ├── structure/
│   │   └── route.js                   # Fee structure API
│   ├── student-fees/
│   │   └── route.js                   # Student fee API
│   ├── payments/
│   │   └── route.js                   # Payment API
│   └── reports/
│       └── route.js                   # Dashboard/reports API
│
├── components/fees/
│   ├── admin/
│   │   ├── FeeStructureManager.jsx   # Create/manage fee structures
│   │   ├── FeeCollectionManager.jsx  # Record payments
│   │   └── AdminFeeDashboard.jsx     # Admin overview
│   ├── student/
│   │   └── StudentFeeDashboard.jsx   # Student view
│   └── parent/
│       └── ParentFeePortal.jsx        # Parent view of children fees
│
└── app/(root)/fees/
    ├── page.jsx                        # Main fees landing
    ├── structure/
    │   └── page.jsx                    # Fee structure management
    ├── collection/
    │   └── page.jsx                    # Payment collection
    ├── reports/
    │   └── page.jsx                    # Financial reports
    └── student/
        └── page.jsx                    # Student fees view
```

---

## 6. Scalable Architecture

### Design Patterns Used

1. **Service Layer Pattern**: All business logic in `/lib/actions/`
2. **Repository Pattern**: Database operations centralized
3. **Transaction Support**: MongoDB sessions for atomic operations
4. **Role-Based Access Control**: Middleware for authorization

### Scalability Considerations

| Aspect | Implementation |
|--------|----------------|
| **Database Indexing** | Compound indexes on frequently queried fields |
| **Caching** | Add Redis for session/term caching |
| **Pagination** | All list endpoints support pagination |
| **Transactions** | MongoDB sessions for data integrity |
| **Error Handling** | Centralized error handling in routes |
| **Validation** | Input validation before business logic |

### Index Strategy

```javascript
// Fee Structure indexes
feeStructureSchema.index({ 
  academicSession: 1, 
  term: 1, 
  classLevel: 1, 
  feeType: 1 
}, { unique: true });

// Student Fee indexes  
studentFeeSchema.index({ student: 1, academicSession: 1, term: 1 });
studentFeeSchema.index({ status: 1 });
studentFeeSchema.index({ academicSession: 1, term: 1, status: 1 });

// Payment indexes
paymentSchema.index({ student: 1, paymentDate: -1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ receiptNumber: 1 }, { unique: true, sparse: true });
```

---

## 7. Portal Features

### Admin Portal
- Create/edit academic sessions and terms
- Define fee structures per class, session, term
- Automatic fee assignment to all students
- Record payments (cash, bank transfer, POS, etc.)
- View real-time dashboard
- Generate class-wise reports
- Track outstanding balances
- Waive fees for students
- Reverse/refund payments

### Student Portal
- View assigned fees
- See payment history
- Check outstanding balance
- Filter by session/term

### Parent Portal
- View all children's fees
- See payment history per child
- Track balance across children
- Filter by session

---

## 8. Fee Status Flow

```
UNPAID → PARTIAL → PAID
   ↑        │         │
   │        │         │
   └────────┴─────────┘ (via reverse/refund)

UNPAID/PARTIAL → WAIVED (via admin waiver)
```

---

## 9. Security Considerations

- Role-based route protection (admin/student/parent)
- Session-based authentication with NextAuth.js
- Transaction support prevents data inconsistency
- Input validation on all API endpoints
- Receipt numbers and transaction IDs prevent duplicate payments

---

## 10. Quick Start

```bash
# 1. Models are auto-loaded
# 2. Create academic session via API
POST /api/fees/academic
{ "documentType": "session", "name": "2025-2026", "startDate": "2025-09-01", "endDate": "2026-08-31", "isActive": true }

# 3. Create term
POST /api/fees/academic
{ "documentType": "term", "name": "First Term", "academicSession": "<session_id>", "termNumber": 1, "startDate": "2025-09-01", "endDate": "2025-12-31", "isActive": true }

# 4. Create fee structure
POST /api/fees/structure
{ "name": "Tuition Fee", "academicSession": "<session_id>", "term": "<term_id>", "classLevel": "<class_id>", "feeType": "tuition", "amount": 50000 }

# 5. Assign to students
POST /api/fees/structure?action=assign
{ "feeStructureId": "<fee_structure_id>" }

# 6. Record payment
POST /api/fees/payments
{ "studentFee": "<student_fee_id>", "amount": 25000, "paymentMethod": "bank_transfer" }
```

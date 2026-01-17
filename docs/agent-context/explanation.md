
## 📊 TanStack Table Implementation

All table components in this system use **TanStack Table v8** (React Table) for consistent, performant data grids with advanced features.

### Core Table Architecture

```typescript
// modules/core/hooks/use-table.ts
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState
} from '@tanstack/react-table';

export function useSmartTable<T>(options: SmartTableOptions<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10
  });

  const table = useReactTable({
    data: options.data,
    columns: options.columns,
    state: { sorting, columnFilters, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: options.serverSide,
    pageCount: options.serverSide ? options.pageCount : undefined
  });

  return { table, sorting, columnFilters, pagination };
}
```

### Pattern 1: Client-Side Table (Small Datasets)

**Use Case**: Entity lists with < 1000 rows, cached data

```typescript
// modules/crud/components/entity-list.tsx
'use client';

import { useSmartTable } from '@/modules/core/hooks/use-table';
import { ColumnDef } from '@tanstack/react-table';
import { Product } from '@/types';

const columns: ColumnDef<Product>[] = [
  {
    accessorKey: 'name',
    header: 'Product Name',
    cell: ({ row }) => <div className="font-medium">{row.getValue('name')}</div>
  },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) => {
      const price = parseFloat(row.getValue('price'));
      return <div>${price.toFixed(2)}</div>;
    }
  },
  {
    id: 'actions',
    cell: ({ row }) => <EntityActions entity={row.original} />
  }
];

export function EntityList({ data }: { data: Product[] }) {
  const { table } = useSmartTable({
    data,
    columns,
    serverSide: false
  });

  return (
    <div>
      <DataTableToolbar table={table} />
      <DataTable table={table} />
      <DataTablePagination table={table} />
    </div>
  );
}
```

### Pattern 2: Server-Side Table (Large Datasets)

**Use Case**: Reports, audit logs, large entity lists

```typescript
// modules/history/components/audit-trail.tsx
'use client';

import { useSmartTable } from '@/modules/core/hooks/use-table';
import { useQuery } from '@tanstack/react-query';

export function AuditTrail() {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 50 });
  const [sorting, setSorting] = useState([]);
  const [filters, setFilters] = useState([]);

  // Server-side data fetching
  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', pagination, sorting, filters],
    queryFn: () => fetchAuditLogs({ pagination, sorting, filters })
  });

  const columns: ColumnDef<AuditLog>[] = [
    {
      accessorKey: 'timestamp',
      header: 'Timestamp',
      cell: ({ row }) => format(row.getValue('timestamp'), 'PPpp')
    },
    {
      accessorKey: 'user.name',
      header: 'User'
    },
    {
      accessorKey: 'entity',
      header: 'Entity'
    },
    {
      accessorKey: 'operation',
      header: 'Action',
      cell: ({ row }) => <OperationBadge operation={row.getValue('operation')} />
    },
    {
      id: 'changes',
      header: 'Changes',
      cell: ({ row }) => <ChangesDiff changes={row.original.changes} />
    }
  ];

  const { table } = useSmartTable({
    data: data?.items ?? [],
    columns,
    serverSide: true,
    pageCount: data?.totalPages ?? 0
  });

  return <DataTable table={table} loading={isLoading} />;
}
```

### Pattern 3: Advanced Financial Table

**Use Case**: Pivot tables, aggregations, formulas

```typescript
// modules/reporting/components/financial-table/index.tsx
'use client';

import { useReactTable, ColumnDef } from '@tanstack/react-table';

export function FinancialTable({ config }: { config: FinancialTableConfig }) {
  // Process data with aggregations
  const processedData = useMemo(() => {
    return aggregateFinancialData(config);
  }, [config]);

  const columns: ColumnDef<FinancialRow>[] = useMemo(() => {
    // Dynamic column generation based on config
    const cols: ColumnDef<FinancialRow>[] = [
      {
        id: 'account',
        header: 'Account',
        columns: [
          { accessorKey: 'accountCode', header: 'Code' },
          { accessorKey: 'accountName', header: 'Name' }
        ]
      }
    ];

    // Add period columns dynamically
    config.periods.forEach(period => {
      cols.push({
        id: period.id,
        header: period.label,
        columns: [
          {
            accessorKey: `${period.id}.debit`,
            header: 'Debit',
            cell: ({ row }) => formatCurrency(row.getValue(`${period.id}.debit`)),
            footer: ({ table }) => {
              const total = table.getRowModel().rows.reduce(
                (sum, row) => sum + row.getValue(`${period.id}.debit`),
                0
              );
              return <div className="font-bold">{formatCurrency(total)}</div>;
            }
          },
          {
            accessorKey: `${period.id}.credit`,
            header: 'Credit',
            cell: ({ row }) => formatCurrency(row.getValue(`${period.id}.credit`)),
            footer: ({ table }) => {
              const total = table.getRowModel().rows.reduce(
                (sum, row) => sum + row.getValue(`${period.id}.credit`),
                0
              );
              return <div className="font-bold">{formatCurrency(total)}</div>;
            }
          }
        ]
      });
    });

    return cols;
  }, [config]);

  const table = useReactTable({
    data: processedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    // Enable grouping for drill-down
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel()
  });

  return <FinancialTableView table={table} />;
}
```

### Pattern 4: Editable Data Grid

**Use Case**: Spreadsheet-like editing, bulk updates

```typescript
// modules/core/components/data-grid/index.tsx
'use client';

export function DataGrid<T>({ data, onUpdate }: DataGridProps<T>) {
  const [editedData, setEditedData] = useState(data);

  const columns: ColumnDef<T>[] = useMemo(() => 
    columnConfig.map(col => ({
      accessorKey: col.key,
      header: col.label,
      cell: ({ row, column }) => {
        const [editing, setEditing] = useState(false);
        const value = row.getValue(column.id);

        return editing ? (
          <EditableCell
            value={value}
            onSave={(newValue) => {
              updateCell(row.index, column.id, newValue);
              setEditing(false);
            }}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <div onClick={() => setEditing(true)}>
            {value}
          </div>
        );
      }
    })),
    [columnConfig]
  );

  const table = useReactTable({
    data: editedData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    meta: {
      updateData: (rowIndex: number, columnId: string, value: any) => {
        setEditedData(old =>
          old.map((row, index) => {
            if (index === rowIndex) {
              return { ...row, [columnId]: value };
            }
            return row;
          })
        );
      }
    }
  });

  return <EditableTable table={table} />;
}
```

### Shared Table Components

```typescript
// modules/core/components/smart-table/table-header.tsx
export function DataTableToolbar({ table }: { table: Table<any> }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        {/* Global filter */}
        <Input
          placeholder="Search..."
          value={(table.getState().globalFilter as string) ?? ''}
          onChange={(e) => table.setGlobalFilter(e.target.value)}
        />
        
        {/* Column filters */}
        <ColumnFilters table={table} />
        
        {/* View options */}
        <ViewOptionsDropdown table={table} />
      </div>
      
      <div className="flex items-center gap-2">
        {/* Export buttons */}
        <ExportButton table={table} format="csv" />
        <ExportButton table={table} format="excel" />
        <ExportButton table={table} format="pdf" />
      </div>
    </div>
  );
}

// modules/core/components/smart-table/table-pagination.tsx
export function DataTablePagination({ table }: { table: Table<any> }) {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex-1 text-sm text-muted-foreground">
        {table.getFilteredSelectedRowModel().rows.length} of{' '}
        {table.getFilteredRowModel().rows.length} row(s) selected.
      </div>
      <div className="flex items-center space-x-6 lg:space-x-8">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Rows per page</p>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectContent side="top">
              {[10, 20, 30, 40, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Page {table.getState().pagination.pageIndex + 1} of{' '}
          {table.getPageCount()}
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            First
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            Last
          </Button>
        </div>
      </div>
    </div>
  );
}
```

### Module-Specific Table Implementations

#### 1. CRUD Module Tables
```typescript
// modules/crud/components/entity-list.tsx
// Features: Sorting, filtering, bulk actions, inline edit
// Pattern: Client-side for < 1000 rows, Server-side for more
```

#### 2. Workflow Module Tables
```typescript
// modules/workflow/components/task-list.tsx
// Features: Status badges, priority sorting, assignment filters, due date highlighting
// Pattern: Server-side with real-time updates
```

#### 3. Order Module Tables
```typescript
// modules/order-payment/components/order-list.tsx
// Features: Status timeline, payment status, amount totals in footer
// Pattern: Server-side with expandable order items
```

#### 4. History Module Tables
```typescript
// modules/history/components/activity-log.tsx
// Features: Time-based grouping, user filtering, diff visualization
// Pattern: Server-side with infinite scroll
```

#### 5. Reporting Module Tables

**Simple Table**:
```typescript
// modules/reporting/components/simple-table/index.tsx
// Features: Basic sorting, CSV export, print view
// Pattern: Client-side with column resizing
```

**Financial Table**:
```typescript
// modules/reporting/components/financial-table/index.tsx
// Features: Column grouping, aggregation footers, drill-down, formula calculations
// Pattern: Client-side with complex computed columns
```

### TanStack Table Feature Matrix

| Module | Sorting | Filtering | Pagination | Grouping | Selection | Export | Editable |
|--------|---------|-----------|------------|----------|-----------|--------|----------|
| CRUD | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |
| Workflow | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| File Storage | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Order & Payment | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| History | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ❌ |
| Simple Reporting | ✅ | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ |
| Financial Table | ✅ | ✅ | ❌ | ✅ | ❌ | ✅ | ❌ |
| Data Grid | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ |

### Export Functionality

```typescript
// modules/core/components/smart-table/table-export.tsx
export function exportToCSV(table: Table<any>, filename: string) {
  const rows = table.getFilteredRowModel().rows;
  const columns = table.getAllColumns().filter(col => col.getIsVisible());
  
  const csvContent = [
    // Header
    columns.map(col => col.columnDef.header).join(','),
    // Rows
    ...rows.map(row => 
      columns.map(col => {
        const value = row.getValue(col.id);
        return typeof value === 'string' ? `"${value}"` : value;
      }).join(',')
    )
  ].join('\n');
  
  downloadFile(csvContent, filename, 'text/csv');
}

export function exportToExcel(table: Table<any>, filename: string) {
  // Use SheetJS (xlsx) for Excel export with formatting
  const ws = XLSX.utils.json_to_sheet(
    table.getFilteredRowModel().rows.map(row => row.original)
  );
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${filename}.xlsx`);
}

export function exportToPDF(table: Table<any>, filename: string) {
  // Use jsPDF for PDF export
  const doc = new jsPDF();
  doc.autoTable({
    head: [table.getAllColumns().map(col => col.columnDef.header)],
    body: table.getFilteredRowModel().rows.map(row =>
      table.getAllColumns().map(col => row.getValue(col.id))
    )
  });
  doc.save(`${filename}.pdf`);
}
```

---

## 🏗️ Architecture Layers

### 1. **Routing Layer** (`app/`)
- **Responsibility**: URL routing, page rendering, route protection
- **Pattern**: Next.js App Router with route groups
- **Rules**:
  - No business logic here
  - Fetch data via Server Actions
  - Pass data to components as props

### 2. **Presentation Layer** (`modules/*/components/`)
- **Responsibility**: UI rendering, user interactions
- **Pattern**: Client/Server Component composition
- **Rules**:
  - Client Components: Interactive UI, state management
  - Server Components: Data fetching, static content
  - No direct DB access

### 3. **Application Layer** (`modules/*/actions.ts`)
- **Responsibility**: Entry point for client requests (Controller)
- **Pattern**: Next.js Server Actions
- **Flow**:
  ```typescript
  export async function createEntity(formData: FormData) {
    // 1. Authentication check
    const session = await requireAuth();
    
    // 2. Authorization check
    await requirePermission(session, 'entity:create');
    
    // 3. Input validation
    const validated = schema.parse(formData);
    
    // 4. Call service layer
    const result = await entityService.create(validated);
    
    // 5. Revalidate cache
    revalidatePath('/entities');
    
    return result;
  }
  ```

### 4. **Domain Layer** (`modules/*/services/`)
- **Responsibility**: Business logic, domain rules
- **Pattern**: Service classes with single responsibility
- **Rules**:
  - Pure business logic
  - No framework dependencies
  - Testable in isolation

### 5. **Infrastructure Layer** (`lib/`)
- **Responsibility**: External services, DB, storage, APIs
- **Pattern**: Adapter/Repository pattern
- **Examples**: Prisma client, S3 storage, email service

---

## 🔷 Generic Module Patterns

### Pattern 1: CRUD Module (`modules/crud/`)

**Use Case**: Master data management (users, categories, products, etc.)

**Key Features**:
- Dynamic entity configuration
- Automatic form generation
- List view with filters & sorting
- Soft delete support
- Audit trail integration

**Configuration Example**:
```typescript
// modules/crud/config.ts
export const entityConfig = {
  product: {
    fields: [
      { name: 'name', type: 'text', required: true },
      { name: 'price', type: 'number', required: true },
      { name: 'category', type: 'select', options: 'categories' }
    ],
    permissions: ['product:read', 'product:create'],
    softDelete: true
  }
};
```

**Extension Example**:
```typescript
// modules/procurement/services/tender.service.ts
import { BaseCrudService } from '@/modules/crud/services/base-crud.service';

export class TenderService extends BaseCrudService {
  constructor() {
    super('tender');
  }
  
  // Add domain-specific logic
  async publish(tenderId: string) {
    // Custom business logic
  }
}
```

---

### Pattern 2: Workflow Module (`modules/workflow/`)

**Use Case**: Approval flows, multi-step processes (purchase requests, leave applications)

**Key Features**:
- Visual workflow designer (BPMN-like)
- Dynamic task assignment
- State machine for transitions
- SLA tracking
- Email/notification integration

**Workflow Definition**:
```typescript
// Example workflow config
{
  id: 'purchase-approval',
  name: 'Purchase Request Approval',
  states: [
    { id: 'draft', name: 'Draft' },
    { id: 'pending', name: 'Pending Approval' },
    { id: 'approved', name: 'Approved' },
    { id: 'rejected', name: 'Rejected' }
  ],
  transitions: [
    { from: 'draft', to: 'pending', action: 'submit', guard: 'validateAmount' },
    { from: 'pending', to: 'approved', action: 'approve', role: 'approver' },
    { from: 'pending', to: 'rejected', action: 'reject', role: 'approver' }
  ],
  tasks: [
    { state: 'pending', assignTo: 'role:approver', sla: '2 days' }
  ]
}
```

**Usage in Domain Module**:
```typescript
// modules/procurement/services/purchase-request.service.ts
import { WorkflowEngine } from '@/modules/workflow/services/workflow-engine.service';

export class PurchaseRequestService {
  async submitForApproval(requestId: string) {
    return await WorkflowEngine.startProcess('purchase-approval', {
      entityId: requestId,
      entityType: 'purchase_request',
      initiatorId: session.userId
    });
  }
}
```

---

### Pattern 3: File Storage Module (`modules/file-storage/`)

**Use Case**: Document management, image uploads, attachments

**Key Features**:
- Multi-provider support (S3, Azure Blob, Local)
- Automatic thumbnail generation
- File versioning
- Access control per file
- Virus scanning
- Direct upload to cloud (signed URLs)

**Architecture**:
```typescript
// Storage adapter pattern
interface StorageAdapter {
  upload(file: File, path: string): Promise<string>;
  download(path: string): Promise<Buffer>;
  delete(path: string): Promise<void>;
  getSignedUrl(path: string, expiresIn: number): Promise<string>;
}

// S3 implementation
class S3StorageAdapter implements StorageAdapter {
  // Implementation
}

// Usage
const storage = StorageFactory.create(process.env.STORAGE_PROVIDER);
await storage.upload(file, 'invoices/2026/invoice-001.pdf');
```

---

### Pattern 4: Order & Payment Module (`modules/order-payment/`)

**Use Case**: E-commerce, booking systems, subscription billing

**Key Features**:
- Order lifecycle management (cart → order → payment → fulfillment)
- Multiple payment methods (credit card, bank transfer, e-wallet)
- Payment gateway integration (Stripe, Midtrans, Xendit)
- Invoice generation (PDF)
- Refund handling
- Webhook processing

**Order State Machine**:
```
CART → PENDING → CONFIRMED → PAID → PROCESSING → SHIPPED → DELIVERED
                    ↓
                CANCELLED
```

**Service Architecture**:
```typescript
// modules/order-payment/services/order.service.ts
export class OrderService {
  async createFromCart(cartId: string): Promise<Order> { }
  async confirmOrder(orderId: string): Promise<Order> { }
  async cancelOrder(orderId: string, reason: string): Promise<Order> { }
}

// modules/order-payment/services/payment.service.ts
export class PaymentService {
  async createPayment(orderId: string, method: PaymentMethod): Promise<Payment> { }
  async processWebhook(provider: string, payload: any): Promise<void> { }
  async verifyPayment(paymentId: string): Promise<boolean> { }
}
```

---

### Pattern 5: History Module (`modules/history/`)

**Use Case**: Audit trails, change tracking, activity logs

**Key Features**:
- Automatic change detection
- Field-level history (who changed what, when)
- Activity timeline
- Diff visualization
- Retention policies

**Implementation**:
```typescript
// Middleware for automatic tracking
export async function trackChanges<T>(
  entity: string,
  operation: 'create' | 'update' | 'delete',
  before: T | null,
  after: T | null,
  userId: string
) {
  await prisma.auditLog.create({
    data: {
      entity,
      operation,
      before: before ? JSON.stringify(before) : null,
      after: after ? JSON.stringify(after) : null,
      changes: computeDiff(before, after),
      userId,
      timestamp: new Date()
    }
  });
}

// Usage in service
await trackChanges('tender', 'update', oldTender, newTender, session.userId);
```

---

### Pattern 6: Reporting Module (`modules/reporting/`)

**Use Case**: Data visualization, exports, financial reports

#### 6.1 Simple Tabular (`reporting/components/simple-table/`)
- Basic list/table reports
- Sorting, filtering, pagination
- CSV/Excel export
- Print support

#### 6.2 Advanced Financial Table (`reporting/components/financial-table/`)
- **Pivoting**: Dynamic row/column grouping
- **Aggregations**: Sum, average, count, custom formulas
- **Drill-down**: Click to expand details
- **Formula engine**: Excel-like calculations
- **Multi-currency**: Automatic conversion
- **Period comparison**: YoY, MoM

**Example Use Cases**:
- Trial Balance
- Profit & Loss Statement
- Cash Flow Analysis
- Inventory Valuation
- Budget vs Actual

**Configuration**:
```typescript
{
  dataSource: 'transactions',
  rows: ['account.category', 'account.name'],
  columns: ['period'],
  values: [
    { field: 'amount', aggregation: 'sum', format: 'currency' },
    { field: 'quantity', aggregation: 'sum' }
  ],
  filters: {
    date: { from: '2026-01-01', to: '2026-12-31' },
    status: 'posted'
  },
  calculations: {
    variance: '=actual - budget',
    percentage: '=(actual / budget) * 100'
  }
}
```

---

## 🎨 Module Extension Guide

### How to Create Domain-Specific Module

**Example: Procurement Module (extending CRUD + Workflow + File Storage)**

```sh
src/modules/procurement/
├── components/
│   ├── tender-list.tsx        # Extends entity-list from crud
│   ├── tender-form.tsx         # Extends entity-form from crud
│   ├── bid-submission.tsx      # Custom component
│   └── vendor-comparison.tsx   # Custom component
│
├── actions.ts
├── services/
│   ├── index.ts
│   ├── tender.service.ts       # Extends BaseCrudService
│   └── bid.service.ts
│
├── schema.ts
└── types.ts
```

**Implementation**:
```typescript
// services/tender.service.ts
import { BaseCrudService } from '@/modules/crud/services/base-crud.service';
import { WorkflowEngine } from '@/modules/workflow/services/workflow-engine.service';
import { FileStorageService } from '@/modules/file-storage/services/storage.service';

export class TenderService extends BaseCrudService {
  constructor() {
    super('tender');
  }
  
  // Use CRUD base methods: create, update, delete, findById, findAll
  
  // Add domain-specific logic
  async publish(tenderId: string) {
    const tender = await this.findById(tenderId);
    
    // Start workflow
    await WorkflowEngine.startProcess('tender-approval', {
      entityId: tenderId
    });
    
    // Update status
    return await this.update(tenderId, { status: 'published' });
  }
  
  async submitBid(tenderId: string, bidData: any, documents: File[]) {
    // Upload documents using file-storage module
    const uploadedDocs = await Promise.all(
      documents.map(doc => FileStorageService.upload(doc, `tenders/${tenderId}/bids`))
    );
    
    // Create bid with document references
    return await prisma.bid.create({
      data: {
        ...bidData,
        tenderId,
        documents: uploadedDocs
      }
    });
  }
}
```

---

## 🛡️ IAM Module Detailed

```sh
src/modules/iam/
├── actions.ts              # ⚡ Server Actions (Entry point dari UI)
├── guard.ts                # 🛡️ Server-side Authorization Helper
├── components/             # 🧩 UI Components
│   ├── login-form.tsx      # Form Login
│   ├── register-form.tsx   # Form Register
│   ├── user-table.tsx      # Tabel Manajemen User
│   ├── user-form.tsx       # Form Tambah/Edit User
│   ├── role-table.tsx      # Tabel Manajemen Role
│   ├── role-form.tsx       # Form Role dengan Permission Matrix
│   ├── permission-matrix.tsx  # Matrix Role-Permission
│   └── rbac-guard.tsx      # Component Wrapper (Client Side Protection)
├── data/                   # 📄 Data & Validation
│   ├── schema.ts           # Zod Schema (Validasi Input)
│   └── dto.ts              # Data Transfer Object (Type Definition)
└── services/               # 🧠 Business Logic (Database interaction)
    ├── index.ts            # Service aggregator
    ├── auth.service.ts     # Logic verify password, hash password, session
    ├── user.service.ts     # CRUD User, activate/deactivate
    ├── role.service.ts     # CRUD Role & Assign Permission
    └── permission.service.ts  # Permission checking logic
```

**IAM Flow**:
```typescript
// Server Action → Guard → Service → Database

// 1. actions.ts
export async function updateUser(userId: string, data: UpdateUserDTO) {
  await requireAuth();
  await requirePermission('user:update');
  return await userService.update(userId, data);
}

// 2. guard.ts
export async function requirePermission(permission: string) {
  const session = await auth();
  const hasPermission = await permissionService.check(session.userId, permission);
  if (!hasPermission) throw new UnauthorizedError();
}

// 3. services/user.service.ts
export class UserService {
  async update(userId: string, data: UpdateUserDTO) {
    // Business logic
    const user = await prisma.user.update({ where: { id: userId }, data });
    
    // Track in history
    await historyService.track('user', 'update', user);
    
    return user;
  }
}
```

---

## 🔄 Data Flow Architecture

### Read Flow (Server Component)
```
Page (RSC) → Server Action → Service → Prisma → Database
     ↓
  Component (Display)
```

### Write Flow (Client Component)
```
Form (Client) → Server Action → Validation → Service → Prisma → Database
                                                   ↓
                                         Audit Log (History)
                                                   ↓
                                         Revalidate Cache
```

### Workflow Flow
```
User Action → Start Process → Workflow Engine → Create Task
                                    ↓
                            State Transition
                                    ↓
                            Assign to User/Role
                                    ↓
                            Send Notification
```

---

## 📦 Database Schema Strategy

### Core Tables (Prisma Schema)
```prisma
// IAM
model User { }
model Role { }
model Permission { }
model Session { }

// Audit
model AuditLog { }

// File Storage
model File { }
model Folder { }

// Workflow
model WorkflowProcess { }
model WorkflowTask { }
model WorkflowState { }

// Order & Payment
model Order { }
model OrderItem { }
model Payment { }
model Invoice { }

// Generic CRUD (Polymorphic)
model Entity {
  id          String
  type        String   // 'product', 'category', etc.
  data        Json     // Flexible schema
  metadata    Json
  createdAt   DateTime
  updatedAt   DateTime
  deletedAt   DateTime?
}
```

---

## 🚀 Implementation Checklist

### Phase 1: Foundation
- [ ] Setup Next.js 15+ with App Router
- [ ] Configure Prisma with database
- [ ] Setup Auth.js with IAM module
- [ ] Create core components (smart-table, dynamic-form)
- [ ] Implement RBAC guard system

### Phase 2: Generic Modules
- [ ] CRUD module with configuration
- [ ] Workflow engine with state machine
- [ ] File storage with S3 adapter
- [ ] History/audit logging
- [ ] Basic reporting

### Phase 3: Advanced Modules
- [ ] Order & payment module
- [ ] Advanced financial tables
- [ ] Notification system
- [ ] Email integration

### Phase 4: Domain Modules
- [ ] Create first domain module (example: procurement)
- [ ] Document extension patterns
- [ ] Create module generator CLI

---

## 💡 Best Practices

1. **Separation of Concerns**: Never mix UI logic with business logic
2. **Dependency Injection**: Pass services as parameters for testability
3. **Error Handling**: Use Result/Either pattern for error propagation
4. **Type Safety**: Leverage TypeScript strictly, avoid `any`
5. **Performance**: Use React Server Components by default, Client Components only when needed
6. **Security**: Always validate input, check permissions, sanitize output
7. **Caching**: Use Next.js cache strategies (revalidatePath, revalidateTag)
8. **Testing**: Write unit tests for services, integration tests for actions

---

## 📚 Module Reusability Examples

| Generic Module | Domain Extension Examples |
|---------------|---------------------------|
| CRUD | Product Management, Category, Supplier, Employee |
| Workflow | Purchase Approval, Leave Request, Document Approval |
| File Storage | Invoice Documents, Product Images, User Avatars |
| Order & Payment | E-commerce Orders, Subscription Billing, Booking |
| History | Tender Change Log, User Activity, Inventory Movements |
| Reporting | Sales Report, Financial Statement, Inventory Report |

---

## 🎯 Summary

This architecture provides:
- ✅ **Reusable generic modules** for common business functions
- ✅ **Clean separation** between layers
- ✅ **Easy extension** to domain-specific needs
- ✅ **Type-safe** end-to-end with TypeScript
- ✅ **Scalable** for enterprise applications
- ✅ **Maintainable** with clear structure and patterns
# INSTRUCTION

## 🎯 Architecture Overview

This is a **generic, modular information system** built with Next.js 15+, Prisma, and TypeScript. The architecture follows **Clean Architecture**, **Feature-Driven Design**, and **Component-Based Modularity** principles.

### Core Principles
1. **Reusability**: Generic modules can be adopted and extended for domain-specific needs
2. **Single Responsibility**: Each layer has a clear, distinct purpose
3. **Dependency Rule**: Inner layers never depend on outer layers
4. **Modularity**: Features are isolated and composable

---

## 📁 Complete Folder Structure

```sh
src/
├── app/                           # 🚀 ROUTING LAYER (Next.js App Router)
│   ├── (auth)/                    # Route Group: Authentication
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── forgot-password/page.tsx
│   │
│   ├── (modules)/                 # Route Group: Protected Area
│   │   ├── layout.tsx             # Shell Layout (Sidebar + Header + RBAC)
│   │   ├── page.tsx               # Dashboard Home
│   │   │
│   │   ├── master-data/           # Generic CRUD Module Routes
│   │   │   └── [entity]/          # Dynamic Entity Routes
│   │   │       ├── page.tsx       # List View
│   │   │       ├── create/page.tsx
│   │   │       └── [id]/
│   │   │           ├── page.tsx   # Detail View
│   │   │           └── edit/page.tsx
│   │   │
│   │   ├── workflow/              # Generic Workflow Routes
│   │   │   ├── page.tsx           # Workflow Dashboard
│   │   │   └── [processId]/
│   │   │       ├── page.tsx       # Process Instance
│   │   │       └── tasks/[taskId]/page.tsx
│   │   │
│   │   ├── files/                 # File Management Routes
│   │   │   ├── page.tsx           # File Browser
│   │   │   └── [folderId]/page.tsx
│   │   │
│   │   ├── orders/                # Order & Payment Routes
│   │   │   ├── page.tsx           # Order List
│   │   │   ├── create/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx       # Order Detail
│   │   │       └── payment/page.tsx
│   │   │
│   │   ├── reports/               # Tabular & Reports Routes
│   │   │   ├── simple/page.tsx    # Simple Tables
│   │   │   └── advanced/page.tsx  # Financial Tables
│   │   │
│   │   ├── history/               # History/Audit Log Routes
│   │   │   └── page.tsx
│   │   │
│   │   └── [domain-module]/       # 🎨 Domain-Specific Modules
│   │       └── [feature]/page.tsx # e.g., /procurement/tender
│   │
│   └── api/                       # API Routes (External/Webhooks only)
│       ├── webhooks/
│       │   └── payment/route.ts
│       └── upload/route.ts        # File upload endpoint
│
├── lib/                           # ⚙️ INFRASTRUCTURE LAYER
│   ├── prisma.ts                  # Singleton DB Connection
│   ├── auth.ts                    # Auth.js Configuration
│   ├── storage.ts                 # File Storage Config (S3/Local)
│   ├── email.ts                   # Email Service Config
│   ├── queue.ts                   # Job Queue Config
│   └── utils.ts                   # Framework utilities (cn, fetcher)
│
├── utils/                         # 🛠️ SHARED UTILITIES
│   ├── index.ts                   # Utility aggregator
│   ├── converter.ts               # Data converters
│   ├── formatter.ts               # Number, date, currency formatters
│   ├── validator.ts               # Custom validators
│   └── helpers.ts                 # Generic helpers
│
├── modules/                       # 🧱 BUSINESS LOGIC LAYER (The Lego Factory)
│   │
│   ├── core/                      # 🟢 SHARED FOUNDATION
│   │   ├── components/            # Generic Reusable UI
│   │   │   │
│   │   │   ├── smart-table/       # 📊 TanStack Table Generic Implementation
│   │   │   │   ├── index.tsx                      # Main table component (client)
│   │   │   │   ├── data-table.tsx                 # Table body renderer
│   │   │   │   ├── data-table-toolbar.tsx         # Search, filters, export actions
│   │   │   │   ├── data-table-pagination.tsx      # Pagination controls
│   │   │   │   ├── data-table-view-options.tsx    # Column visibility toggle
│   │   │   │   ├── data-table-column-header.tsx   # Sortable column header
│   │   │   │   ├── data-table-faceted-filter.tsx  # Multi-select filter
│   │   │   │   ├── data-table-row-actions.tsx     # Row action dropdown
│   │   │   │   ├── table-cells/                   # Reusable cell renderers
│   │   │   │   │   ├── text-cell.tsx
│   │   │   │   │   ├── number-cell.tsx
│   │   │   │   │   ├── currency-cell.tsx
│   │   │   │   │   ├── date-cell.tsx
│   │   │   │   │   ├── badge-cell.tsx
│   │   │   │   │   ├── avatar-cell.tsx
│   │   │   │   │   ├── link-cell.tsx
│   │   │   │   │   └── actions-cell.tsx
│   │   │   │   │
│   │   │   │   ├── table-export/                  # Export functionality
│   │   │   │   │   ├── index.ts
│   │   │   │   │   ├── export-button.tsx
│   │   │   │   │   ├── export-csv.ts
│   │   │   │   │   ├── export-excel.ts
│   │   │   │   │   └── export-pdf.ts
│   │   │   │   │
│   │   │   │   ├── table-filters/                 # Filter components
│   │   │   │   │   ├── index.tsx
│   │   │   │   │   ├── text-filter.tsx
│   │   │   │   │   ├── number-filter.tsx
│   │   │   │   │   ├── date-filter.tsx
│   │   │   │   │   ├── select-filter.tsx
│   │   │   │   │   └── multi-select-filter.tsx
│   │   │   │   │
│   │   │   │   └── table-skeleton.tsx             # Loading skeleton
│   │   │   │
│   │   │   ├── financial-table/   # 💰 Advanced Financial Table (TanStack)
│   │   │   │   ├── index.tsx                      # Main financial table
│   │   │   │   ├── financial-table-view.tsx       # View renderer with footer
│   │   │   │   ├── financial-table-header.tsx     # Grouped column headers
│   │   │   │   ├── financial-table-footer.tsx     # Aggregation footer
│   │   │   │   ├── financial-table-row.tsx        # Expandable row
│   │   │   │   ├── cells/                         # Financial cell types
│   │   │   │   │   ├── account-cell.tsx
│   │   │   │   │   ├── debit-credit-cell.tsx
│   │   │   │   │   ├── balance-cell.tsx
│   │   │   │   │   └── percentage-cell.tsx
│   │   │   │   │
│   │   │   │   ├── pivoting.tsx                   # Pivot table logic
│   │   │   │   ├── aggregations.tsx               # Aggregation calculators
│   │   │   │   ├── formula-engine.ts              # Excel-like formulas
│   │   │   │   └── drill-down.tsx                 # Drill-down component
│   │   │   │
│   │   │   ├── data-grid/         # 📝 Editable Data Grid (TanStack)
│   │   │   │   ├── index.tsx                      # Main grid component
│   │   │   │   ├── editable-cell.tsx              # Inline edit cell
│   │   │   │   ├── cell-editors/                  # Cell editor components
│   │   │   │   │   ├── text-editor.tsx
│   │   │   │   │   ├── number-editor.tsx
│   │   │   │   │   ├── select-editor.tsx
│   │   │   │   │   └── date-editor.tsx
│   │   │   │   │
│   │   │   │   └── grid-toolbar.tsx               # Grid actions (save, undo)
│   │   │   │
│   │   │   ├── dynamic-form/      # Form Builder (JSON Schema → UI)
│   │   │   │   ├── index.tsx
│   │   │   │   ├── field-renderer.tsx
│   │   │   │   ├── form-validator.tsx
│   │   │   │   └── form-config.ts
│   │   │   │
│   │   │   ├── file-manager/      # File Browser UI
│   │   │   │   ├── file-list.tsx
│   │   │   │   ├── file-uploader.tsx
│   │   │   │   ├── file-preview.tsx
│   │   │   │   └── folder-tree.tsx
│   │   │   │
│   │   │   └── layout/            # Shell Components
│   │   │       ├── app-shell.tsx
│   │   │       ├── sidebar.tsx
│   │   │       ├── header.tsx
│   │   │       └── breadcrumb.tsx
│   │   │
│   │   ├── services/              # Generic Business Services
│   │   │   ├── audit-logger.ts    # Activity logging
│   │   │   ├── notification.ts    # Push notifications
│   │   │   └── cache.ts           # Cache management
│   │   │
│   │   ├── hooks/                 # 🎣 Shared React Hooks (TanStack Table)
│   │   │   ├── use-smart-table.ts           # Core table hook (client/server)
│   │   │   ├── use-table-state.ts           # Table state management
│   │   │   ├── use-table-columns.ts         # Dynamic column generator
│   │   │   ├── use-table-filters.ts         # Filter state & logic
│   │   │   ├── use-table-sorting.ts         # Sorting state & logic
│   │   │   ├── use-table-pagination.ts      # Pagination state
│   │   │   ├── use-table-selection.ts       # Row selection state
│   │   │   ├── use-table-export.ts          # Export functionality
│   │   │   ├── use-server-table.ts          # Server-side table hook
│   │   │   ├── use-editable-table.ts        # Editable grid hook
│   │   │   ├── use-financial-table.ts       # Financial table hook
│   │   │   ├── use-form.ts                  # Form state management
│   │   │   └── use-mobile.ts                # Mobile detection
│   │   │
│   │   ├── lib/                   # 🔧 Core Utilities for Tables
│   │   │   ├── table-utils.ts               # Table helper functions
│   │   │   ├── column-builder.ts            # Column definition builder
│   │   │   ├── filter-utils.ts              # Filter helpers
│   │   │   ├── sort-utils.ts                # Sort helpers
│   │   │   └── export-utils.ts              # Export helpers
│   │   │
│   │   └── types/                 # 📝 Global Types (TanStack Table)
│   │       ├── api.types.ts                 # API Response types
│   │       ├── table.types.ts               # Table configuration types
│   │       │   # - SmartTableOptions
│   │       │   # - TableConfig
│   │       │   # - ColumnConfig
│   │       │   # - FilterConfig
│   │       │   # - ExportConfig
│   │       │   # - PaginationConfig
│   │       │
│   │       ├── financial-table.types.ts     # Financial table types
│   │       │   # - FinancialTableConfig
│   │       │   # - FinancialRow
│   │       │   # - AggregationConfig
│   │       │   # - PivotConfig
│   │       │
│   │       ├── data-grid.types.ts           # Data grid types
│   │       └── form.types.ts                # Form types
│   │
│   ├── crud/                      # 🔷 GENERIC MODULE: CRUD Operations
│   │   ├── components/
│   │   │   ├── entity-list.tsx    # Generic list view
│   │   │   ├── entity-form.tsx    # Generic create/edit form
│   │   │   └── entity-detail.tsx  # Generic detail view
│   │   │
│   │   ├── actions.ts             # Server actions (create, update, delete)
│   │   │
│   │   ├── services/
│   │   │   ├── index.ts           # Service orchestrator
│   │   │   ├── base-crud.service.ts  # Generic CRUD logic
│   │   │   └── validation.service.ts
│   │   │
│   │   ├── schema.ts              # Zod schemas
│   │   ├── types.ts               # CRUD types
│   │   └── config.ts              # Entity configuration registry
│   │
│   ├── workflow/                  # 🔷 GENERIC MODULE: Workflow Engine
│   │   ├── components/
│   │   │   ├── workflow-designer.tsx  # Visual workflow builder
│   │   │   ├── task-list.tsx
│   │   │   ├── task-form.tsx
│   │   │   └── process-tracker.tsx    # Status visualization
│   │   │
│   │   ├── actions.ts             # Start process, complete task, etc.
│   │   │
│   │   ├── services/
│   │   │   ├── index.ts
│   │   │   ├── workflow-engine.service.ts  # Process execution
│   │   │   ├── task-manager.service.ts     # Task assignment/completion
│   │   │   └── state-machine.service.ts    # State transitions
│   │   │
│   │   ├── schema.ts              # Workflow definition schema
│   │   └── types.ts               # Process, Task, State types
│   │
│   ├── file-storage/              # 🔷 GENERIC MODULE: File Management
│   │   ├── components/
│   │   │   ├── file-browser.tsx
│   │   │   ├── file-uploader.tsx
│   │   │   ├── file-preview.tsx
│   │   │   └── folder-manager.tsx
│   │   │
│   │   ├── actions.ts             # Upload, download, delete
│   │   │
│   │   ├── services/
│   │   │   ├── index.ts
│   │   │   ├── storage.service.ts      # S3/Local storage adapter
│   │   │   ├── thumbnail.service.ts    # Image processing
│   │   │   └── virus-scan.service.ts   # Security scanning
│   │   │
│   │   ├── schema.ts
│   │   └── types.ts
│   │
│   ├── order-payment/             # 🔷 GENERIC MODULE: Order & Payment
│   │   ├── components/
│   │   │   ├── order-list.tsx
│   │   │   ├── order-form.tsx
│   │   │   ├── order-detail.tsx
│   │   │   ├── payment-form.tsx
│   │   │   └── invoice-generator.tsx
│   │   │
│   │   ├── actions.ts             # Create order, process payment
│   │   │
│   │   ├── services/
│   │   │   ├── index.ts
│   │   │   ├── order.service.ts        # Order lifecycle
│   │   │   ├── payment.service.ts      # Payment processing
│   │   │   ├── invoice.service.ts      # Invoice generation
│   │   │   └── payment-gateway.service.ts  # Payment gateway integration
│   │   │
│   │   ├── schema.ts
│   │   └── types.ts
│   │
│   ├── history/                   # 🔷 GENERIC MODULE: History & Audit
│   │   ├── components/
│   │   │   ├── activity-log.tsx
│   │   │   ├── audit-trail.tsx
│   │   │   └── change-history.tsx
│   │   │
│   │   ├── actions.ts             # Query history
│   │   │
│   │   ├── services/
│   │   │   ├── index.ts
│   │   │   ├── history.service.ts      # Record tracking
│   │   │   └── diff.service.ts         # Change detection
│   │   │
│   │   └── types.ts
│   │
│   ├── reporting/                 # 🔷 GENERIC MODULE: Tabular & Reports
│   │   ├── components/
│   │   │   ├── simple-table/      # Basic tabular reports
│   │   │   │   └── index.tsx
│   │   │   │
│   │   │   └── financial-table/   # Advanced financial tables
│   │   │       ├── index.tsx
│   │   │       ├── pivot-table.tsx
│   │   │       ├── ledger-view.tsx
│   │   │       └── trial-balance.tsx
│   │   │
│   │   ├── actions.ts             # Generate reports
│   │   │
│   │   ├── services/
│   │   │   ├── index.ts
│   │   │   ├── report-generator.service.ts
│   │   │   ├── data-aggregator.service.ts
│   │   │   └── export.service.ts       # PDF, Excel export
│   │   │
│   │   └── types.ts
│   │
│   ├── iam/                       # 🟡 MODULE: Identity & Access Management
│   │   ├── components/
│   │   │   ├── login-form.tsx
│   │   │   ├── user-table.tsx
│   │   │   ├── user-form.tsx
│   │   │   ├── role-table.tsx
│   │   │   ├── role-form.tsx
│   │   │   ├── permission-matrix.tsx
│   │   │   └── rbac-guard.tsx     # Client-side auth guard
│   │   │
│   │   ├── actions.ts             # Login, logout, register
│   │   ├── guard.ts               # Server-side authorization
│   │   │
│   │   ├── services/
│   │   │   ├── index.ts
│   │   │   ├── auth.service.ts         # Authentication logic
│   │   │   ├── user.service.ts         # User CRUD
│   │   │   ├── role.service.ts         # Role & permission management
│   │   │   └── session.service.ts      # Session handling
│   │   │
│   │   ├── data/
│   │   │   ├── schema.ts          # Zod validation
│   │   │   └── dto.ts             # Data Transfer Objects
│   │   │
│   │   └── types.ts
│   │
│   └── [domain-module]/           # 🎨 DOMAIN-SPECIFIC MODULES
│       ├── components/            # UI components
│       ├── actions.ts             # Server actions
│       ├── services/              # Business logic
│       │   └── index.ts
│       ├── schema.ts              # Validation
│       └── types.ts               # Local types
│
├── styles/                        # 🎨 PRESENTATION LAYER
│   └── globals.css
│
├── types/                         # 📝 GLOBAL TYPE DEFINITIONS
│   ├── next-auth.d.ts
│   ├── environment.d.ts
│   └── global.d.ts
│
└── config/                        # 🔧 CONFIGURATION
    ├── constants.ts               # App constants
    └── feature-flags.ts           # Feature toggles
```


---

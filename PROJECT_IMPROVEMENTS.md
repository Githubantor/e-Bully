# JRS Trade - Project Improvement Recommendations

Generated: 2026-06-26

---

## 🔴 HIGH PRIORITY - Security & Critical Bugs

### 1. Missing Input Validation on Product Creation/Update
**File:** `backend/src/routes/products.js`, `backend/src/controllers/productController.js`
**Issue:** No validation middleware on POST/PUT routes. Any field can be injected.
**Fix:** Add `express-validator` checks for required fields (title, description, category, price, etc.)

### 2. JWT Secret Not Rotated / No Refresh Token Rotation
**File:** `backend/src/middleware/auth.js`, `backend/src/controllers/authController.js`
**Issue:** Single JWT secret, no refresh token mechanism. Tokens don't expire properly.
**Fix:** Implement access token (15min) + refresh token (7d) rotation with httpOnly cookies.

### 3. No Password Strength Requirements
**File:** `backend/src/routes/auth.js` line 14
**Issue:** Only `min: 6` chars. No uppercase, number, special char requirements.
**Fix:** Add regex validation: `/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/`

### 4. Rate Limiting Only on Auth Routes
**File:** `backend/src/server.js` lines 32-38
**Issue:** API endpoints (products, orders, cart) have no rate limiting.
**Fix:** Apply rate limiter globally or per-route (e.g., 100 req/min for API).

### 5. CORS Origin Not Validated Properly
**File:** `backend/src/server.js` line 29
**Issue:** `origin: process.env.CLIENT_URL || 'http://localhost:5173'` - falls back to localhost in production.
**Fix:** Require `CLIENT_URL` in production, reject if missing.

---

## 🟠 MEDIUM PRIORITY - Code Quality & Architecture

### 6. No Tests At All
**Entire project:** Zero test files found.
**Risk:** Regressions on every change, no CI/CD confidence.
**Fix:** Add Jest + Supertest for backend, Vitest + React Testing Library for frontend. Target 70%+ coverage.

### 7. Multi-tenant DB Per Seller Not Implemented Consistently
**File:** `backend/src/config/db.js` lines 47-57, `backend/src/middleware/auth.js` lines 19-21
**Issue:** `getUserDb()` exists but cart is only model using it. Orders, products don't use tenant DB.
**Fix:** Either fully implement per-seller DB isolation or remove the complexity.

### 8. No Database Indexes Beyond Defaults
**Files:** `backend/src/models/*.js`
**Issue:** Only basic indexes. Missing compound indexes for common queries (category+isActive, seller+isActive, price range).
**Fix:** Add indexes matching query patterns in controllers.

### 9. Inconsistent Error Handling
**Files:** Various controllers
**Issue:** Some return 404 with message, some throw to errorHandler. No standard error codes.
**Fix:** Create `AppError` class with codes (NOT_FOUND, VALIDATION_ERROR, UNAUTHORIZED, etc.)

### 10. No Request Logging / Monitoring
**File:** `backend/src/server.js`
**Issue:** No Morgan, Winston, or similar. Hard to debug production issues.
**Fix:** Add structured logging (Winston) + request ID middleware.

---

## 🟡 MEDIUM PRIORITY - Frontend UX & Performance

### 11. No React Query / SWR for Data Fetching
**Files:** `frontend/src/store/productStore.js`, `frontend/src/store/cartStore.js`
**Issue:** Zustand stores used as both state + fetch logic. No caching, deduping, background refetch.
**Fix:** Migrate to TanStack Query (React Query) or SWR. Keep Zustand only for UI state (cart, auth).

### 12. No Image Optimization / Lazy Loading
**Files:** `frontend/src/components/ProductCard.jsx`, `frontend/src/pages/products/ProductDetail.jsx`
**Issue:** Full-size images loaded eagerly. No blur placeholders, no WebP/AVIF.
**Fix:** Use `loading="lazy"`, add Cloudinary transformations (`f_auto,q_auto`), add skeleton loaders.

### 13. Bundle Size - Heavy Dependencies
**File:** `frontend/package.json`
**Issue:** `framer-motion` (12MB), `lucide-react` (large), `radix-ui` (multiple packages) for minimal usage.
**Fix:** Audit bundle (`npm run build && npx vite-bundle-analyzer`). Replace with lighter alternatives or tree-shake.

### 14. No Pagination on Category/Subcategory Lists
**Files:** `frontend/src/pages/Home.jsx`, `frontend/src/pages/products/ProductList.jsx`
**Issue:** All categories fetched at once. Will break with 100+ categories.
**Fix:** Add pagination or virtualized list.

### 15. Cart Not Persisted Across Sessions
**File:** `frontend/src/store/cartStore.js`
**Issue:** Zustand cart stored in memory only. Refresh = empty cart.
**Fix:** Persist to localStorage (already using Zustand, add `persist` middleware).

### 16. No Loading Skeletons / Error Boundaries
**Files:** All pages
**Issue:** Spinners only. No skeleton screens. No React Error Boundary.
**Fix:** Add skeleton components, wrap routes in `<ErrorBoundary>`.

---

## 🟢 LOW PRIORITY - Enhancements & DX

### 17. Missing API Documentation
**Project:** No OpenAPI/Swagger spec.
**Fix:** Add `swagger-jsdoc` + `swagger-ui-express` to backend.

### 18. No CI/CD Pipeline
**Project:** No GitHub Actions, GitLab CI, etc.
**Fix:** Add workflow: lint → test → build → deploy preview.

### 19. TypeScript Not Fully Adopted
**Frontend:** `.tsx` UI components exist but pages are `.jsx`. No strict mode.
**Fix:** Rename all to `.tsx`, enable strict TS config, add types for API responses.

### 20. Search Only Uses Text Index - No Filters
**File:** `backend/src/controllers/productController.js` lines 8-10
**Issue:** `$text` search only. No filter by brand, attributes, rating, in-stock.
**Fix:** Add faceted search with aggregation pipeline.

### 21. Admin Panel Minimal
**Files:** `frontend/src/pages/admin/*.jsx`
**Issue:** Only user/order lists. No product management, category management, analytics charts.
**Fix:** Add CRUD UI for products/categories, sales charts (Recharts/Chart.js).

### 22. Seller Dashboard Missing Features
**Files:** `frontend/src/pages/seller/*.jsx`
**Issue:** No inventory alerts, no bulk product import/export, no sales reports export.
**Fix:** Add low-stock alerts, CSV export, date-range reports.

### 23. No Email Templates / Notification System
**Files:** `backend/src/controllers/authController.js`, `backend/src/controllers/orderController.js`
**Issue:** Nodemailer imported but no email templates or notification service.
**Fix:** Create email service with MJML templates for: welcome, order confirmation, shipping updates, password reset.

### 24. Payment Webhook Not Secured
**File:** `backend/src/routes/payments.js` (not read but inferred)
**Issue:** Stripe webhook needs signature verification.
**Fix:** Verify `stripe-signature` header using `stripe.webhooks.constructEvent`.

### 25. File Upload - No Validation
**File:** `backend/src/routes/upload.js`, `backend/src/middleware/upload.js`
**Issue:** No file type/size validation before Cloudinary upload.
**Fix:** Add multer limits (`fileSize: 5MB`, `fileFilter` for images only).

---

## 📋 QUICK WINS (Do This Week)

| # | Task | Effort | Impact |
|---|------|--------|--------|
| 1 | Add express-validator to product routes | 30 min | Security |
| 2 | Add JWT refresh token + httpOnly cookie | 2 hr | Security |
| 3 | Persist cart to localStorage | 15 min | UX |
| 4 | Add Morgan logging | 15 min | Debugging |
| 5 | Add request ID middleware | 10 min | Debugging |
| 6 | Create AppError class | 30 min | Code quality |
| 7 | Add skeleton loaders | 1 hr | UX |
| 8 | Add ErrorBoundary | 30 min | Reliability |
| 9 | Validate CORS in production | 10 min | Security |
| 10 | Add password strength regex | 10 min | Security |

---

## 🏗️ ARCHITECTURAL DECISIONS NEEDED

1. **Multi-tenancy:** Keep per-seller DB or move to single DB with `sellerId` indexing?
2. **State Management:** Migrate fully to React Query + minimal Zustand?
3. **Real-time:** Need WebSocket for order updates, chat? (Socket.io)
4. **Search:** Upgrade to Meilisearch/Algolia for faceted search?
5. **CMS:** Need blog/pages? (Contentful/Strapi integration)

---

## 📁 FILES TO CREATE

```
backend/
├── tests/                    # Jest + Supertest
├── src/
│   ├── utils/
│   │   ├── AppError.js       # Standard error classes
│   │   ├── catchAsync.js     # Wrapper for async controllers
│   │   └── apiResponse.js    # Standard response format
│   ├── middleware/
│   │   ├── requestId.js      # X-Request-ID header
│   │   └── validation.js     # Reusable validators
│   └── services/
│       ├── emailService.js   # Nodemailer + templates
│       └── notificationService.js

frontend/
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Skeleton.jsx
│   │   │   └── ErrorBoundary.jsx
│   │   └── forms/            # Reusable form components
│   ├── hooks/
│   │   ├── useProducts.js    # React Query hooks
│   │   └── useAuth.js
│   └── services/
│       └── api.js            # Typed API client
```

---

## 🔧 RECOMMENDED DEV TOOLS

- **Backend:** `npm i -D jest supertest @types/jest ts-jest`
- **Frontend:** `npm i -D vitest @testing-library/react @testing-library/jest-dom msw`
- **Linting:** `npm i -D eslint-plugin-testing-library eslint-plugin-jest`
- **Git Hooks:** `npm i -D husky lint-staged` (pre-commit: lint + typecheck)

---

## 📊 ESTIMATED EFFORT

| Priority | Items | Est. Time |
|----------|-------|-----------|
| High (Security) | 5 | 8-12 hours |
| Medium (Quality) | 6 | 16-24 hours |
| Low (Enhancement) | 9 | 24-40 hours |
| Quick Wins | 10 | 4-6 hours |

**Total:** ~50-80 hours for full remediation
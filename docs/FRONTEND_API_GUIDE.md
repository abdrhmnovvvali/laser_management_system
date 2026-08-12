# Frontend API Guide — Lazer Epilyasiya Mərkəzi

Bu sənəd frontend komandası üçün backend API ilə **ideal inteqrasiya** yolunu izah edir: auth, pagination, ad (name) enrichment, filtrlər və TypeScript/React nümunələri.

> **Swagger:** server işləyərkən `http://localhost:3000/api` (port `.env`-dən asılı ola bilər)

---

## 1. Ümumi qaydalar

| Qayda | Təsvir |
|-------|--------|
| **Auth** | Bütün endpoint-lər (login/refresh istisna) `Authorization: Bearer <accessToken>` tələb edir |
| **List cavabları** | `{ data: T[], meta: { total, page, limit, totalPages } }` |
| **Tək record** | Birbaşa obyekt (`GET /customers/:id`) |
| **POST/PATCH** | Ad enrichment yoxdur — yalnız `GET` list/detail-də `*Name` və `zones[]` gəlir |
| **ID + Name** | UI-da ad göstərmək üçün ayrıca lookup lazım deyil — backend artıq adları qaytarır |

---

## 2. Autentifikasiya

### 2.1 Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "staff@lazer.az",
  "password": "your-password"
}
```

**Cavab:**

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "expiresIn": 3600,
  "role": "branch_staff",
  "branchId": "uuid",
  "branchName": "Nərimanov filialı"
}
```

### 2.2 Token yeniləmə

Access token bitməyə yaxın və ya 401 aldıqda:

```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "<stored_refresh_token>"
}
```

Cavab login ilə eyni formadadır.

### 2.3 Cari istifadəçi

```http
GET /auth/me
Authorization: Bearer <accessToken>
```

```json
{
  "id": "uuid",
  "email": "staff@lazer.az",
  "role": "admin",
  "branchId": null,
  "branchName": null
}
```

### 2.4 Rollar

```typescript
type Role = 'admin' | 'branch_staff';
```

| Rol | Frontend davranışı |
|-----|-------------------|
| `admin` | Bütün filiallar, staff idarəetməsi, filial CRUD |
| `branch_staff` | Yalnız öz filialının məlumatları (backend RLS ilə məhdudlaşır) |

---

## 3. Pagination

### 3.1 Query parametrləri

| Parametr | Default | Max | Təsvir |
|----------|---------|-----|--------|
| `page` | `1` | — | Səhifə nömrəsi (1-dən başlayır) |
| `limit` | `20` | `100` | Səhifədə element sayı |

```http
GET /customers?page=2&limit=10
```

### 3.2 Cavab strukturu

```typescript
interface PaginatedMeta {
  total: number;       // ümumi element sayı (filtrdən sonra)
  page: number;        // cari səhifə
  limit: number;       // səhifə ölçüsü
  totalPages: number;  // Math.ceil(total / limit)
}

interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}
```

**Nümunə:**

```json
{
  "data": [
    {
      "id": "uuid",
      "firstName": "Nülfər",
      "lastName": "Məmmədova",
      "branchId": "uuid",
      "branchName": "Nərimanov filialı"
    }
  ],
  "meta": {
    "total": 150,
    "page": 2,
    "limit": 10,
    "totalPages": 15
  }
}
```

### 3.3 Pagination olmayan endpoint-lər

Bunlar birbaşa obyekt/array qaytarır:

- `GET /:id` — tək record (müştəri, prosedur, zona və s.)
- `GET /auth/me`
- `GET /dashboard/summary`
- `POST`, `PATCH`, `DELETE` cavabları

---

## 4. Name enrichment (ID → ad)

Backend GET cavablarında əlaqəli obyektlərin adları artıq doldurulur. Frontend **lookup cədvəli saxlamadan** birbaşa UI-da göstərə bilər.

### 4.1 `*Name` field-ləri

| Entity | Field | Nümunə |
|--------|-------|--------|
| Customer, Device, Auth | `branchName` | `"Nərimanov filialı"` |
| Zone | `deviceName` | `"Candela GentleMax Pro"` |
| Procedure, Note, FollowUp, Notification | `customerName` | `"Nülfər Məmmədova"` |
| Procedure, Fraud | `deviceName` | `"Candela GentleMax Pro"` |
| Procedure | `packageName`, `freeZoneName` | `"Tam bədən paketi"` |

### 4.2 `zones` array (NamedEntity)

Paket, kampaniya və prosedurlarda:

```typescript
interface NamedEntity {
  id: string;
  name: string;
}

interface Package {
  zoneIds: string[];   // filter/form üçün saxlanılır
  zones: NamedEntity[]; // UI-da göstərmək üçün istifadə et
}
```

**UI tövsiyəsi:** Cədvəldə zona sütunu üçün:

```tsx
{procedure.zones.map((z) => z.name).join(', ')}
```

---

## 5. TypeScript tipləri

`src/types/api.ts` faylı yaradın:

```typescript
// --- Shared ---

export type Role = 'admin' | 'branch_staff';

export interface PaginatedMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginatedMeta;
}

export interface NamedEntity {
  id: string;
  name: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

// --- Auth ---

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  role: Role;
  branchId: string | null;
  branchName: string | null;
}

export interface CurrentUser {
  id: string;
  email?: string;
  role: Role;
  branchId: string | null;
  branchName: string | null;
}

export interface StaffUser {
  id: string;
  email: string;
  fullName?: string;
  role: Role;
  branchId: string | null;
  branchName: string | null;
}

// --- Customer ---

export type Gender = 'male' | 'female' | 'other';

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  birthDate: string | null;
  gender: Gender | null;
  branchId: string;
  branchName: string | null;
  registeredAt: string;
}

export interface ListCustomersParams extends PaginationParams {
  branchId?: string;
  gender?: Gender;
  zoneId?: string;
  search?: string;
}

// --- Procedure ---

export interface Procedure {
  id: string;
  customerId: string;
  customerName: string | null;
  deviceId: string;
  deviceName: string | null;
  packageId: string | null;
  packageName: string | null;
  zoneIds: string[];
  zones: NamedEntity[];
  date: string;
  declaredShotCount: number;
  actualShotCount: number;
  shotCountDifference: number;
  price: number;
  originalPrice: number;
  loyaltyRewardApplied: boolean;
  freeZoneId: string | null;
  freeZoneName: string | null;
  discountAmount: number;
  visitNumber: number | null;
  createdAt: string;
}

export interface ListProceduresParams extends PaginationParams {
  customerId?: string;
  deviceId?: string;
  zoneNames?: string[]; // OR məntiqi
  zoneIds?: string[]; // OR məntiqi
  branchId?: string;
  packageId?: string;
  visitNumber?: number;
  declaredShotCount?: number;
  actualShotCount?: number;
  difference?: number; // actualShotCount - declaredShotCount
  dateFrom?: string; // ISO date
  dateTo?: string; // ISO date
  minPrice?: number;
  maxPrice?: number;
}

// --- Dashboard (pagination yoxdur) ---

export interface DashboardSummary {
  totalCustomers: number;
  monthlyRevenue: number;
  todaysBirthdaysCount: number;
  upcomingFollowUpsCount: number;
  activeCampaignsCount: number;
  fraudAlertsCount: number;
}
```

---

## 6. API client (Axios)

### 6.1 Konfiqurasiya

```typescript
// src/lib/api-client.ts
import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string) {
  accessToken = access;
  refreshToken = refresh;
  localStorage.setItem('accessToken', access);
  localStorage.setItem('refreshToken', refresh);
}

export function loadTokensFromStorage() {
  accessToken = localStorage.getItem('accessToken');
  refreshToken = localStorage.getItem('refreshToken');
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

let isRefreshing = false;
let pendingQueue: Array<(token: string) => void> = [];

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config;
    if (error.response?.status !== 401 || !original || !refreshToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve) => {
        pendingQueue.push((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(original));
        });
      });
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post<LoginResponse>(`${API_BASE_URL}/auth/refresh`, {
        refreshToken,
      });
      setTokens(data.accessToken, data.refreshToken);
      pendingQueue.forEach((cb) => cb(data.accessToken));
      pendingQueue = [];
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(original);
    } catch {
      clearTokens();
      window.location.href = '/login';
      return Promise.reject(error);
    } finally {
      isRefreshing = false;
    }
  },
);
```

### 6.2 Query string helper (array parametrlər)

```typescript
// src/lib/build-query.ts
export function buildQuery(params: Record<string, unknown>): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;

    if (Array.isArray(value)) {
      value.forEach((item) => search.append(key, String(item)));
    } else {
      search.set(key, String(value));
    }
  }

  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// İstifadə:
// buildQuery({ page: 1, limit: 20, zoneNames: ['Üz', 'Qol'] })
// → ?page=1&limit=20&zoneNames=Üz&zoneNames=Qol
```

### 6.3 Generic paginated fetch

```typescript
// src/lib/paginated-fetch.ts
import { apiClient } from './api-client';
import { buildQuery } from './build-query';
import type { PaginatedResponse } from '../types/api';

export async function fetchPaginated<T, P extends Record<string, unknown>>(
  path: string,
  params: P,
): Promise<PaginatedResponse<T>> {
  const { data } = await apiClient.get<PaginatedResponse<T>>(
    `${path}${buildQuery(params)}`,
  );
  return data;
}
```

---

## 7. React Query (TanStack Query) — ideal pattern

### 7.1 Auth hook

```typescript
// src/features/auth/use-auth.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient, setTokens, clearTokens, loadTokensFromStorage } from '@/lib/api-client';
import type { CurrentUser, LoginResponse } from '@/types/api';

export function useCurrentUser() {
  loadTokensFromStorage();
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      const { data } = await apiClient.get<CurrentUser>('/auth/me');
      return data;
    },
    retry: false,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: { email: string; password: string }) => {
      const { data } = await apiClient.post<LoginResponse>('/auth/login', body);
      setTokens(data.accessToken, data.refreshToken);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['auth'] }),
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return () => {
    clearTokens();
    qc.clear();
    window.location.href = '/login';
  };
}
```

### 7.2 Generic paginated list hook

```typescript
// src/hooks/use-paginated-query.ts
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { fetchPaginated } from '@/lib/paginated-fetch';
import type { PaginatedResponse } from '@/types/api';

interface UsePaginatedQueryOptions<T, P extends Record<string, unknown>> {
  queryKey: string;
  path: string;
  params: P;
  enabled?: boolean;
}

export function usePaginatedQuery<T, P extends Record<string, unknown>>({
  queryKey,
  path,
  params,
  enabled = true,
}: UsePaginatedQueryOptions<T, P>) {
  return useQuery<PaginatedResponse<T>>({
    queryKey: [queryKey, params],
    queryFn: () => fetchPaginated<T, P>(path, params),
    placeholderData: keepPreviousData,
    enabled,
  });
}
```

### 7.3 Müştərilər səhifəsi nümunəsi

```typescript
// src/features/customers/use-customers.ts
import { usePaginatedQuery } from '@/hooks/use-paginated-query';
import type { Customer, ListCustomersParams } from '@/types/api';

export function useCustomers(params: ListCustomersParams) {
  return usePaginatedQuery<Customer, ListCustomersParams>({
    queryKey: 'customers',
    path: '/customers',
    params,
  });
}
```

```tsx
// src/features/customers/CustomersPage.tsx
import { useState } from 'react';
import { useCustomers } from './use-customers';

export function CustomersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, isFetching } = useCustomers({
    page,
    limit: 20,
    search: search || undefined,
  });

  if (isLoading) return <div>Yüklənir...</div>;

  return (
    <div>
      <input
        placeholder="Ad, soyad və ya telefon..."
        value={search}
        onChange={(e) => {
          setSearch(e.target.value);
          setPage(1); // axtarış dəyişəndə 1-ci səhifəyə qayıt
        }}
      />

      <table>
        <thead>
          <tr>
            <th>Ad Soyad</th>
            <th>Telefon</th>
            <th>Filial</th>
          </tr>
        </thead>
        <tbody>
          {data?.data.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.firstName} {customer.lastName}</td>
              <td>{customer.phone ?? '—'}</td>
              <td>{customer.branchName ?? '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {data && (
        <Pagination
          page={data.meta.page}
          totalPages={data.meta.totalPages}
          total={data.meta.total}
          loading={isFetching}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
```

### 7.4 Pagination komponenti

```tsx
// src/components/Pagination.tsx
interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

export function Pagination({
  page,
  totalPages,
  total,
  loading,
  onPageChange,
}: PaginationProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        disabled={page <= 1 || loading}
        onClick={() => onPageChange(page - 1)}
      >
        ← Əvvəlki
      </button>

      <span>
        Səhifə {page} / {totalPages} (cəmi {total})
      </span>

      <button
        disabled={page >= totalPages || loading}
        onClick={() => onPageChange(page + 1)}
      >
        Növbəti →
      </button>
    </div>
  );
}
```

---

## 8. Endpoint referansı (list GET)

| Endpoint | Filtrlər | Qeyd |
|----------|----------|------|
| `GET /customers` | `branchId`, `gender`, `zoneId`, `search`, `page`, `limit` | `search` — ad/soyad/telefon |
| `GET /devices` | `branchId`, `page`, `limit` | |
| `GET /zones` | `deviceId`, `page`, `limit` | |
| `GET /packages` | `page`, `limit` | `zones[]` enrichment |
| `GET /campaigns` | `page`, `limit` | |
| `GET /campaigns/active` | `page`, `limit` | Bugünkü aktiv kampaniyalar |
| `GET /procedures` | `customerId`, `deviceId`, `zoneNames[]`, `zoneIds[]`, `branchId`, `packageId`, `visitNumber`, `declaredShotCount`, `actualShotCount`, `difference`, `dateFrom`, `dateTo`, `minPrice`, `maxPrice`, `page`, `limit` | `zoneNames`/`zoneIds` OR məntiqi; məbləğ və tarix range |
| `GET /notes` | `customerId` *(mütləq)*, `page`, `limit` | |
| `GET /follow-ups` | `customerId` *(mütləq)*, `page`, `limit` | |
| `GET /follow-ups/upcoming` | `days` (default 7), `page`, `limit` | |
| `GET /notifications` | `isRead`, `type`, `page`, `limit` | |
| `GET /notifications/birthdays/today` | `page`, `limit` | |
| `GET /procedures/fraud-report` | `deviceId`, `branchId`, `page`, `limit` | |
| `GET /branches` | `page`, `limit` | |
| `GET /auth/staff` | `page`, `limit` | Yalnız `admin` |

### Prosedur filtrləri

```http
GET /procedures?zoneIds=<uuid1>&zoneIds=<uuid2>&page=1&limit=20
```

Zona adları ilə (köhnə API):

```http
GET /procedures?zoneNames=Üz&zoneNames=Qol
```

Digər nümunələr:

```http
GET /procedures?branchId=<uuid>&packageId=<uuid>&visitNumber=3
GET /procedures?declaredShotCount=100&actualShotCount=120&difference=20
GET /procedures?dateFrom=2026-01-01&dateTo=2026-01-31&minPrice=50&maxPrice=200
```

| Parametr | Tip | Təsvir |
|----------|-----|--------|
| `zoneIds` | `uuid[]` | Zona ID — OR məntiqi |
| `zoneNames` | `string[]` | Zona adı — OR məntiqi |
| `branchId` | `uuid` | Filial (müştəri filialı) |
| `packageId` | `uuid` | Paket |
| `visitNumber` | `int` | Vizit nömrəsi |
| `declaredShotCount` | `int` | Bəyan edilən atış |
| `actualShotCount` | `int` | Faktiki atış |
| `difference` | `int` | `actual - declared` |
| `dateFrom` / `dateTo` | `date` | Tarix aralığı |
| `minPrice` / `maxPrice` | `number` | Məbləğ aralığı |
---

## 9. Səhifə → API xəritəsi (tövsiyə olunan struktur)

| Frontend səhifə | API | State |
|-----------------|-----|-------|
| Login | `POST /auth/login` | token-ləri saxla |
| Dashboard | `GET /dashboard/summary` | aggregate statistika |
| Müştərilər | `GET /customers` | `page`, `limit`, `search`, filtrlər |
| Müştəri detall | `GET /customers/:id`, `GET /procedures?customerId=`, `GET /notes?customerId=` | |
| Prosedurlar | `GET /procedures` | zona, filial, paket, vizit, atış, fərq, tarix, məbləğ filtrləri |
| Cihazlar / Zonalar | `GET /devices`, `GET /zones?deviceId=` | cascade select |
| Paketlər / Kampaniyalar | `GET /packages`, `GET /campaigns` | form-da `zoneIds`, list-də `zones` |
| Bildirişlər | `GET /notifications` | `isRead` tab filter |
| Staff (admin) | `GET /auth/staff` | CRUD + pagination |
| Fraud | `GET /procedures/fraud-report` | |

---

## 10. Xəta idarəetməsi

Backend standart NestJS formatında xəta qaytarır:

```json
{
  "statusCode": 401,
  "message": "Unauthorized",
  "error": "Unauthorized"
}
```

```typescript
// src/lib/get-error-message.ts
import { isAxiosError } from 'axios';

export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    const msg = error.response?.data?.message;
    if (typeof msg === 'string') return msg;
    if (Array.isArray(msg)) return msg.join(', ');
  }
  return 'Gözlənilməz xəta baş verdi';
}
```

| Status | Frontend reaksiyası |
|--------|---------------------|
| `401` | Refresh token cəhd et → uğursuzdursa login-ə yönləndir |
| `403` | "Bu əməliyyat üçün icazəniz yoxdur" |
| `404` | "Məlumat tapılmadı" |
| `422` | Validation xətalarını form field-lərinə map et |
| `500` | Ümumi xəta mesajı + retry |

---

## 11. Köhnə formatdan miqrasiya

Əgər frontend əvvəl list endpoint-lərdən birbaşa array gözləyirdisə:

```typescript
// ❌ Köhnə
const customers: Customer[] = response.data;

// ✅ Yeni
const customers: Customer[] = response.data.data;
const { total, page, totalPages } = response.data.meta;
```

**React Query cache key-ləri** filtr və pagination parametrlərini daxil etməlidir:

```typescript
queryKey: ['customers', { page, limit, search, branchId }]
```

---

## 12. Best practices checklist

- [ ] Token-ləri `localStorage` və ya `httpOnly cookie` (təhlükəsizlik tələbinə görə) saxla
- [ ] 401 interceptor ilə avtomatik refresh et
- [ ] List endpoint-lərdə **həmişə** `data` + `meta` oxu
- [ ] UI-da adlar üçün `*Name` və `zones[].name` istifadə et — əlavə lookup API çağırışı etmə
- [ ] Filtr/axtarış dəyişəndə `page`-i `1`-ə reset et
- [ ] `keepPreviousData` ilə səhifə dəyişəndə flicker azalt
- [ ] `limit=100` max — daha böyük səhifə istəmə
- [ ] `customerId` tələb olunan endpoint-lərdə (`/notes`, `/follow-ups`) ID olmadan sorğu göndərmə
- [ ] Admin-only UI elementlərini `role === 'admin'`-ə görə gizlət (backend yenə də yoxlayır)
- [ ] Swagger-dan canlı contract yoxla: `/api`

---

## 13. Tez test (curl)

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lazer.az","password":"your-password"}'

# Paginated customers
curl "http://localhost:3000/customers?page=1&limit=5&search=nulifer" \
  -H "Authorization: Bearer <token>"

# Procedures by zone names
curl "http://localhost:3000/procedures?zoneNames=Üz&zoneNames=Qol&page=1&limit=10" \
  -H "Authorization: Bearer <token>"
```

---

*Son yeniləmə: pagination, name enrichment və bütün list GET endpoint-ləri nəzərə alınmaqla hazırlanıb.*

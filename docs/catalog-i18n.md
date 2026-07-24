# Katalog i18n — Frontend Integration Guide

Bu sənəd frontend komandası üçündür.  
Katalog entity-lərinin (Branch, Zone, Device, Package, Campaign) çoxdilli (`az` / `en` / `ru`) istifadəsini izah edir.

---

## 1. Ümumi ideya

Backend artıq sabit `name` sütunu ilə işləmir.  
Hər katalog entity-nin adı (və lazım olan digər mətnlər) **3 dildə** saxlanılır.

Frontend-in 2 vəzifəsi var:

1. **Oxuma:** hər request-də `Accept-Language` göndərmək → UI-də aktiv dilə uyğun `name` / `type` / `description` gəlir.
2. **Yazma (create/update):** edit formalarında 3 dili birlikdə `translations` massivi ilə göndərmək.

| Dil kodu | Dil |
|---|---|
| `az` | Azərbaycan (default) |
| `en` | English |
| `ru` | Русский |

---

## 2. Dil seçimi (`Accept-Language`)

### 2.1. Header

Hər API çağırışında (GET/POST/PATCH/DELETE) göndərin:

```http
Accept-Language: en
Authorization: Bearer <access_token>
```

Qəbul olunan dəyərlər: `az` | `en` | `ru`

### 2.2. Default

- Header göndərilməsə → backend **`az`** istifadə edir
- `en-US`, `ru-RU` kimi dəyərlər gəlsə → əsas tag götürülür (`en`, `ru`)
- Naməlum dil → fallback **`az`**

### 2.3. Axios interceptor nümunəsi

```ts
import axios from 'axios';

export type AppLocale = 'az' | 'en' | 'ru';

let currentLocale: AppLocale = 'az';

export function setAppLocale(locale: AppLocale) {
  currentLocale = locale;
  // i18n.changeLanguage(locale) və s.
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${getAccessToken()}`;
  config.headers['Accept-Language'] = currentLocale;
  return config;
});
```

### 2.4. Fetch nümunəsi

```ts
await fetch(`${API_URL}/zones`, {
  headers: {
    Authorization: `Bearer ${token}`,
    'Accept-Language': 'ru',
  },
});
```

### 2.5. Dil dəyişəndə nə etməli?

1. App state-də locale-i yenilə (`setAppLocale('en')`)
2. Katalog listlərini / detail-ləri **yenidən fetch** et  
   (backend cari request-in header-inə görə cavab verir; köhnə cache-dəki `name` köhnə dildə qala bilər)

---

## 3. Response qaydaları (çox vacib)

| Endpoint tipi | Lokalizə olunmuş field | `translations` |
|---|---|---|
| **List** (`GET /zones`, `GET /branches`, …) | Var (`name` / `type`) | **Yoxdur** |
| **Detail** (`GET /:id`) | Var | **Var** (3 dil) |
| **Create / Update** response | Var | **Var** (3 dil) |

### List UI üçün

Sadəcə `name` (və ya device üçün `type`) göstərin:

```tsx
zones.map((z) => <option key={z.id}>{z.name}</option>)
```

### Edit forması üçün

Mütləq `GET /:id` çağırın və `translations` ilə formu doldurun.  
List response-da `translations` gəlməyəcək.

---

## 4. TypeScript tipləri

```ts
export type Locale = 'az' | 'en' | 'ru';

export interface NameTranslation {
  locale: Locale;
  name: string;
}

export interface BranchTranslation {
  locale: Locale;
  name: string;
  address?: string | null;
}

export interface DeviceTranslation {
  locale: Locale;
  type: string;
}

export interface CampaignTranslation {
  locale: Locale;
  name: string;
  description?: string | null;
}

export interface NamedEntity {
  id: string;
  name: string; // Accept-Language-ə uyğun
}
```

---

## 5. Entity-lər və endpoint-lər

### 5.1. Branch (`/branches`)

**Çoxdilli field-lər:** `name`, `address`

#### List — `GET /branches`

```json
[
  {
    "id": "...",
    "name": "Nizami",
    "address": "Bakı",
    "createdAt": "2026-07-17T10:00:00.000Z"
  }
]
```

#### Detail — `GET /branches/:id`

```json
{
  "id": "...",
  "name": "Nizami",
  "address": "Baku",
  "createdAt": "2026-07-17T10:00:00.000Z",
  "translations": [
    { "locale": "az", "name": "Nizami", "address": "Bakı" },
    { "locale": "en", "name": "Nizami", "address": "Baku" },
    { "locale": "ru", "name": "Низами", "address": "Баку" }
  ]
}
```

#### Create — `POST /branches` (admin)

```json
{
  "translations": [
    { "locale": "az", "name": "Nizami", "address": "Bakı" },
    { "locale": "en", "name": "Nizami", "address": "Baku" },
    { "locale": "ru", "name": "Низами", "address": "Баку" }
  ]
}
```

#### Update — `PATCH /branches/:id` (admin)

```json
{
  "translations": [
    { "locale": "az", "name": "Nizami filialı", "address": "Bakı" },
    { "locale": "en", "name": "Nizami branch", "address": "Baku" },
    { "locale": "ru", "name": "Филиал Низами", "address": "Баку" }
  ]
}
```

`address` optional-dır (null ola bilər).

---

### 5.2. Zone (`/zones`)

**Çoxdilli field:** `name`  
Digər field-lər: `deviceId`, `price`, `deviceName` (relation — aktiv dilə uyğun)

#### Create — `POST /zones`

```json
{
  "deviceId": "uuid",
  "price": 25,
  "translations": [
    { "locale": "az", "name": "Qoltuqaltı" },
    { "locale": "en", "name": "Underarm" },
    { "locale": "ru", "name": "Подмышки" }
  ]
}
```

#### Update — `PATCH /zones/:id`

```json
{
  "price": 30,
  "translations": [
    { "locale": "az", "name": "Qoltuqaltı" },
    { "locale": "en", "name": "Underarm" },
    { "locale": "ru", "name": "Подмышки" }
  ]
}
```

`translations` update-də optional-dır. Göndərilərsə **3 dil də** olmalıdır.

#### List item nümunəsi

```json
{
  "id": "...",
  "name": "Underarm",
  "deviceId": "...",
  "deviceName": "Alexandrite",
  "price": 25,
  "createdAt": "..."
}
```

(`Accept-Language: en` olduqda)

---

### 5.3. Device (`/devices`)

**Çoxdilli field:** `type` (diqqət: `name` yox, `type`)

#### Create — `POST /devices`

```json
{
  "branchId": "uuid",
  "shotCounter": 0,
  "translations": [
    { "locale": "az", "type": "Aleksandrit" },
    { "locale": "en", "type": "Alexandrite" },
    { "locale": "ru", "type": "Александрит" }
  ]
}
```

#### List item

```json
{
  "id": "...",
  "branchId": "...",
  "branchName": "Nizami",
  "type": "Alexandrite",
  "shotCounter": 1200,
  "createdAt": "..."
}
```

#### Detail — `translations` daxil

```json
{
  "id": "...",
  "branchId": "...",
  "branchName": "Nizami",
  "type": "Alexandrite",
  "shotCounter": 1200,
  "createdAt": "...",
  "translations": [
    { "locale": "az", "type": "Aleksandrit" },
    { "locale": "en", "type": "Alexandrite" },
    { "locale": "ru", "type": "Александрит" }
  ]
}
```

UI-də cihaz adı kimi həmişə `type` göstərin.

---

### 5.4. Package (`/packages`)

**Çoxdilli field:** `name`  
`zones[].name` də aktiv dilə uyğun gəlir.

#### Create — `POST /packages`

```json
{
  "price": 100,
  "zoneIds": ["uuid-1", "uuid-2"],
  "translations": [
    { "locale": "az", "name": "Tam paket" },
    { "locale": "en", "name": "Full package" },
    { "locale": "ru", "name": "Полный пакет" }
  ]
}
```

#### List / Detail

```json
{
  "id": "...",
  "name": "Full package",
  "price": 100,
  "zoneIds": ["...", "..."],
  "zones": [
    { "id": "...", "name": "Underarm" },
    { "id": "...", "name": "Legs" }
  ],
  "createdAt": "...",
  "translations": [
    { "locale": "az", "name": "Tam paket" },
    { "locale": "en", "name": "Full package" },
    { "locale": "ru", "name": "Полный пакет" }
  ]
}
```

(`translations` yalnız detail/create/update cavabında)

---

### 5.5. Campaign (`/campaigns`)

**Çoxdilli field-lər:** `name`, `description`

#### Create — `POST /campaigns`

```json
{
  "discountType": "percentage",
  "discountValue": 20,
  "startDate": "2026-07-01",
  "endDate": "2026-08-31",
  "zoneIds": ["uuid"],
  "translations": [
    {
      "locale": "az",
      "name": "Yay endirimi",
      "description": "Bütün nahiyələrə 20%"
    },
    {
      "locale": "en",
      "name": "Summer sale",
      "description": "20% off all zones"
    },
    {
      "locale": "ru",
      "name": "Летняя скидка",
      "description": "20% на все зоны"
    }
  ]
}
```

`description` optional-dır.

---

## 6. Create / Update validation qaydaları

Backend bunları yoxlayır:

| Qayda | Nəticə |
|---|---|
| Create-də `translations` yoxdur | `400` |
| `az` / `en` / `ru`-dan biri çatışmır | `400` |
| Eyni `locale` 2 dəfə | `400` |
| `name` / `type` boşdur | `400` |
| Update-də `translations` göndərilməyib | OK (digər field-lər yenilənə bilər) |
| Update-də `translations` göndərilib | Yenə hər 3 dil məcburidir |

### Frontend validation tövsiyəsi

Submit-dən əvvəl:

```ts
const REQUIRED: Locale[] = ['az', 'en', 'ru'];

function validateNameTranslations(items: NameTranslation[]) {
  const locales = items.map((i) => i.locale);
  const unique = new Set(locales);

  if (unique.size !== locales.length) {
    throw new Error('Təkrarlanan locale var');
  }

  for (const locale of REQUIRED) {
    if (!unique.has(locale)) {
      throw new Error(`Çatışmayan dil: ${locale}`);
    }
  }

  for (const item of items) {
    if (!item.name?.trim()) {
      throw new Error(`${item.locale} adı boş ola bilməz`);
    }
  }
}
```

---

## 7. Edit form pattern (tövsiyə)

### 7.1. Form state

```ts
type ZoneFormState = {
  deviceId: string;
  price: number;
  translations: {
    az: string;
    en: string;
    ru: string;
  };
};
```

### 7.2. Detail-dən formu doldur

```ts
async function loadZoneForEdit(id: string) {
  const { data } = await api.get(`/zones/${id}`);
  // data.translations gəlir

  const byLocale = Object.fromEntries(
    data.translations.map((t: NameTranslation) => [t.locale, t.name]),
  );

  return {
    deviceId: data.deviceId,
    price: data.price,
    translations: {
      az: byLocale.az ?? '',
      en: byLocale.en ?? '',
      ru: byLocale.ru ?? '',
    },
  };
}
```

### 7.3. Submit payload

```ts
function toTranslationsPayload(form: ZoneFormState): NameTranslation[] {
  return [
    { locale: 'az', name: form.translations.az.trim() },
    { locale: 'en', name: form.translations.en.trim() },
    { locale: 'ru', name: form.translations.ru.trim() },
  ];
}

await api.post('/zones', {
  deviceId: form.deviceId,
  price: form.price,
  translations: toTranslationsPayload(form),
});
```

### 7.4. UI layout ideyası

Edit səhifəsində 3 tab və ya 3 input qrupu:

- Azərbaycan adı
- English name
- Русское название

List səhifəsində isə yalnız aktiv dilin `name`-i.

---

## 8. Relation field-lər (avtomatik lokalizə)

Bu field-lər də `Accept-Language`-ə uyğun gəlir — frontend əlavə çevirmə etmir:

| Field | Harada |
|---|---|
| `branchName` | Customer, Device, Fraud, Birthday, Dashboard… |
| `deviceName` | Zone, Procedure, Fraud… |
| `packageName` | Procedure |
| `zoneName` / `freeZoneName` | Follow-up, Procedure |
| `zones[].name` | Package, Campaign, Procedure |

Nümunə (Procedure list, `Accept-Language: ru`):

```json
{
  "packageName": "Полный пакет",
  "zones": [
    { "id": "...", "name": "Подмышки" }
  ]
}
```

---

## 9. Hansı yerlərdə i18n YOXDUR (hələlik)

Bu mərhələdə **tərcümə olunmur**:

- Customer ad/soyad (PII)
- Note `content` / `outcome` (free text)
- Notification `message` (hardcode AZ mesajlar — sonrakı mərhələ)
- Dashboard problem `message` mətnləri
- Enum label-lər (`pending`, `fraud`, `female` və s.) — UI özü map edə bilər

---

## 10. React hook nümunəsi

```ts
import { useCallback, useEffect, useState } from 'react';
import { api, AppLocale, setAppLocale } from './api';

export function useZones(locale: AppLocale) {
  const [zones, setZones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setAppLocale(locale);
      const { data } = await api.get('/zones');
      setZones(data);
    } finally {
      setLoading(false);
    }
  }, [locale]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { zones, loading, reload };
}
```

---

## 11. Tez-tez edilən səhvlər

1. **Edit formunu list data-sı ilə doldurmaq**  
   List-də `translations` yoxdur → mütləq `GET /:id`.

2. **Yalnız aktiv dili göndərmək**  
   Create/Update-də 3 dil məcburidir.

3. **Device üçün `name` axtarmaq**  
   Device-də field `type`-dır.

4. **Dil dəyişəndə refetch etməmək**  
   Köhnə `name`-lər ekranda qalır.

5. **Köhnə API kontraktı**  
   Artıq `POST /zones { "name": "..." }` işləmir.  
   `translations` massivi lazımdır.

6. **`Accept-Language` yalnız bəzi request-lərdə**  
   Interceptor ilə **bütün** request-lərə qoyun.

---

## 12. QA checklist

- [ ] Login sonrası default dil `az` ilə list düzgün gəlir
- [ ] Dil `en` / `ru` edəndə list `name`/`type` dəyişir
- [ ] `GET /zones/:id` → `translations` 3 elementlidir
- [ ] Create zone/package/branch/device/campaign 3 dillə uğurlu olur
- [ ] 1 dil çatışanda `400` qayıdır
- [ ] Procedure/Package-də `zones[].name` aktiv dilə uyğundur
- [ ] Edit forması detail-dən dolur, submit 3 dili göndərir
- [ ] Update-də yalnız `price` göndərmək mümkündür (`translations` olmadan)

---

## 13. Endpoint xülasəsi

| Modul | List | Detail | Create | Update |
|---|---|---|---|---|
| Branches | `GET /branches` | `GET /branches/:id` | `POST /branches` | `PATCH /branches/:id` |
| Zones | `GET /zones` | `GET /zones/:id` | `POST /zones` | `PATCH /zones/:id` |
| Devices | `GET /devices` | `GET /devices/:id` | `POST /devices` | `PATCH /devices/:id` |
| Packages | `GET /packages` | `GET /packages/:id` | `POST /packages` | `PATCH /packages/:id` |
| Campaigns | `GET /campaigns` | `GET /campaigns/:id` | `POST /campaigns` | `PATCH /campaigns/:id` |

Auth: bütün endpoint-lər Bearer JWT tələb edir.  
Create/Update adətən **admin** roluna bağlıdır.

---

## 14. Qısa “golden path”

1. App-də locale seç (`az` / `en` / `ru`)
2. Axios interceptor `Accept-Language` yazır
3. List səhifələri `name` / `type` göstərir
4. Edit səhifəsi `GET /:id` + `translations` ilə formu doldurur
5. Save zamanı 3 dilli `translations` göndərir
6. Dil dəyişəndə katalog data-nı refetch edir

---

## 15. Notifications i18n

Bildiriş mesajları da 3 dildə saxlanır (`az` / `en` / `ru`).

| Endpoint / kanal | `message` | `translations` |
|---|---|---|
| `GET /notifications` | `Accept-Language`-ə uyğun | həmişə 3 dil |
| `PATCH /notifications/:id/read` | `Accept-Language`-ə uyğun | həmişə 3 dil |
| WS `notification.created` | default `az` | UI dilini buradan seç |

Mövcud notificationlar migration zamanı yalnız `az` alır; `en`/`ru` yoxdursa fallback `az`-dır. Yeni yaradılanlar (fraud / birthday / follow_up) hər 3 dildə yazılır.

Frontend:

```ts
// REST
headers: { 'Accept-Language': currentLocale }

// WS
const text =
  notification.translations.find((t) => t.locale === currentLocale)?.message
  ?? notification.message;
```

Bu qədər — frontend bu sənədlə katalog i18n-i tam inteqrasiya edə bilər.

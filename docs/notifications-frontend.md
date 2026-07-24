# Notifications — Frontend İnteqrasiya

Bu sənəd bildirişlərin (**REST + WebSocket + i18n + pagination**) frontend-də ideal inteqrasiyasını izah edir.

Əlaqəli sənədlər:

- Ümumi API: [`FRONTEND_API_GUIDE.md`](./FRONTEND_API_GUIDE.md)
- Socket detalları: [`notifications-websocket.md`](./notifications-websocket.md)
- Dil header: [`catalog-i18n.md`](./catalog-i18n.md)

---

## 1. Özet — nəyi necə göstərmək

| Mənbə | Nə üçün | Dil |
|---|---|---|
| `GET /notifications` | history / panel / badge | `Accept-Language` → hazır `message` |
| `notification.created` (WS) | realtime toast + list prepend | `translations`-dan seç |
| `PATCH /notifications/:id/read` | oxundu işarəsi | — |

**Qızıl qayda:** notification mətnini frontend-də tərcümə etmə. Backend artıq 3 dildə verir. UI-də yalnız `type` label-ləri (Fraud / Birthday / Follow-up) app dictionary-də saxla.

---

## 2. Auth + dil header

Hər REST request:

```http
Authorization: Bearer <accessToken>
Accept-Language: az   # və ya en | ru
```

Axios interceptor nümunəsi:

```ts
api.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${getAccessToken()}`;
  config.headers['Accept-Language'] = getAppLocale(); // 'az' | 'en' | 'ru'
  return config;
});
```

Default dil: `az`.

---

## 3. Types

```ts
type Locale = 'az' | 'en' | 'ru';
type NotificationType = 'fraud' | 'follow_up' | 'birthday';

interface NotificationTranslation {
  locale: Locale;
  message: string;
}

interface NotificationDto {
  id: string;
  type: NotificationType;
  customerId: string | null;
  customerName: string | null;
  procedureId: string | null; // əsasən fraud
  message: string;            // REST: aktiv dil; WS: adətən az
  translations: NotificationTranslation[];
  isRead: boolean;
  createdAt: string;          // ISO
}

interface PaginatedNotifications {
  data: NotificationDto[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
```

---

## 4. REST endpoint-lər

### 4.1 Siyahı

```http
GET /notifications?page=1&limit=20&isRead=false&type=fraud
```

| Query | Tip | Default | Qeyd |
|---|---|---|---|
| `page` | number | `1` | min 1 |
| `limit` | number | `20` | max 100 |
| `isRead` | boolean | — | `true` / `false` (string `"false"` düzgün işləyir) |
| `type` | enum | — | `fraud` \| `follow_up` \| `birthday` |

**Cavab:**

```json
{
  "data": [
    {
      "id": "09becffe-8fe0-4a7a-aec9-279a26cad711",
      "type": "fraud",
      "customerId": "aa10de1f-bdb5-4137-b36a-540ae33dd015",
      "customerName": "Vahid Hesenzade",
      "procedureId": "818d0d68-cf32-4e72-bdcb-2c975565491c",
      "message": "Actual shot count exceeds declared count by 1000",
      "translations": [
        {
          "locale": "az",
          "message": "Faktiki atış sayı bəyan edilən sayı 1000 vahid üstələyir"
        },
        {
          "locale": "en",
          "message": "Actual shot count exceeds declared count by 1000"
        },
        {
          "locale": "ru",
          "message": "Фактическое число выстрелов превышает заявленное на 1000"
        }
      ],
      "isRead": false,
      "createdAt": "2026-07-14T11:20:00.000Z"
    }
  ],
  "meta": {
    "total": 42,
    "page": 1,
    "limit": 20,
    "totalPages": 3
  }
}
```

`Accept-Language: en` olduqda yuxarıdakı kimi `message` ingiliscə gəlir. List UI-də birbaşa `item.message` göstər.

### 4.2 Oxunmuş kimi işarələ

```http
PATCH /notifications/:id/read
```

Cavab: tək `NotificationDto` (yenə `message` + `translations`).

### 4.3 Realtime info (opsional)

```http
GET /notifications/realtime
```

Socket URL / event adlarını backend-dən oxumaq üçündür. Hardcode də olar.

---

## 5. Mesajı necə seçmək (ideal helper)

```ts
function getNotificationText(
  n: NotificationDto,
  locale: Locale,
  source: 'rest' | 'ws' = 'rest',
): string {
  // REST: message artıq Accept-Language-ə uyğundur
  if (source === 'rest') {
    return n.message;
  }

  // WS: Accept-Language yoxdur — translations-dan seç
  return (
    n.translations.find((t) => t.locale === locale)?.message ??
    n.translations.find((t) => t.locale === 'az')?.message ??
    n.message
  );
}
```

Dil dəyişəndə store-dakı notification-lar üçün refetch **məcburi deyil** — `translations`-dan yenidən seç:

```ts
function remapMessages(items: NotificationDto[], locale: Locale) {
  return items.map((n) => ({
    ...n,
    message: getNotificationText(n, locale, 'ws'),
  }));
}
```

Köhnə (migration öncəsi) bildirişlərdə yalnız `az` ola bilər — fallback avtomatik `az`-a düşür.

---

## 6. WebSocket (realtime)

| Məlumat | Dəyər |
|---|---|
| Protocol | Socket.IO (`socket.io-client`) |
| Namespace | `/notifications` |
| Path | `/socket.io` |
| Auth | `auth: { token: accessToken }` |
| Event | `notification.created` |

```ts
import { io, Socket } from 'socket.io-client';

const socket: Socket = io(`${API_BASE_URL}/notifications`, {
  path: '/socket.io',
  auth: { token: accessToken },
  transports: ['websocket'],
});

socket.on('connected', (data) => {
  // { ok, userId, role, branchId }
});

socket.on('notification.created', (notification: NotificationDto) => {
  // list prepend + toast
});

socket.on('exception', (err) => {
  // auth xətası
});
```

**Vacib:** native `WebSocket` istifadə etməyin — yalnız `socket.io-client`.

Server scope:

| Rol | Nə alır |
|---|---|
| `admin` | bütün filiallar |
| `branch_staff` | yalnız öz filialı |

Frontend-də əlavə role filter lazım deyil.

Token refresh olanda: `disconnect` → yeni tokenlə yenidən `connect`.  
Logout: `socket.disconnect()`.

Daha ətraflı: [`notifications-websocket.md`](./notifications-websocket.md).

---

## 7. Ideal UI axını

```
Login
  → JWT saxla
  → Accept-Language interceptor
  → GET /notifications?isRead=false&page=1&limit=20
  → Socket connect
  → Badge = oxunmamış sayı

Yeni event (WS)
  → translations-dan locale text
  → toast göstər
  → list başına əlavə et (duplicate id yoxla)
  → badge++

Notification aç / click
  → PATCH /notifications/:id/read
  → local isRead = true
  → badge--

Dil dəyiş
  → interceptor locale yenilə
  → store-dakı list-i remapMessages ilə yenilə
  → (opsional) növbəti REST fetch yeni dildə gələcək

Logout
  → socket.disconnect()
  → state clear
```

### 7.1 List sətiri (tövsiyə)

| UI elementi | Field |
|---|---|
| Əsas mətn | `message` (və ya helper) |
| İkon / rəng | `type` |
| Alt sətir | `customerName` |
| Vaxt | `createdAt` (relative: “5 dəq əvvəl”) |
| Oxunmayıb | `!isRead` → bold / dot |
| Click → müştəri | `customerId` |
| Click → prosedur (fraud) | `procedureId` |

### 7.2 Type label (app i18n)

Bu label-lər backend-dən gəlmir — UI dictionary:

```ts
const TYPE_LABELS = {
  az: {
    fraud: 'Fraud',
    follow_up: 'Planlaşdırılmış vizit',
    birthday: 'Ad günü',
  },
  en: {
    fraud: 'Fraud',
    follow_up: 'Follow-up',
    birthday: 'Birthday',
  },
  ru: {
    fraud: 'Мошенничество',
    follow_up: 'Запланированный визит',
    birthday: 'День рождения',
  },
} as const;
```

### 7.3 Badge

Ən sadə:

1. İlk load: `GET /notifications?isRead=false&page=1&limit=1` → `meta.total`
2. və ya list `data`-dan local count saxla
3. WS create → +1; mark read → -1

---

## 8. React nümunələri

### 8.1 Fetch list

```ts
async function fetchNotifications(params: {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: NotificationType;
}): Promise<PaginatedNotifications> {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.limit) q.set('limit', String(params.limit));
  if (params.isRead !== undefined) q.set('isRead', String(params.isRead));
  if (params.type) q.set('type', params.type);

  const { data } = await api.get<PaginatedNotifications>(
    `/notifications?${q.toString()}`,
  );
  return data;
}
```

### 8.2 Mark as read

```ts
async function markNotificationRead(id: string): Promise<NotificationDto> {
  const { data } = await api.patch<NotificationDto>(`/notifications/${id}/read`);
  return data;
}
```

### 8.3 Socket hook

```ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useNotificationSocket(
  accessToken: string | null,
  onCreated: (n: NotificationDto) => void,
) {
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!accessToken) return;

    const socket = io(`${import.meta.env.VITE_API_URL}/notifications`, {
      path: '/socket.io',
      auth: { token: accessToken },
      transports: ['websocket'],
    });

    socketRef.current = socket;
    socket.on('notification.created', onCreated);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, onCreated]);
}
```

### 8.4 WS handler (store)

```ts
function handleCreated(n: NotificationDto, locale: Locale) {
  const text = getNotificationText(n, locale, 'ws');

  store.prependNotification({ ...n, message: text });
  store.incrementUnread();
  toast.info(text);
}
```

---

## 9. Tez-tez edilən səhvlər

1. **WS-də `message`-ə kor-koranə güvənmək** — WS-də default `az` ola bilər; `translations` istifadə et.
2. **Native WebSocket** — işləməz; `socket.io-client` lazımdır.
3. **`isRead=false` string-ini səhv parse etmək** — backend düzgün qəbul edir; query-yə `false` yazın.
4. **Notification text-i frontend dictionary-də saxlamaq** — etməyin; dinamik parametrlər (ad, tarix, fərq) backend-dədir.
5. **Duplicate WS + refetch** — prepend edəndə `id` ilə dedupe edin.
6. **Dil dəyişəndə yalnız REST refetch** — store-da `translations` varsa remap kifayətdir.
7. **Role filter UI-də** — server artıq filial scope edir.

---

## 10. Checklist (QA)

- [ ] Interceptor `Authorization` + `Accept-Language` göndərir
- [ ] `GET /notifications` → `{ data, meta }` formatındadır
- [ ] `Accept-Language: en` → `message` ingiliscədir
- [ ] Cavabda `translations` 3 dil gəlir (yeni bildirişlərdə)
- [ ] `isRead=false` filter düzgün işləyir
- [ ] Socket `connected` gəlir
- [ ] Yeni fraud/birthday/follow_up → `notification.created`
- [ ] WS toast aktiv dildədir (`translations`)
- [ ] `PATCH .../read` sonrası badge azalır
- [ ] Fraud-da `procedureId` ayrı field-dir
- [ ] Logout-da socket disconnect olur

---

## 11. Qısa “golden path”

1. App locale seç → interceptor `Accept-Language` yazır  
2. Panel aç → paginated REST list, UI-də `message` göstər  
3. Socket dinlə → `translations` + toast + prepend  
4. Click → mark read  
5. Dil dəyiş → `remapMessages` (və ya növbəti fetch)

Bu qədər — frontend notifications modulunu bu sənədlə tam inteqrasiya edə bilər.

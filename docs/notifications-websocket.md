# Notification WebSocket (Frontend Integration)

Bu sənəd frontend komandası üçün hazırdır.  
Real-time bildirişlər **Socket.IO** üzərindən gəlir. Swagger-da adi `ws://` REST endpoint görməyəcəksiniz — bu normaldır.

---

## 1. Özet

| Məlumat | Dəyər |
|---|---|
| Protocol | Socket.IO |
| Namespace | `/notifications` |
| Engine path | `/socket.io` |
| Auth | JWT access token (`auth.token`) |
| Event (server → client) | `notification.created` |
| Connection OK event | `connected` |
| Auth error event | `exception` |
| Optional ping | client `ping` → server `pong` |

Yalnız **notification yaradılanda** push gedir (`fraud`, `follow_up`, `birthday`).

History üçün REST qalır:

- `GET /notifications`
- `GET /notifications?isRead=false`
- `GET /notifications?type=fraud`
- `PATCH /notifications/:id/read`

Realtime connection info:

- `GET /notifications/realtime`

---

## 2. Bağlantı (mütləq bu şəkildə)

### Package

```bash
npm install socket.io-client
```

### Connect

```ts
import { io, Socket } from 'socket.io-client';

const API_BASE_URL = 'http://localhost:3000'; // prod URL ilə dəyişin
const accessToken = '...'; // eyni JWT ki REST-də Authorization-da istifadə olunur

const socket: Socket = io(`${API_BASE_URL}/notifications`, {
  path: '/socket.io',
  auth: {
    token: accessToken,
    // və ya: token: `Bearer ${accessToken}`
  },
  transports: ['websocket'],
  autoConnect: true,
  reconnection: true,
});
```

### Token harada göndərilir?

REST kimi header yox, Socket.IO `auth` obyektində:

```ts
auth: {
  token: accessToken
}
```

Alternativlər (backup):

```ts
// query
query: { token: accessToken }

// header (browser-də həmişə işləməyə bilər)
extraHeaders: {
  Authorization: `Bearer ${accessToken}`
}
```

Frontend üçün **tövsiyə olunan yol: `auth.token`**.

---

## 3. Event-lər

### 3.1. Uğurlu bağlantı

```ts
socket.on('connected', (data) => {
  // data: { ok: true, userId, role, branchId }
  console.log('WS connected', data);
});
```

### 3.2. Yeni notification (əsas event)

```ts
socket.on('notification.created', (notification) => {
  // UI state-ə əlavə et / toast göstər
  console.log(notification);
});
```

### 3.3. Auth / connection xətası

```ts
socket.on('exception', (err) => {
  // token yoxdur / expired / profil tapılmadı
  console.error(err);
});

socket.on('disconnect', (reason) => {
  console.warn('WS disconnected', reason);
});

socket.on('connect_error', (err) => {
  console.error('WS connect_error', err.message);
});
```

### 3.4. Ping (opsional health-check)

```ts
socket.emit('ping', { from: 'frontend' });

socket.on('pong', (data) => {
  // { ok: true, at: ISO date, echo: ... }
});
```

---

## 4. Payload shape (`notification.created`)

Response HTTP `GET /notifications` ilə eyni formattadır:

```ts
type NotificationType = 'fraud' | 'follow_up' | 'birthday';

interface NotificationDto {
  id: string;
  type: NotificationType;
  customerId: string | null;
  customerName: string | null;
  procedureId: string | null; // əsasən fraud üçün dolu olur
  message: string;
  isRead: boolean; // yeni yaradılanda adətən false
  createdAt: string; // ISO date
}
```

### Nümunə

```json
{
  "id": "09becffe-8fe0-4a7a-aec9-279a26cad711",
  "type": "fraud",
  "customerId": "aa10de1f-bdb5-4137-b36a-540ae33dd015",
  "customerName": "Vahid Hesenzade",
  "procedureId": "818d0d68-cf32-4e72-bdcb-2c975565491c",
  "message": "Faktiki atış sayı bəyan edilən sayı 1000 vahid üstələyir",
  "isRead": false,
  "createdAt": "2026-07-14T11:20:00.000Z"
}
```

Qeyd:
- `type=fraud` olanda `procedureId` ayrı field-dir
- `message` içində procedure id göndərilmir

---

## 5. Kim hansı notification-u alır?

Server otaq (room) məntiqi ilə filter edir:

| Rol | Nə alır |
|---|---|
| `admin` | Bütün filialların notification-ları |
| `branch_staff` | Yalnız öz filialına aid customer notification-ları |

Frontend-də əlavə role filter etməyə ehtiyac yoxdur — server artıq scope edir.

---

## 6. Tövsiyə olunan frontend axını

1. User login olur → JWT alınır
2. App mount/login sonrası Socket.IO connect
3. İlk siyahı üçün REST:
   - `GET /notifications?isRead=false`
4. Realtime üçün:
   - `socket.on('notification.created', ...)`
5. Notification oxunanda:
   - `PATCH /notifications/:id/read`
6. Logout:
   - `socket.disconnect()`

### Minimal React nümunəsi

```ts
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export function useNotificationSocket(
  accessToken: string | null,
  onCreated: (n: any) => void,
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

    socket.on('connected', (data) => {
      console.log('notifications ws ready', data);
    });

    socket.on('notification.created', onCreated);

    socket.on('exception', (err) => {
      console.error('notifications ws auth error', err);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [accessToken, onCreated]);
}
```

---

## 7. Tez-tez edilən səhvlər

1. **Swagger-da endpoint axtarmaq**  
   WebSocket REST siyahısında çıxmır. `GET /notifications/realtime` yalnız info üçündür.

2. **Native WebSocket açmaq**  
   `new WebSocket('ws://localhost:3000/notifications')` işləməz.  
   `socket.io-client` istifadə edin.

3. **Token göndərməmək**  
   Connect dərhal disconnect olur, `exception` gəlir.

4. **Expire olmuş token**  
   Token refresh sonra socket-i yenidən `disconnect` + yeni tokenlə `connect` edin.

5. **Səhv URL**  
   Düzgün: `http(s)://HOST:PORT/notifications`  
   Path ayrıca: `path: '/socket.io'`

---

## 8. Checklist (QA)

- [ ] Login olunub JWT var
- [ ] `socket.io-client` ilə `/notifications` namespace-ə connect
- [ ] `connected` event gəlir
- [ ] Yeni fraud / follow-up / birthday yarananda `notification.created` gəlir
- [ ] Payload-da `procedureId` (fraud üçün) ayrıca field kimi gəlir
- [ ] Logout-da socket disconnect olur

---

## 9. Backend kontakt qısa referans

- Info endpoint: `GET /notifications/realtime`
- Emit event: `notification.created`
- Auth field: `auth.token`
- Namespace: `/notifications`
- Path: `/socket.io`

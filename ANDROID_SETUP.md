# Hướng dẫn kết nối Android với CookShare Backend

## 1. Android Emulator (Giả lập)

### Cách 1: Sử dụng IP đặc biệt (Tự động)
- App sẽ tự động dùng `10.0.2.2:8080` cho Android Emulator
- Không cần cấu hình thêm

### Cách 2: Port Forwarding (Alternative)
```bash
# Nếu cách 1 không hoạt động, thử port forwarding:
adb reverse tcp:8080 tcp:8080
```

## 2. Android Device qua USB

### Bước 1: Enable Developer Options
1. Vào **Settings** > **About phone**
2. Tap **Build number** 7 lần
3. Quay lại **Settings** > **Developer options**
4. Bật **USB debugging**

### Bước 2: Port Forwarding
```bash
# Kết nối device và chạy lệnh:
adb reverse tcp:8080 tcp:8080
```

### Bước 3: Cập nhật API URL (nếu cần)
```typescript
// Trong authService.ts, có thể force localhost cho USB:
const API_BASE_URL = 'http://localhost:8080';
```

## 3. Android Device qua WiFi

### Yêu cầu:
- Device và máy tính cùng mạng WiFi
- Windows Firewall đã được cấu hình (như iOS)

### Sử dụng:
- App sẽ tự động test các IP khả dĩ
- Hoặc dùng button "Test kết nối Server"

## 4. Debugging

### Xem logs:
```bash
# Android device/emulator logs:
adb logcat | grep -i "cookshare\|authservice"

# Hoặc trong Metro bundler sẽ hiện logs
```

### Common Issues:

#### 1. Network Error trên Android Emulator:
```bash
# Solution: Port forwarding
adb reverse tcp:8080 tcp:8080
```

#### 2. Timeout trên Physical Device:
- Kiểm tra cùng WiFi
- Test button trong app
- Tắt tạm Windows Firewall để test

#### 3. CORS Error:
- Đã cấu hình trong backend
- Khởi động lại backend nếu cần

## 5. Commands hữu ích:

```bash
# Kiểm tra devices
adb devices

# Port forwarding
adb reverse tcp:8080 tcp:8080

# Remove port forwarding
adb reverse --remove tcp:8080

# Start Android emulator
emulator @your_avd_name

# Install APK
adb install app.apk

# Clear app data
adb shell pm clear com.yourpackage.cookshare
```
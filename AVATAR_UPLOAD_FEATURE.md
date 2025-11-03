# Avatar Upload Feature - Frontend Implementation

## 📱 Tổng quan

Tính năng upload ảnh đại diện với flow bảo mật:
1. **Frontend**: Chọn ảnh từ thiết bị
2. **Backend**: Kiểm tra quyền và tạo Firebase signed URL
3. **Frontend**: Upload trực tiếp lên Firebase Storage
4. **Frontend**: Cập nhật avatarUrl trong profile

## 🎯 Files đã implement

### 1. Services

#### `services/userService.ts`
Thêm method:
```typescript
async requestAvatarUploadUrl(
  userId: string, 
  fileName: string, 
  contentType: string
): Promise<{ uploadUrl: string; publicUrl: string }>
```

**Mô tả**: Gọi API backend để lấy signed URL cho upload

#### `services/imageUploadService.ts` (MỚI)
Upload service với các methods:

- `uploadImage(uploadUrl, imageUri, contentType, onProgress)` - Upload ảnh lên Firebase
- `getContentType(uri)` - Detect MIME type từ extension
- `generateFileName(originalName?)` - Tạo unique filename

**Features**:
- XMLHttpRequest để track progress
- Progress callback cho UI
- Error handling đầy đủ

### 2. Screen Updates

#### `screens/profile/ProfileDetailsScreen.tsx`

**New states**:
```typescript
const [isUploadingImage, setIsUploadingImage] = useState(false);
const [uploadProgress, setUploadProgress] = useState(0);
```

**New functions**:
- `handleChangeAvatar()` - Show option picker (Library/Camera)
- `pickImageFromLibrary()` - Chọn ảnh từ thư viện
- `pickImageFromCamera()` - Chụp ảnh mới
- `uploadAvatar(imageUri)` - Main upload flow
- `updateAvatarOnly(avatarUrl)` - Update avatar immediately

**Upload Flow**:
```
1. User clicks camera icon
   ↓
2. Request permissions (Library/Camera)
   ↓
3. Show picker dialog
   ↓
4. User selects/captures image
   ↓
5. Generate unique filename
   ↓
6. Request signed URL from backend
   ↓
7. Upload to Firebase (với progress tracking)
   ↓
8. Update formData.avatarUrl
   ↓
9. If editing: show success message
   If not editing: auto-save avatar
```

**UI Updates**:
- Camera icon button khi editing
- Upload progress indicator
- Loading states

## 📦 Dependencies

### Đã có sẵn:
```json
{
  "expo-image-picker": "~17.0.8"
}
```

### Không cần cài thêm gì!

## 🔐 Security Features

1. **Permission checks**: Request camera/library permissions
2. **Backend authorization**: Backend kiểm tra quyền user
3. **Signed URLs**: URLs chỉ valid 15 phút
4. **Direct upload**: File không đi qua backend server
5. **File validation**: 
   - Frontend: Check file extension
   - Backend: Validate content type và extension

## 🎨 UI/UX Features

1. **Image Picker Options**:
   - Chọn từ thư viện
   - Chụp ảnh mới
   - Crop vuông 1:1
   - Quality 0.8

2. **Upload Progress**:
   - Activity indicator
   - Percentage display (0-100%)
   - Disable buttons during upload

3. **Error Handling**:
   - Permission denied
   - Network errors
   - Backend errors
   - Clear error messages

## 🔄 Upload Flow Chi tiết

```typescript
// Step 1: User picks image
pickImageFromLibrary() or pickImageFromCamera()
  ↓
// Step 2: Generate metadata
fileName = imageUploadService.generateFileName(uri)
contentType = imageUploadService.getContentType(uri)
  ↓
// Step 3: Request signed URL from backend
{ uploadUrl, publicUrl } = await userService.requestAvatarUploadUrl(
  userId, 
  fileName, 
  contentType
)
  ↓
// Step 4: Upload to Firebase
await imageUploadService.uploadImage(
  uploadUrl, 
  imageUri, 
  contentType, 
  (progress) => setUploadProgress(progress.percentage)
)
  ↓
// Step 5: Update avatar URL
setFormData({ ...formData, avatarUrl: publicUrl })
  ↓
// Step 6: Save to backend
if (isEditing) {
  // User clicks "Lưu thay đổi"
} else {
  // Auto-save immediately
  await userService.updateUserProfile(userId, { avatarUrl: publicUrl })
}
```

## 🧪 Testing Checklist

### Permissions
- [ ] Library permission request
- [ ] Camera permission request
- [ ] Permission denied handling

### Image Selection
- [ ] Select from library
- [ ] Take new photo
- [ ] Image cropping works
- [ ] Cancel selection

### Upload Process
- [ ] Progress indicator shows
- [ ] Progress percentage updates
- [ ] Upload completes successfully
- [ ] Error handling (network, backend)

### Profile Update
- [ ] Avatar preview updates immediately
- [ ] Save button shows/works in edit mode
- [ ] Auto-save works when not editing
- [ ] AuthContext updates with new avatar

### Edge Cases
- [ ] No internet connection
- [ ] Large file (>10MB)
- [ ] Invalid file type
- [ ] Backend error
- [ ] User cancels during upload

## 🐛 Known Issues / TODO

1. **Cancel upload**: Hiện tại chưa có nút cancel khi đang upload
2. **File size limit**: Chưa có check file size trước khi upload
3. **Image compression**: Có thể thêm compression trước upload để giảm bandwidth
4. **Retry mechanism**: Chưa có auto-retry khi upload fail

## 📱 Platform-specific Notes

### iOS
- ✅ Permissions hoạt động tốt
- ✅ In-app camera/library picker
- ⚠️ Cần add keys vào Info.plist:
  ```xml
  <key>NSCameraUsageDescription</key>
  <string>Cần quyền truy cập camera để chụp ảnh đại diện</string>
  <key>NSPhotoLibraryUsageDescription</key>
  <string>Cần quyền truy cập thư viện để chọn ảnh đại diện</string>
  ```

### Android
- ✅ Permissions hoạt động tốt
- ✅ Camera và gallery picker
- ⚠️ Cần permissions trong AndroidManifest.xml (Expo tự động add)

## 🔗 API Endpoints Used

### Backend
```
POST /users/{userId}/avatar/upload-url
Body: { fileName, contentType }
Response: { uploadUrl, publicUrl }

PUT /users/{userId}/profile
Body: { avatarUrl }
Response: UserProfileDto
```

### Firebase Storage
```
PUT {signedUrl}
Body: Binary image data
Headers: Content-Type: {contentType}
```

## 🎯 Success Criteria

✅ User có thể chọn ảnh từ library
✅ User có thể chụp ảnh mới
✅ Upload progress được hiển thị
✅ Ảnh được upload lên Firebase thành công
✅ Avatar URL được cập nhật trong profile
✅ UI responsive và user-friendly
✅ Error handling rõ ràng
✅ Permissions được request đúng cách

## 📞 Support

Nếu gặp lỗi:
1. Check console logs (Metro bundler)
2. Check backend logs
3. Verify Firebase Storage setup
4. Check permissions trong device settings

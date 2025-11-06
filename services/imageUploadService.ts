import { Platform } from 'react-native';

export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

class ImageUploadService {
    /**
     * Upload ảnh lên Firebase Storage sử dụng signed URL từ backend
     * @param uploadUrl - Signed URL từ backend
     * @param imageUri - URI ảnh local từ thiết bị
     * @param contentType - MIME type của ảnh (vd: 'image/jpeg')
     * @param onProgress - Callback tùy chọn để theo dõi tiến trình
     */
    async uploadImage(
        uploadUrl: string,
        imageUri: string,
        contentType: string,
        onProgress?: (progress: UploadProgress) => void
    ): Promise<void> {
        try {
            console.log('🚀 Bắt đầu upload ảnh lên Firebase...');
            console.log('📍 Upload URL:', uploadUrl);
            console.log('📁 URI ảnh:', imageUri);

            // Đọc ảnh thành blob
            const response = await fetch(imageUri);
            const blob = await response.blob();

            console.log('📦 Kích thước blob:', blob.size, 'bytes');
            console.log('🎨 Content type:', contentType);

            // Tạo XMLHttpRequest để theo dõi tiến trình
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                // Theo dõi tiến trình upload
                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable && onProgress) {
                        const progress: UploadProgress = {
                            loaded: event.loaded,
                            total: event.total,
                            percentage: Math.round((event.loaded / event.total) * 100),
                        };
                        onProgress(progress);
                        console.log(`📊 Tiến trình upload: ${progress.percentage}%`);
                    }
                });

                // Xử lý khi hoàn thành
                xhr.addEventListener('load', () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        console.log('✅ Upload ảnh thành công');
                        resolve();
                    } else {
                        console.error('❌ Upload thất bại với status:', xhr.status);
                        reject(new Error(`Upload thất bại với status: ${xhr.status}`));
                    }
                });

                // Xử lý lỗi
                xhr.addEventListener('error', () => {
                    console.error('❌ Lỗi mạng khi upload');
                    reject(new Error('Lỗi mạng khi upload'));
                });

                xhr.addEventListener('abort', () => {
                    console.error('❌ Upload bị hủy');
                    reject(new Error('Upload bị hủy'));
                });

                // Gửi request
                xhr.open('PUT', uploadUrl);
                xhr.setRequestHeader('Content-Type', contentType);
                xhr.send(blob);
            });
        } catch (error: any) {
            console.error('❌ Lỗi upload ảnh:', error);
            throw new Error(error.message || 'Không thể upload ảnh');
        }
    }

    /**
     * Lấy content type từ phần mở rộng file
     */
    getContentType(uri: string): string {
        const extension = uri.split('.').pop()?.toLowerCase();

        switch (extension) {
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'png':
                return 'image/png';
            case 'gif':
                return 'image/gif';
            case 'webp':
                return 'image/webp';
            default:
                return 'image/jpeg'; // Mặc định
        }
    }

    /**
     * Tạo tên file duy nhất cho upload
     */
    generateFileName(originalName?: string): string {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substring(7);
        const extension = originalName?.split('.').pop()?.toLowerCase() || 'jpg';
        return `avatar_${timestamp}_${random}.${extension}`;
    }
}

export const imageUploadService = new ImageUploadService();

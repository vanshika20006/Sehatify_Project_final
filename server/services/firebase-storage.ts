import { adminStorage } from './firebase-admin';
import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';

export class FirebaseStorageService {
  private get bucket() {
    if (!adminStorage) {
      throw new Error('Firebase Storage not initialized. Please check your Firebase configuration.');
    }
    return adminStorage.bucket();
  }

  private async ensureLocalUploadDir(): Promise<string> {
    const uploadDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }
    return uploadDir;
  }

  /**
   * Sanitize filename to prevent path traversal attacks
   */
  private sanitizeFileName(fileName: string): string {
    // Extract just the filename without path
    const baseName = path.basename(fileName);
    // Remove dangerous characters and limit length
    const sanitized = baseName.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 100);
    // Ensure it's not empty
    return sanitized || 'file';
  }

  /**
   * Upload a file to Firebase Storage or local storage (fallback for development)
   */
  async uploadFile(fileBuffer: Buffer, fileName: string, mimeType: string): Promise<string> {
    // Use local storage in development mode
    if (process.env.NODE_ENV === 'development') {
      console.log('Using local storage for file upload (development mode)');
      try {
        const uploadDir = await this.ensureLocalUploadDir();
        const safeFileName = this.sanitizeFileName(fileName);
        const uniqueFileName = `${randomUUID()}-${safeFileName}`;
        const filePath = path.join(uploadDir, uniqueFileName);
        
        await fs.writeFile(filePath, fileBuffer);
        
        // Return a local URL that can be served by Express
        return `/uploads/${uniqueFileName}`;
      } catch (error) {
        console.error('Local storage upload error:', error);
        throw new Error('Failed to upload file to local storage');
      }
    }

    // Use Firebase Storage in production
    if (adminStorage) {
      try {
        // Create a unique filename to avoid collisions
        const safeFileName = this.sanitizeFileName(fileName);
        const uniqueFileName = `medical-files/${randomUUID()}-${safeFileName}`;
        
        // Create a file reference
        const file = this.bucket.file(uniqueFileName);
        
        // Upload the file buffer directly
        await file.save(fileBuffer, {
          metadata: {
            contentType: mimeType,
          },
        });

        // Make the file publicly accessible
        await file.makePublic();

        // Return the public URL
        return `https://storage.googleapis.com/${this.bucket.name}/${uniqueFileName}`;
      } catch (error) {
        console.error('Firebase Storage upload error:', error);
        throw new Error('Failed to upload file to cloud storage');
      }
    }

    throw new Error('No storage service available');
  }

  /**
   * Upload a file from local path to Firebase Storage (backward compatibility)
   */
  async uploadFileFromPath(localFilePath: string, fileName: string, mimeType: string): Promise<string> {
    try {
      // Create a unique filename to avoid collisions
      const safeFileName = this.sanitizeFileName(fileName);
      const uniqueFileName = `medical-files/${randomUUID()}-${safeFileName}`;
      
      // Upload the file to Firebase Storage
      const [file] = await this.bucket.upload(localFilePath, {
        destination: uniqueFileName,
        metadata: {
          contentType: mimeType,
        },
      });

      // Make the file publicly accessible
      await file.makePublic();

      // Return the public URL
      return `https://storage.googleapis.com/${this.bucket.name}/${uniqueFileName}`;
    } catch (error) {
      console.error('Firebase Storage upload error:', error);
      throw new Error('Failed to upload file to cloud storage');
    }
  }

  /**
   * Delete a file from Firebase Storage or local storage
   */
  async deleteFile(storageUrl: string): Promise<boolean> {
    // Handle local storage deletion (development mode)
    if (storageUrl.startsWith('/uploads/')) {
      try {
        const fileName = path.basename(storageUrl);
        const filePath = path.join(process.cwd(), 'uploads', fileName);
        
        // Verify file exists before deletion
        await fs.access(filePath);
        await fs.unlink(filePath);
        
        console.log(`Local file deleted successfully: ${fileName}`);
        return true;
      } catch (error) {
        console.error('Local file delete error:', error);
        return false;
      }
    }

    // Handle Firebase Storage deletion (production mode)
    try {
      // Extract the file path from the storage URL
      const urlParts = storageUrl.split('/');
      const bucketName = urlParts[3];
      const filePath = urlParts.slice(4).join('/');

      if (bucketName !== this.bucket.name) {
        console.warn('File not in this bucket, skipping deletion');
        return false;
      }

      const file = this.bucket.file(filePath);
      await file.delete();
      console.log(`Firebase file deleted successfully: ${filePath}`);
      return true;
    } catch (error) {
      console.error('Firebase Storage delete error:', error);
      return false;
    }
  }

  /**
   * Get a signed URL for temporary access to a file
   */
  async getSignedUrl(storageUrl: string, expiresInMinutes: number = 60): Promise<string> {
    try {
      // Extract the file path from the storage URL
      const urlParts = storageUrl.split('/');
      const filePath = urlParts.slice(4).join('/');

      const file = this.bucket.file(filePath);
      const [signedUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + expiresInMinutes * 60 * 1000,
      });

      return signedUrl;
    } catch (error) {
      console.error('Firebase Storage signed URL error:', error);
      throw new Error('Failed to generate signed URL');
    }
  }

  /**
   * Clean up local temporary file
   */
  async cleanupTempFile(localFilePath: string): Promise<void> {
    try {
      await fs.unlink(localFilePath);
    } catch (error) {
      console.warn('Failed to cleanup temp file:', error);
    }
  }
}

export const firebaseStorageService = new FirebaseStorageService();
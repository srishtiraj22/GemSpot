/**
 * Storage Service — Manages uploading files (avatars, thumbnails) to Firebase Storage
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads a local image file to Firebase Storage and returns the public download URL.
 * @param uri The local file URI (e.g., from ImagePicker)
 * @param path The destination path in Firebase Storage (e.g., 'avatars/user123.jpg')
 */
export async function uploadImageAsync(uri: string, path: string): Promise<string> {
    try {
        // 1. Convert local file URI to Blob
        const response = await fetch(uri);
        const blob = await response.blob();

        // 2. Create a reference to the storage location
        const storageRef = ref(storage, path);

        // 3. Upload the blob
        await uploadBytes(storageRef, blob);

        // 4. Get and return the public download URL
        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
    } catch (error: any) {
        console.error('Error uploading image to Firebase Storage:', error);
        throw new Error(error.message || 'Failed to upload image');
    }
}

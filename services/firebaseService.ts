import { db, storage } from "../firebase";
import { collection, doc, setDoc, deleteDoc, onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { ref, uploadString, getDownloadURL, deleteObject } from "firebase/storage";
import { GeneratedImage } from "../types";

export const saveLookToFirebase = async (userId: string, look: GeneratedImage) => {
  try {
    // 1. Upload Base64 Image to Firebase Storage
    // Create a reference to 'users/{userId}/looks/{lookId}.jpg'
    const storageRef = ref(storage, `users/${userId}/looks/${look.id}.jpg`);
    
    // Upload the base64 string (ensure it has the data:image/ prefix removed if using 'base64', 
    // or keep it if using 'data_url'. Our app uses data_url format usually).
    const uploadResult = await uploadString(storageRef, look.url, 'data_url');
    
    // Get the public download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);

    // 2. Save Metadata to Firestore
    const lookRef = doc(db, "users", userId, "looks", look.id);
    await setDoc(lookRef, {
      id: look.id,
      prompt: look.prompt,
      type: look.type,
      url: downloadURL, // Save the Storage URL, not the Base64
      storagePath: storageRef.fullPath,
      timestamp: serverTimestamp(), // Server-side timestamp
      createdAt: Date.now() // Client-side timestamp fallback
    });

    return true;
  } catch (error) {
    console.error("Error saving look to Firebase:", error);
    throw error;
  }
};

export const deleteLookFromFirebase = async (userId: string, lookId: string, storagePath?: string) => {
  try {
    // 1. Delete from Firestore
    await deleteDoc(doc(db, "users", userId, "looks", lookId));

    // 2. Delete from Storage (if path exists)
    if (storagePath) {
      const storageRef = ref(storage, storagePath);
      await deleteObject(storageRef);
    } else {
      // Fallback: try to construct path
      const storageRef = ref(storage, `users/${userId}/looks/${lookId}.jpg`);
      try {
         await deleteObject(storageRef);
      } catch (e) {
         console.warn("Could not delete file from storage, might not exist");
      }
    }
  } catch (error) {
    console.error("Error deleting look:", error);
    throw error;
  }
};

export const subscribeToLooks = (userId: string, callback: (looks: GeneratedImage[]) => void) => {
  const q = query(collection(db, "users", userId, "looks"), orderBy("timestamp", "desc"));
  
  return onSnapshot(q, (snapshot) => {
    const looks: GeneratedImage[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      looks.push({
        id: data.id,
        url: data.url,
        prompt: data.prompt,
        type: data.type,
        timestamp: data.createdAt || Date.now(),
        // @ts-ignore
        storagePath: data.storagePath 
      });
    });
    callback(looks);
  });
};
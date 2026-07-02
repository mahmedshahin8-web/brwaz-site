import fs from 'fs';

let content = fs.readFileSync('src/pages/ContentCreationPage.tsx', 'utf8');

content = content.replace('import { db, storage } from "../lib/firebase";', '// Removed firebase import for Air-Gapped Privacy');
content = content.replace('import { collection, addDoc, serverTimestamp } from "firebase/firestore";', '');
content = content.replace('import { ref, uploadBytes, getDownloadURL } from "firebase/storage";', '');

const searchFirebaseInsert = `      try {
        const docRef = await addDoc(collection(db, "projects"), {
          title: finalData.video_title,
          topic,
          mood,
          persona,
          dataString: JSON.stringify(finalData),
          createdAt: serverTimestamp(),
        });
        console.log("Project saved to Firebase with ID: ", docRef.id);
      } catch (e) {
        console.error("Error saving to Firebase: ", e);
      }`;

const replaceSQLiteInsert = `      try {
        const id = "proj_" + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
        await apiFetch("/api/dossiers", {
            method: "POST",
            body: JSON.stringify({
                id,
                title: finalData.video_title || topic,
                content: finalData
            })
        });
        console.log("Project saved to local SQLite successfully with ID:", id);
      } catch (e) {
        console.error("Error saving to local SQLite: ", e);
      }`;

content = content.replace(searchFirebaseInsert, replaceSQLiteInsert);

fs.writeFileSync('src/pages/ContentCreationPage.tsx', content);
console.log('Firebase replaced with SQLite API in ContentCreationPage.tsx');

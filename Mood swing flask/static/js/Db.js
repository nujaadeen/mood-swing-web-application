import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAuth, updatePassword ,createUserWithEmailAndPassword, signInWithEmailAndPassword , updateProfile} from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
import { getDatabase, ref,remove, set, push, get, child } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-database.js";
import { getStorage, ref as storageRef, listAll, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";
import { v4 as uuidv4 } from 'https://cdn.skypack.dev/uuid';




const apps = initializeApp(firebaseConfig);
const auth = getAuth(apps);
const database = getDatabase(apps);
const storage = getStorage(apps);

function writeToDatabase(data) {
  const dbRef = ref(database);
  set(dbRef, data)
    .then(() => {
      console.log("Data written to the database successfully.");
    })
    .catch((error) => {
      console.error("Error writing data to the database:", error);
    });
}
export function saveNameToDatabase(userId, name) {
  const userRef = ref(database, 'users/' + userId);
  set(userRef, {
      name: name
  }).then(() => {
      console.log("Name saved successfully in Realtime Database");
  }).catch((error) => {
      console.error("Error saving name in Realtime Database:", error);
  });
}
export function fetchNameFromDatabase(userId) {
  const userRef = ref(database, `users/${userId}` );
  get(userRef).then((snapshot) => {
      if (snapshot.exists()) {
          const userData = snapshot.val();
          console.log(userData);
          const name = userData.name;
          console.log("Name:", name);
          localStorage.setItem("name",name);
          return name; // You can return the name or perform any other action with it
      } else {
          console.log("No such user");
          return null;
      }
  }).catch((error) => {
      console.error("Error fetching name from Realtime Database:", error);
      return null;
  });
}
export async function saveRecording(audioChunks,time) {
  try {
    let userId=localStorage.getItem('User_id');
    console.log(userId);
    // Generate a unique filename
    const filename = `${uuidv4()}.wav`;

    // Create a reference to the Firebase Storage bucket with the unique filename
    const storageReference = storageRef(storage, `users/${userId}/recordings/${filename}`);

    // Convert audioChunks to a Blob
    const audioBlob = audioChunks;
    
    console.log(audioBlob);
    // Upload the audio file to Firebase Storage
    const uploadTask = uploadBytes(storageReference, audioBlob);

    // Wait for the upload to complete
    const snapshot = await uploadTask;

    // Get the download URL of the uploaded audio file
    const downloadURL = await getDownloadURL(snapshot.ref);

    // Save metadata (e.g., filename, download URL) in Firebase Realtime Database
    const metadataRef = push(ref(database, `users/${userId}/recordings`));
    const metadataKey = metadataRef.key;
    
    await set(metadataRef, {
      filename: filename, // Save the generated filename
      downloadURL: downloadURL,
      time:time,
      
    });

    console.log('Audio uploaded and metadata saved successfully.');
    return [true,metadataKey];
  } catch (error) {
    console.error('Error saving recording:', error);
    return false;
  }
}

export function addBlog( userId, content) {
  const key=uuidv4();
  const blogRef = ref(database, `users/${userId}/Blogs/${key}`);
  const currentDate = new Date();
  const dateTimeString = currentDate.toISOString().replace('T', ' ').split('.')[0];
  
  
   set(blogRef, {
      date: dateTimeString,
      content: content
  }).then(() => {
      console.log("Blog added successfully");
  }).catch(error => {
      console.error("Error adding blog:", error);
  });
}
export async function getAllBlogs(userId) {
  const database = getDatabase();
  const blogsRef = ref(database, `users/${userId}/Blogs`);

  try {
      const snapshot = await get(blogsRef);
      const blogs = snapshot.val();
      
      if (blogs) {
         
          const blogArray = Object.keys(blogs).map(key => {
              return { key: key, ...blogs[key] };
          });
          
          return blogArray;
      } else {
          console.log("No blogs found");
          return [];
      }
  } catch (error) {
      console.error("Error fetching blogs:", error);
      return [];
  }
}



export async function deleteBlogEntry(blogEntryId,userId) {
 
  
  const blogRef = ref(database, `users/${userId}/Blogs/${blogEntryId}`);

  remove(blogRef)
      .then(() => {
          console.log("Blog entry deleted successfully");
           return true
        })
      .catch(error => {
          console.error("Error deleting blog entry:", error);
           return false
        });
}
export async function changePassword( newPassword) {
  
  const user = auth.currentUser;

  if (!user) {
      console.error("User not authenticated.");
      return;
  }

  try {
      await updatePassword(user, newPassword);
      console.log("Password updated successfully.");
  } catch (error) {
      console.error("Error updating password:", error.message);
  }
}


export async function updateUserName(userId, newName) {
  
  const userRef = ref(database, `users/${userId}/name`);

  try {
      await set(userRef, newName);
      console.log("User name updated successfully.");
  } catch (error) {
      console.error("Error updating user name:", error.message);
  }
}

export async function uploadProfilePic(userId, file) {
  const filePath = `users/${userId}/profilepic/profile.jpg`; // Fixed file path for the profile picture
  
  // Create a reference to the storage service
  const storageRefs =storageRef(storage, filePath);

  try {
    // Upload the file
    await uploadBytes(storageRefs, file);

    // Get download URL
    const downloadURL = await getDownloadURL(storageRefs);
    const dbref= ref(database,`users/${userId}/profilepicUrl`)
    
    await set(dbref, downloadURL);

    
    console.log("Profile picture uploaded successfully.");
  } catch (error) {
    console.error("Error uploading profile picture:", error.message);
  }
}

export async function fetchProfilePicUrl(userId) {
  try {
    
    const profilePicRef = ref(database, `users/${userId}/profilepicUrl`);
    
    const snapshot = await get(profilePicRef);
    if (snapshot.exists()) {
      const profilePicUrl = snapshot.val();
      return profilePicUrl;
    } else {
      console.log("Profile picture URL not found in database.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching profile picture URL:", error.message);
    return null;
  }
}

// export async function uploadProfilePicurl(userId, file) {
//   const storageRef = ref(storage, `users/${userId}/profilepic/${file.name}`);

//   try {
//     // Upload the file
//     await uploadBytes(storageRef, file);

//     // Get download URL
//     const downloadURL = await getDownloadURL(storageRef);

//     // Save the download URL to Realtime Database
//     const db = getDatabase();
//     const dbRef = databaseRef(db, `users/${userId}/profilepicUrl`);
//     await set(dbRef, downloadURL);

//     console.log("Profile picture uploaded successfully.");
//   } catch (error) {
//     console.error("Error uploading profile picture:", error.message);
//   }
// }


 export async function getRecordingDownloadURL(uid, recordingId) {
  try {
    // Get a reference to the recording in Firebase Realtime Database
    const recordingRef = ref(database, `users/${uid}/recordings/${recordingId}`);

    // Get the data at the recording reference
    const snapshot = await get(recordingRef);

    // Check if the snapshot exists and contains a download URL
    if (snapshot.exists() && snapshot.hasChild('downloadURL')) {
        // Return the download URL from the snapshot data
        return [snapshot.val().downloadURL];
    } else {
        throw new Error('Recording download URL not found');
    }
} catch (error) {
    console.error('Error fetching recording download URL:', error);
    throw error; // Re-throw the error for the caller to handle
}
}

function readFromDatabase() {
  const dbRef = ref(database);
  get(dbRef)
    .then((snapshot) => {
      if (snapshot.exists()) {
        console.log("Data from the database:", snapshot.val());
      } else {
        console.log("No data available in the database.");
      }
    })
    .catch((error) => {
      console.error("Error reading data from the database:", error);
    });
}
 export function addToPlaylistToDatabase(previewUrl, mood, imageUrl, songName) {
  
  const userId = localStorage.getItem('User_id'); // Implement getCurrentUserId function to retrieve the current user ID
  console.log(userId,previewUrl,mood)
  const playlistRef = ref(database, `users/${userId}/playlist/${mood}`);
  const newPlaylistItemRef = push(playlistRef); // Create a new reference for the pushed item
  set(newPlaylistItemRef, {
    link: previewUrl,
    image: imageUrl,
    text: songName,
  }).then(() => {
    console.log("URL added to database successfully");
  }).catch(error => {
    console.error("Error adding URL to database:", error);
  });
}
export async function fetchAllMoods() {
  try {
    const userId = localStorage.getItem('User_id');
    const playlistsRef = ref(database, `users/${userId}/playlist`);
    const snapshot = await get(playlistsRef);

    const moods = [];
    snapshot.forEach((childSnapshot) => {
      moods.push(childSnapshot.key);
    });

    return moods;
  } catch (error) {
    console.error("Error fetching moods:", error);
    return [];
  }
}

export async function fetchPlaylistsByMood(mood) {
  try {
    const userId = localStorage.getItem('User_id');
    const playlistsRef = ref(database, `users/${userId}/playlist/${mood}`);
    const snapshot = await get(playlistsRef);

    if (snapshot.exists()) {
      const playlists = [];
      snapshot.forEach((childSnapshot) => {
        const data = childSnapshot.val();
        const playlist = {
          id: childSnapshot.key,
          image: data.image,
          link: data.link,
          text: data.text
        };
        playlists.push(playlist);
      });
      return playlists;
    } else {
      console.log(`No playlists found for mood: ${mood}`);
      return [];
    }
  } catch (error) {
    console.error("Error fetching playlists:", error);
    return [];
  }
}
export async function fetchAllMoodsWithPlaylists() {
  try {
      const moods = await fetchAllMoods();
      const moodsWithPlaylists = await Promise.all(moods.map(async (mood) => {
          const playlists = await fetchPlaylistsByMood(mood);
          return { mood, playlists };
      }));
      return moodsWithPlaylists;
  } catch (error) {
      console.error("Error fetching moods with playlists:", error);
      return [];
  }
}
export async function deletePlaylistFromDatabase(userId, playlistsMood, playlistId) {
  try {
    // Get a reference to the Firebase Realtime Database
    

    // Get a reference to the playlist node under the user's node
    const userPlaylistsRef = ref(database, `users/${userId}/playlist/${playlistsMood}/${playlistId}`);
    await remove(userPlaylistsRef);
    // Get a reference to the specific playlist
   
    // Remove the playlist from the database
    
    console.log('Playlist deleted successfully.');
  } catch (error) {
    console.error('Error deleting playlist:', error);
  }
}

 function writeToRecordings(data) {
  const uid = localStorage.getItem('User_id'); // Retrieve UID from localStorage
  if (!uid) {
    console.error('UID not found in localStorage.');
    return;
  }

  const recordingsRef = ref(database, `users/${uid}/recordings`);
  const newRecordingRef = push(recordingsRef); // Push a new recording under the user's UID
  set(newRecordingRef, data)
    .then(() => {
      console.log("Data written to the recordings node successfully.");
    })
    .catch((error) => {
      console.error("Error writing data to the recordings node:", error);
    });
}
export async function deleteRecording(userId, recordingId) {
  try {
      // Reference to the recording in the database
      const recordingRef = ref(getDatabase(), `users/${userId}/recordings/${recordingId}`);
      
      // Remove the recording
      await remove(recordingRef);
      
      console.log('Recording deleted successfully');
  } catch (error) {
      console.error('Error deleting recording:', error);
      throw error; // Rethrow the error to propagate it to the caller
  }
}
export async function fetchDownloadURLsWithIds(userId) {
  try {
      // Reference to the recordings node in the database
      const recordingsRef = ref(getDatabase(), `users/${userId}/recordings`);

      // Fetch the data from the database
      const snapshot = await get(recordingsRef);

      // Initialize an array to store download URLs with IDs
      const downloadURLsWithIds = [];

      // Iterate over the child nodes (recordings)
      snapshot.forEach((childSnapshot) => {
          const recordingId = childSnapshot.key; // Get the recording ID
          const recordingData = childSnapshot.val();
          
          // Extract the downloadURL property and add it to the array with its ID
          if (recordingData.downloadURL) {
              downloadURLsWithIds.push({
                  id: recordingId,
                  downloadURL: recordingData.downloadURL,
                  time:recordingData.time,
              });
          }
      });

      // Return the array of download URLs with their IDs
      return downloadURLsWithIds;
  } catch (error) {
      console.error("Error fetching download URLs:", error);
      throw error;
  }
}

// Usage example
const userId = localStorage.getItem('User_id'); // Replace with the actual user ID
fetchDownloadURLsWithIds(userId)
  .then((downloadURLs) => {
      console.log("Download URLs:", downloadURLs);
      // Use the download URLs as needed
  })
  .catch((error) => {
      console.error("Error:", error);
  });



export { auth, createUserWithEmailAndPassword,updateProfile, signInWithEmailAndPassword, writeToDatabase, readFromDatabase, writeToRecordings }

import { fetchDownloadURLsWithIds as fetchRecordings , deleteRecording } from "./Db.js";

import { transcribeAudio } from "./transcribe.js";
// Get the recordingItems container
const recordingItems = document.getElementById('recordingItems');
const show_divs=document.getElementById('show-song');
import { addBlog } from "./Db.js";
import { webalerts } from "./uiAlert.js";
import { getAllBlogs , deleteBlogEntry , fetchProfilePicUrl,changePassword,updateUserName,uploadProfilePic} from "./Db.js";

async function renderRecordingCard(recording, container = recordingItems) {

        // Create the player card element
        const playerCard = document.createElement('div');
        playerCard.classList.add('player', 'player_two');
        playerCard.style.display = 'flex';
    
        // Create the left image div
        const leftImgDiv = document.createElement('div');
        leftImgDiv.classList.add('left-img-div');
        const currentTimeSpan = document.createElement('span');
        currentTimeSpan.textContent =  `${recording.time}`; // Initial value
        leftImgDiv.appendChild(currentTimeSpan);
        playerCard.appendChild(leftImgDiv);
    
        // Create the right controls div
        const rightControlsDiv = document.createElement('div');
        rightControlsDiv.classList.add('right-controls-div');
    
        // Create the upper div
        const upperDiv = document.createElement('div');
        upperDiv.classList.add('upper');
        const musicRangeInput = document.createElement('input');
        musicRangeInput.type = 'range';
        musicRangeInput.name = 'musicRange';
        musicRangeInput.id = 'musicRange';
        musicRangeInput.min = '0';
        musicRangeInput.value = '0'; // Set initial value to 0
        upperDiv.appendChild(musicRangeInput);
        rightControlsDiv.appendChild(upperDiv);
    
        // Create the lower div
        const lowerDiv = document.createElement('div');
        lowerDiv.classList.add('lower');
        
        const skipBackwardIcon = document.createElement('i');
        skipBackwardIcon.classList.add('ri-skip-back-fill');
        const playPauseIcon = document.createElement('i');
        playPauseIcon.classList.add('ri-play-circle-fill');
        const skipForwardIcon = document.createElement('i');
        skipForwardIcon.classList.add('ri-skip-forward-fill');
        const deleteIcon = document.createElement('i');
        deleteIcon.classList.add('ri-delete-bin-line');
        
        lowerDiv.appendChild(skipBackwardIcon);
        lowerDiv.appendChild(playPauseIcon);
        lowerDiv.appendChild(skipForwardIcon);
        lowerDiv.appendChild(deleteIcon); // Add delete icon
        rightControlsDiv.appendChild(lowerDiv);
    
        // Create the audio element
        const audioPlayer = document.createElement('audio');
    
        // Add event listeners to handle audio metadata and time updates


        audioPlayer.addEventListener('error', (event) => {
            console.error('Error loading audio:', event);
        });
    
        audioPlayer.addEventListener('timeupdate', () => {
            
           
            
            musicRangeInput.value = audioPlayer.currentTime;
        });
    
        // Load the audio source from the recording
        audioPlayer.src = recording.downloadURL;
    
        // Handle reload button click event
        function Toggle_audio(){
            document.getElementById('FindSong').disabled = true;
            // Reset color of time span elements
            document.querySelectorAll('.left-img-div span').forEach(span => span.style.color = "white");
            
            document.getElementById('audioPlayer').src = audioPlayer.src;
            sessionStorage.setItem("Sentiment",null);
            
            
            document.getElementById('currentTime').textContent=`${recording.time}`
            currentTimeSpan.style.color = "green";
            
            document.getElementById('FindSong').disabled = false;
            
            document.getElementById('show-song').style.display = "none";
            document.getElementById('show_results').style.display="none";
        }
       
    
        // Add event listener to handle input from range input
        musicRangeInput.addEventListener('input', () => {
            // Update the audio playback position based on range input value
            audioPlayer.currentTime = musicRangeInput.value;
        });
    
        // Toggle play and pause icons and play/pause functionality
        playPauseIcon.addEventListener('click', () => {
            if (audioPlayer.paused) {
                audioPlayer.play();
                Toggle_audio();
                playPauseIcon.classList.remove('ri-play-circle-fill');
                playPauseIcon.classList.add('ri-pause-circle-fill');
            } else {
                audioPlayer.pause();
                playPauseIcon.classList.remove('ri-pause-circle-fill');
                playPauseIcon.classList.add('ri-play-circle-fill');
            }
        });
    
        // Add skip forward functionality
        skipForwardIcon.addEventListener('click', () => {
            audioPlayer.currentTime += 5; // Skip forward 5 seconds
        });
    
        // Add skip backward functionality
        skipBackwardIcon.addEventListener('click', () => {
            audioPlayer.currentTime -= 5; // Skip backward 5 seconds
        });
    
        // Add delete functionality
        deleteIcon.addEventListener('click', async () => {
            try {
                const user_id = localStorage.getItem('User_id');
                console.log(recording.id);
                await deleteRecording(user_id, recording.id); // Assuming deleteRecording function is implemented in Db.js
                // Remove the player card from the container
                container.removeChild(playerCard);
                webalerts.createAlert("Success", "Audio Deleted Sussesfully");
                console.log('Audio deleted successfully');
            } catch (error) {
                console.error('Error deleting audio:', error);
            }
        })

    // Append the right controls div to the player card
    playerCard.appendChild(rightControlsDiv);
    
    
    // Append the player card to the container
    container.appendChild(playerCard);

    
   function formatTime(time) {
    if (isNaN(time)  || !isFinite(time)) return '--:--';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    console.log(minutes,seconds);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    }
}

function deleteItems() {
    var parentDiv = document.getElementById("recordingItems");
    var children = parentDiv.children;
    console.log(children);
    
    
    for (var i = 1; i < children.length; i++) {
        parentDiv.removeChild(children[i]);
    }
}
 export async function get_audio() {
    try {
        deleteItems(); 
        var parentDiv = document.getElementById("recordingItems");
        var children = parentDiv.children;
        console.log(children);
        
        
        for (var i = 1; i < children.length; i++) {
            parentDiv.removeChild(children[i]);
        }
        const user_id = localStorage.getItem('User_id');
        console.log(user_id);
        const downloadURIs = await fetchRecordings(user_id);
        console.log(downloadURIs);
        if (downloadURIs && downloadURIs.length > 0) {
            downloadURIs.forEach((uri) => {
                renderRecordingCard(uri);
                console.log(uri.downloadURL)
            });
        } else {
            console.log("No recordings found.");
        }
    } catch (error) {
        console.error('Error fetching recordings:', error);
    }
}


document.addEventListener('DOMContentLoaded', async function() {
    try {
        const name=localStorage.getItem("name");


if(name!=null){
  document.getElementById('name-user').textContent=name?` Hi ${name}`:"Hi User"
  document.getElementById('left-user').textContent=name?` ${name}`:" User";
}
window.onbeforeunload=function(){
    document.getElementById('feel-textbox').value="Enter your feelings..." 
}

setTimeout(async () => {
     const user_ids=localStorage.getItem('User_id');       
    const url= await fetchProfilePicUrl(user_ids);
    if(url !=null){
    document.getElementById('profile_img_2').src=url;
    document.getElementById('profile_img_1').src=url;
}}, 2000);


        deleteItems(); 
        const user_id = localStorage.getItem('User_id');
        console.log(user_id);
        const downloadURIs = await fetchRecordings(user_id);
        console.log(downloadURIs);
        if (downloadURIs && downloadURIs.length > 0) {
            downloadURIs.forEach((uri) => {
                renderRecordingCard(uri);
                console.log(uri.downloadURL)
            });
        } else {
            console.log("No recordings found.");
        }
    } catch (error) {
        console.error('Error fetching recordings:', error);
    }
});


const moodSwing_list=document.getElementById('MoodSing-list');moodSwing_list.addEventListener('click',ShowMoodSwing);
const Playlist_list=document.getElementById('Playlist-list');Playlist_list.addEventListener('click',ShowMoodSwing);

const Blogs_list=document.getElementById('Blogs-list');Blogs_list.addEventListener('click',ShowMoodSwing);
const Settings=document.getElementById('settings');Settings.addEventListener('click',ShowMoodSwing);



const mood_icon=document.getElementById('moodswing-icon');
const Playlist_icon=document.getElementById('Playlist-icon');

const Blogs_icon=document.getElementById('blogs-icon');

const Settings_icon=document.getElementById('setting-icon');
async function ShowMoodSwing(e){
    console.log(e.target.id);
    if(e.target.id=="MoodSing-list"){
        document.getElementById('mood-page').style.display="flex";
        document.getElementById('playlist-page').style.display="none";
        document.getElementById('Blogs').style.display="none";
        document.getElementById('settings-page').style.display="none";
        moodSwing_list.style.color="#8c52FF"
        Playlist_list.style.color="white";
        Blogs_list.style.color="white";
        Settings.style.color="white";

        mood_icon.style.color="#8c52FF";
        Playlist_icon.style.color="white";
        Blogs_icon.style.color="white";
        Settings_icon.style.color="white";



    }
    else if(e.target.id=="Playlist-list"){
        document.getElementById('mood-page').style.display="none";
        document.getElementById('playlist-page').style.display="flex";
        document.getElementById('Blogs').style.display="none";
        document.getElementById('settings-page').style.display="none";
        Playlist_list.style.color="#8c52FF";
        moodSwing_list.style.color="white"
        
        Blogs_list.style.color="white";
        Settings.style.color="white";

        mood_icon.style.color="white";
        Playlist_icon.style.color="#8c52FF";
        Blogs_icon.style.color="white";
        Settings_icon.style.color="white";
    }
    else if(e.target.id=="Blogs-list"){
        document.getElementById('mood-page').style.display="none";
        document.getElementById('playlist-page').style.display="none";
        document.getElementById('Blogs').style.display="flex";
        document.getElementById('settings-page').style.display="none";
        Playlist_list.style.color="white";
        moodSwing_list.style.color="white"
        
        Blogs_list.style.color="#8c52FF";
        Settings.style.color="white";

        mood_icon.style.color="white";
        Playlist_icon.style.color="white";
        Blogs_icon.style.color="#8c52FF";
        Settings_icon.style.color="white";
        const user_idd=localStorage.getItem('User_id');
        const data = await getAllBlogs(user_idd);
        renderBlogs(data);
    }
    else{
        document.getElementById('mood-page').style.display="none";
        document.getElementById('playlist-page').style.display="none";
        document.getElementById('Blogs').style.display="none";
        document.getElementById('settings-page').style.display="flex";
        Playlist_list.style.color="white";
        moodSwing_list.style.color="white"
        
        Blogs_list.style.color="white";
        Settings.style.color="#8c52FF";

        mood_icon.style.color="white";
        Playlist_icon.style.color="white";
        Blogs_icon.style.color="white";
        Settings_icon.style.color="#8c52FF";

        clear();
    }
}


const search_btn=document.getElementById('btn-save-blog');


search_btn.addEventListener('click', async ()=>{
     const user_iid=localStorage.getItem('User_id');

     const feeliings=document.getElementById('feel-textbox').value;
     console.log(feeliings);
     try {
        if(feeliings.length > 0  && feeliings!=="Enter Your feelings"){
            addBlog(user_iid, feeliings)
             
        }
        else{
            return
        }
     } catch (error) {
        
        console.log("Error while adding the blog :: Recording.js")
     }
     webalerts.createAlert("success","Successfully added");
      const user_idd=localStorage.getItem('User_id');
     const data = await getAllBlogs(user_idd);
     renderBlogs(data);

});
  
 async function renderBlogs(blogsData) {
    const container = document.getElementById("container");
    container.innerHTML="";
    console.log(blogsData);
     
   

   
    blogsData.forEach(blog => {

    const blogMainDiv = document.createElement("div");
    blogMainDiv.classList.add("blog-main"); 
    blogMainDiv.id=`${blog.key}`;
    const blogHeading = document.createElement("div");
    blogHeading.classList.add("blog-heading");
    const flexDiv = document.createElement("div");
    flexDiv.classList.add("flex");
    const heading = document.createElement("h3");
    heading.textContent = `Feelings at:`;
    const feel_span=document.createElement("span");
    feel_span.textContent=`${blog.date}`;
    const close_icon=document.createElement('div');
    close_icon.classList.add("ri-close-large-line");
    flexDiv.appendChild(heading);
    flexDiv.appendChild(feel_span);
    blogHeading.appendChild(flexDiv);
    
    blogHeading.appendChild(close_icon);
    blogMainDiv.appendChild(blogHeading);
    

     close_icon.addEventListener('click', async ()=>{
        const blog_id=blogMainDiv.id;
        const user_idds=localStorage.getItem('User_id');
        const bool=deleteBlogEntry(blog_id,user_idds);
         if(bool){
            container.removeChild(blogMainDiv);
            webalerts.createAlert("success","Feeling Deleted");
         } else {
            webalerts.createAlert("error","Error while deleting the feeling");
         }
        
     })

    const blogContentDiv = document.createElement("div");
    blogContentDiv.classList.add("blog-content");
    blogContentDiv.textContent=`${blog.content}`;
    console.log(blog.content);
    
    blogMainDiv.appendChild(blogContentDiv);
    container.appendChild(blogMainDiv);

     


        
    });

    
    

    
    
}


const user_setting_btn=document.getElementById('update-user-settings');

user_setting_btn.addEventListener('click',async ()=>{
    const user_name=document.getElementById('username').value;
    const user_pass=document.getElementById('password').value;
    const file=document.getElementById('file').files[0];
    
    if (!user_name.trim() || !user_pass.trim() || !file) {
        
        webalerts.createAlert("info","Please fill all the fields");
        return; 
    } 

    const user_ids=localStorage.getItem('User_id');
     
    try {
        if(user_name!=null){
            document.getElementById('name-user').textContent=user_name?` Hi ${user_name}`:"Hi User"
            document.getElementById('left-user').textContent=user_name?` ${user_name}`:" User";
          }
        localStorage.setItem('name',user_name);
        changePassword(user_pass);
        updateUserName(user_ids,user_name);
        uploadProfilePic(user_ids,file);


        setTimeout(async () => {
            
            const url= await fetchProfilePicUrl(user_ids);
            if(url !=null){
            document.getElementById('profile_img_2').src=url;
            document.getElementById('profile_img_1').src=url;
        }}, 2000);
    } catch (error) {
        webalerts.createAlert("error","Can't upload profile picture")
    }


    
})
document.addEventListener('DOMContentLoaded',clear);1


function clear(){
    document.getElementById('username').value = "";
    document.getElementById('password').value = "";
    document.getElementById('file').value = "";
}
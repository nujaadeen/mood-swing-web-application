import { saveRecording , getRecordingDownloadURL,deletePlaylistFromDatabase} from "./Db.js";
import { transcribeAudio } from './transcribe.js';
import { addToPlaylistToDatabase , fetchAllMoodsWithPlaylists,fetchNameFromDatabase} from "./Db.js";
import { get_audio } from "./Recording.js";
import { webalerts } from "./uiAlert.js";
const user_uid=localStorage.getItem("User_id");

document.getElementById('sign-out').addEventListener('click',()=>{
  sessionStorage.setItem('Sentiment',null);
  localStorage.setItem('name',null);
  localStorage.setItem('User_id',null);
  window.location.href="/";
})


const audio = document.getElementById('audioPlayer');
    const playPauseButton = document.getElementById('playPauseButton');
    const currentTimeDisplay = document.getElementById('currentTime');
    const musicRange = document.getElementById('musicRange');
   document.getElementById('startRecording').addEventListener('click',startRecording);
   document.getElementById('pauseRecording').addEventListener('click', pauseRecording);
   document.getElementById('stopRecording').addEventListener('click',stopRecording);
   document.getElementById('skipBackward').addEventListener('click',skipBackward);
   document.getElementById('playPauseButton').addEventListener('click',togglePlayPause);
   document.getElementById('skipForward').addEventListener('click', skipForward);
    let isPlaying = false;

    function togglePlayPause() {
      if (isPlaying) {
        audio.pause();
        clearInterval(timerInterval);
      } else {
        audio.play();
        timerInterval=setInterval(updateTimer,1000);

      }

      isPlaying = !isPlaying;
      updatePlayPauseIcon();

      if(isPlaying){
        updateProgress();
      }
    }

    function updatePlayPauseIcon() {
      playPauseButton.className = isPlaying ? 'ri-pause-circle-fill' : 'ri-play-circle-fill';
    }

    function skipBackward() {
      audio.currentTime -= 5; 
    }

    function skipForward() {
      audio.currentTime += 5; // Skip forward 5 seconds
    }
    const show_div=document.getElementById('show-song');
    
   

  
    
    
  
     
    function updateProgress() {
      
      

      const progress = (audio.currentTime / audio.duration) * 100;
      musicRange.value = progress;
    }

    function formatTime(time) {
      if (isNaN(time)  || !isFinite(time)) return '--:--';
      const minutes = Math.floor(time / 60);
      const seconds = Math.floor(time % 60);
      console.log(minutes,seconds);
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      }

    musicRange.addEventListener('input', () => {
      const seekTime = (musicRange.value / 100) * audio.duration;
      audio.currentTime = seekTime;
    });

    audio.addEventListener('durationchange', function () {
      
      updateProgress();
    });

    let mediaRecorder;
    let audioChunks = [];
    let startTime;
    let timerInterval;
    let mediaStream;

    async function startRecording() {
      show_div.style.display = "none";
      sessionStorage.setItem("Sentiment", null);
      audioChunks = [];
      document.getElementById('player-card').style.display = "none";
      document.getElementById('recorder').style.display = "flex";
      document.getElementById('FindSong').disabled = true;
  
      const constraints = {
          audio: {
              channelCount: 2, // Request stereo audio
              sampleRate: 44100, // Optionally specify sample rate
              echoCancellation: true // Optionally enable echo cancellation
          }
      };
  
      try {
          mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
          mediaRecorder = new MediaRecorder(mediaStream);
          mediaRecorder.ondataavailable = (event) => {
              if (event.data.size > 0) {
                  audioChunks.push(event.data);
              }
          };
  
          let arr = null;
  
          mediaRecorder.onstop = async () => {
            console.log("media pehla wla",updateTimer() )
            const timee=updateTimer();
            
            currentTimeDisplay.textContent=timee;
              mediaStream.getTracks().forEach(track => track.stop()); // Stop all tracks in the media stream
              const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
              const audioUrl = URL.createObjectURL(audioBlob);
              document.getElementById('audioPlayer').src = audioUrl;
              arr = await saveRecording(audioBlob,timee);
  
              const [bool, Song_id] = arr;
              if (bool) {
                  let user_idd = localStorage.getItem('User_id');
                  if (user_idd) {
                      const song_url = await getRecordingDownloadURL(user_idd, Song_id);
                      console.log("Received audio URL:", song_url);
                      document.getElementById('audioPlayer').src = song_url;
                      document.getElementById('FindSong').disabled = false;
                      get_audio();
                  }
              }
  
              console.log(arr);
          };
  
          startTime = new Date().getTime();
          timerInterval = setInterval(updateTimer, 1000);
  
          mediaRecorder.start();
      } catch (error) {
          console.error('Error accessing microphone:', error);
      }
  }
  
  function pauseRecording() {
      mediaRecorder.pause();
      clearInterval(timerInterval);
  }
  
  window.onload = () => {
      document.getElementById('FindSong').disabled = true;
  }
  
  function stopRecording() {
      mediaRecorder.stop();
  
      clearInterval(timerInterval);
      updateTimer();
      webalerts.createAlert("Success", "Audio Recorded Sussesfully");
      document.getElementById('recorder').style.display = "none";
      document.getElementById('player-card').style.display = "flex";
      updateProgress();
      console.log(audioChunks, "Moddswing.js");
  }

    function updateTimer() {
      const currentTime = Math.floor((new Date().getTime() - startTime) / 1000);
      const hours = Math.floor(currentTime / 3600);
      const minutes = Math.floor((currentTime % 3600) / 60);
      const seconds = currentTime % 60;
      
      document.getElementById('timer').textContent = `${hours}:${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
      return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
   
    }

    const MoodSingpage=document.getElementById('MoodSing-list');
    const playListpage=document.getElementById('Playlist-list');
    const moodcontainer=document.getElementById('mood-page');
    const  playlistcontainer=document.getElementById("playlist-page");
    
  

    playListpage.addEventListener('click', async ()=>{
      const playlist= await fetchAllMoodsWithPlaylists();
          console.log(playlist ,"Fetched playlist");
         renderPlaylists(playlist);
    })

    function renderPlaylists(playlistsData) {

      // Select the main container where playlists will be appended
      const mainContainer = document.querySelector('.Playlists-from-db');
  
      // Clear any existing content in the main container
      mainContainer.innerHTML = '';
  
      // Iterate over each mood and its playlists
      playlistsData.forEach(playlistObject => {
          // Create the main container for each mood
          const moodContainer = document.createElement('div');
          moodContainer.classList.add('sad');
  
          // Create the header container for the mood
          const headerContainer = document.createElement('div');
          headerContainer.classList.add('sad-header');
  
          // Create the mood span and set its text content
          const moodSpan = document.createElement('span');
          moodSpan.textContent = playlistObject.mood;
  
          // Append the mood span to the header container
          headerContainer.appendChild(moodSpan);
  
          // Create the container for the playlists
          const playlistsContainer = document.createElement('div');
          playlistsContainer.classList.add('playlists-container');
  
          // Iterate over each playlist in the current mood
          playlistObject.playlists.forEach(playlist => {
              // Create the container for the playing card
              const playingCard = document.createElement('div');
              playingCard.classList.add('playing-card');
  
              // Create the controls container
              const controls = document.createElement('div');
              controls.classList.add('controls');
  
              // Create the slidebar container
              const slidebar = document.createElement('div');
              slidebar.classList.add('slidebar', 'slidebars');
  
              // Create the range input element
              const rangeInput = document.createElement('input');
              rangeInput.setAttribute('type', 'range');
              rangeInput.setAttribute('min', '0');
              rangeInput.setAttribute('id', 'playerranges');
  
              // Add an event listener to seek to the position indicated by the range input
              rangeInput.addEventListener('input', () => {
                  const audio = playingCard.querySelector('audio');
                  audio.currentTime = rangeInput.value;
              });
  
              // Append the range input to the slidebar container
              slidebar.appendChild(rangeInput);
  
              // Create the lower container for skip icons
              const lowerContainer = document.createElement('div');
              lowerContainer.classList.add('lower', 'lower-cards');
              lowerContainer.style.fontSize = '1.2rem';
              lowerContainer.style.width="80%";
  
              // Create the skip back icon
              const skipBackIcon = document.createElement('i');
              skipBackIcon.classList.add('ri-skip-back-fill');
              skipBackIcon.addEventListener('click', () => {
                  const audio = playingCard.querySelector('audio');
                  audio.currentTime -= 5;
              });
  
              // Create the play/pause icon
              const playPauseIcon = document.createElement('i');
              playPauseIcon.classList.add('ri-play-circle-fill');
              playPauseIcon.setAttribute('id', 'playPauseButton');
              playPauseIcon.addEventListener('click', () => {
                  const audio = playingCard.querySelector('audio');
                  if (audio.paused) {
                      audio.play();
                      playPauseIcon.classList.remove('ri-play-circle-fill');
                      playPauseIcon.classList.add('ri-pause-circle-fill');
                  } else {
                      audio.pause();
                      playPauseIcon.classList.remove('ri-pause-circle-fill');
                      playPauseIcon.classList.add('ri-play-circle-fill');
                  }
              });
  
              // Create the skip forward icon
              const skipForwardIcon = document.createElement('i');
              skipForwardIcon.classList.add('ri-skip-forward-fill');
              skipForwardIcon.addEventListener('click', () => {
                  const audio = playingCard.querySelector('audio');
                  audio.currentTime += 5;
              });

              const delte=document.createElement("i");
              delte.classList.add('ri-delete-bin-3-fill');
              
              delte.dataset.playlistId = playlist.id;
              delte.dataset.playlistMood = playlistObject.mood;
              
              delte.addEventListener("click", async () => {
                // Retrieve playlist ID and mood from dataset attributes of delte element
                const playlistId = delte.dataset.playlistId;
                const playlistMood = delte.dataset.playlistMood;
                console.log(playlistId,playlistMood)
                const user_id=localStorage.getItem("User_id");
                console.log(user_id);
                // Delete playlist from Firebase Realtime Database
                await deletePlaylistFromDatabase(user_id,playlistMood, playlistId,)
                .then(()=>{
                  const playingCard = delte.closest('.playing-card');
                  if (playingCard) {
                      playingCard.remove();
                      webalerts.createAlert("Success","Deleted successfully")
                  }
                }).catch((err)=>webalerts.createAlert("Error","Unable to delete"));
           
           
           
              });
  
              // Append skip icons to the lower container
              lowerContainer.appendChild(skipBackIcon);
              lowerContainer.appendChild(playPauseIcon);
              lowerContainer.appendChild(skipForwardIcon);
              lowerContainer.appendChild(delte);
  
              // Append slidebar and lower container to controls container
              controls.appendChild(slidebar);
              controls.appendChild(lowerContainer);
  
              // Create the audio element
              const audioElement = document.createElement('audio');
              audioElement.src = playlist.link;
  
              // Add an event listener to update the range input's value
              audioElement.addEventListener('timeupdate', () => {
                  rangeInput.value = audioElement.currentTime;
              });
  
              // Add an event listener to synchronize range input change with audio playback position
              rangeInput.addEventListener('input', () => {
                  audioElement.currentTime = rangeInput.value;
              });
              
              audioElement.addEventListener('loadedmetadata', () => {
                // Set the max attribute of the range input to the duration of the audio
                rangeInput.setAttribute('max', audioElement.duration);
            });
            audioElement.addEventListener('timeupdate', () => {
              rangeInput.value = audioElement.currentTime;
          });

              // Append controls and audio element to the playing card
              playingCard.appendChild(controls);
              playingCard.appendChild(audioElement);
  
              // Create the image container
              const imgPlayContainer = document.createElement('div');
              imgPlayContainer.classList.add('img-play');
  
              // Create the image element
              const imgElement = document.createElement('img');
              imgElement.setAttribute('src', playlist.image);
              imgElement.setAttribute('alt', '');
  
              // Append image to the image container
              imgPlayContainer.appendChild(imgElement);
  
              // Append the image container to the playing card
              playingCard.appendChild(imgPlayContainer);
              
              
              // Append the playing card to the playlists container
              playlistsContainer.appendChild(playingCard);
          });
           
     

          // Append the header container and playlists container to the mood container
          moodContainer.appendChild(headerContainer);
          moodContainer.appendChild(playlistsContainer);
  
          // Append the mood container to the main container
          mainContainer.appendChild(moodContainer);
      });
  }
  
  

    

   // Function to add event listeners to dynamically created cards
   function addCardEventListeners(cards) {
    cards.forEach(card => {
        // Add event listener to the playlist icon in each card
        const playlistIcon = card.querySelector('.playlist-icon');
        // console.log(playlistIcon, "playlisticsons");
        playlistIcon.addEventListener('click', function (event) {
            const mood = document.getElementById('SAD').textContent;
            const index = Array.from(card.parentNode.children).indexOf(card);
            let previewUrls = JSON.parse(sessionStorage.getItem('previewUrls'));
            if (previewUrls && Array.isArray(previewUrls) && index < previewUrls.length) {
                const previewUrl = previewUrls[index];
                const musicLogo = card.querySelector('.music-logo img');
                const musicText = card.querySelector('.music-text span');
                const imageUrl = musicLogo ? musicLogo.getAttribute('src') : null;
                const songName = musicText ? musicText.textContent : null;
                // console.log(imageUrl,songName,"Image and Song Name");
                addToPlaylistToDatabase(previewUrl, mood, imageUrl, songName);
                webalerts.createAlert("Success", "Added To Playlist");
            } else {
                console.error("Invalid index or previewUrls array is missing or invalid");
                webalerts.createAlert("Error","unable to add to the playlist")
            }
        });
    });
}


function handleContainerChanges(mutationsList, observer) {
  mutationsList.forEach(mutation => {
      if (mutation.type === 'childList') {
          // If child elements are added or removed
          const addedNodes = Array.from(mutation.addedNodes);
          const cards = addedNodes.filter(node => node.classList && node.classList.contains('card-design'));
          if (cards.length > 0) {
              // If new cards are added, add event listeners to them
              addCardEventListeners(cards);
          }
      }
  });
}


const songListContainer = document.getElementById('songList');


const config = { childList: true };

// Create a new observer instance
const observer = new MutationObserver(handleContainerChanges);


observer.observe(songListContainer, config);

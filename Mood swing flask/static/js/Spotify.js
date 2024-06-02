


let audioPlayers = [];
let currentPlayPauseButton = null;

function authenticate() {
const clientId = 'fbf8d98118b146f98869ecb2c789015b';
const redirectUri = encodeURIComponent('http://127.0.0.1:5000/dash');
const scopes = 'user-read-private user-read-email'; // Add any necessary scopes

window.location.href = `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scopes}&response_type=token`;
}


const show_div=document.getElementById('show-song');
function getAccessTokenFromHash() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
    }
    
    // Function to search for sad songs
    async function searchSadSongs(query, accessToken) {
        // Search for playlists containing sad songs
        const playlistsResponse = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=playlist`, {
            headers: {
                'Authorization': 'Bearer ' + accessToken
            }
        });
        const playlistsData = await playlistsResponse.json();
    
        // Extract playlist IDs from the search results
        const playlistIds = playlistsData.playlists.items.map(playlist => playlist.id);
    
        // Retrieve tracks from each playlist
        const trackPromises = playlistIds.map(async playlistId => {
            const tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
                headers: {
                    'Authorization': 'Bearer ' + accessToken
                }
            });
            const tracksData = await tracksResponse.json();
            
            return tracksData.items.map(item => item.track);
        });
    
        
        const allTracks = await Promise.all(trackPromises);
        console.log(allTracks.flat());
        return allTracks.flat();
    }
    
    
    function playPreview(previewUrl, playPauseButton, index) {
    
    if (currentPlayPauseButton && currentPlayPauseButton !== playPauseButton) {
    const prevIndex = parseInt(currentPlayPauseButton.getAttribute('data-index'));
    audioPlayers[prevIndex].pause();
    currentPlayPauseButton.classList.remove('ri-pause-circle-fill');
    currentPlayPauseButton.classList.add('ri-play-circle-fill');
    }
    
    if (!audioPlayers[index] || currentPlayPauseButton !== playPauseButton) {
    // Play the new song
    audioPlayers[index] = new Audio(previewUrl);
    audioPlayers[index].play();
    currentPlayPauseButton = playPauseButton;
    currentPlayPauseButton.setAttribute('data-index', index);
    playPauseButton.classList.remove('ri-play-circle-fill');
    playPauseButton.classList.add('ri-pause-circle-fill');
    
    // Update song range input as the song progresses
    audioPlayers[index].addEventListener('timeupdate', () => {
        const songRange = document.getElementById(`songRange_${index}`);
        if (songRange && audioPlayers[index].duration) {
            songRange.value = (audioPlayers[index].currentTime / audioPlayers[index].duration) * 100;
        }
    });
    } else {
    // Pause the current song if the same button is clicked again
    currentPlayPauseButton = null;
    playPauseButton.classList.remove('ri-pause-circle-fill');
    playPauseButton.classList.add('ri-play-circle-fill');
    audioPlayers[index].pause();
    }
    }function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }
    function displaySadSongss(sadSongs){
        const songListContainer = document.getElementById('songList');
        songListContainer.innerHTML = '';
        let previewUrls = [];
        sadSongs = shuffleArray(sadSongs);
        // Loop over the first 30 songs in the sadSongs array
        for (let index = 0; index < 40 && index < sadSongs.length; index++) {
            const song = sadSongs[index];
            if (song.preview_url) {
                previewUrls.push(song.preview_url);
                const songItem = document.createElement('div');
                songItem.classList.add('card-design');
                // Check if the album images array and other required properties exist
                if (song.album && song.album.images && song.album.images.length > 0) {
                    songItem.innerHTML = `
                        <div class="logo-music-text-div">
                            <div class="music-logo">
                                <img src="${song.album.images[0].url}"  alt="${song.name}">
                            </div>
                            <div class="music-text">
                                <span>${song.name}</span>
                            </div>
                        </div>
                        <div class="slidebar">
                            <input type="range" min="0" max="100" value="0" id="songRange_${index}">
                        </div>
                        <div class="lower lower-card">
                            <i class="ri-skip-back-fill" onclick="skipSong(${index}, -5)"></i>
                            <i class="ri-play-circle-fill" id="play-link_${index}" onclick="playPreview('${song.preview_url}', this, ${index})" data-preview-url="${song.preview_url}"></i>
                            <i class="ri-skip-forward-fill" onclick="skipSong(${index}, 5)"></i>
                            <i class="ri-play-list-fill playlist-icon"></i>
                        </div>
                        <div class="volume">
                            <i class="ri-volume-down-line"></i>
                            <input type="range" min="0" max="100" value="100" id="volumeRange_${index}">
                        </div>
                    `;
                    songListContainer.appendChild(songItem);
    
                    const volumeRange = document.getElementById(`volumeRange_${index}`);
                    volumeRange.addEventListener('input', () => {
                        if (audioPlayers[index]) {
                            audioPlayers[index].volume = volumeRange.value / 100;
                        }
                    });
    
                    const songRange = document.getElementById(`songRange_${index}`);
                    songRange.addEventListener('input', () => {
                        if (audioPlayers[index]) {
                            audioPlayers[index].currentTime = (songRange.value / 100) * audioPlayers[index].duration;
                        }
                    });
                } else {
                    console.error('Missing album images or other required properties for song at index', index, song);
                }
            }
        }
        console.log(previewUrls,"Preview URL");
    
        sessionStorage.setItem('previewUrls', JSON.stringify(previewUrls));
    }
    
    // Function to display the list of sad songs
   
    
    function skipSong(index, seconds) {
        if (audioPlayers[index]) {
            audioPlayers[index].currentTime += seconds;
        }
    }
    

const btn_search=document.getElementById('FindSong');
btn_search.addEventListener("click",SearchSong);
console.log(btn_search)

const categories = {
    "NEUTRAL": [
       
       
      
      "Most Famous English",
        
    ],
    "POSITIVE": [
        "Most Famous English",
        
    ],
    "NEGATIVE": ["Sad songs Englsih", "Melancholic melodies", "Emotional ballads"]
};

function selectSongCategory(sentiment) {
    const categoryList = categories[sentiment];
    return categoryList[Math.floor(Math.random() * categoryList.length)];
}
const sad=document.getElementById('SAD');
function recommendSongsBySentiment(sentiment) {
    let songCategory;
    switch (sentiment) {
        case "NEUTRAL":
            sad.textContent = "Neutral";
            break;
        case "POSITIVE":
            sad.textContent = "Very Happy";
            break;
        case "NEGATIVE":
            sad.textContent = "Sad";
            break;
        default:
            sad.textContent = "Does not capture your feelings";
            break;
    }
   
    songCategory = selectSongCategory(sentiment);
    return songCategory;
}

async function transcribeAudio(audioURL) {
    try {
        // Fetch the transcription endpoint with the audio URL
        const response = await fetch('/transcribe_audio', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ audioURL }) // Send the audio URL in the body
        });

        // Check if the response is ok
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        // Parse the response JSON
        let data = await response.json();
         sessionStorage.setItem('Sentiment',data.overall_sentiment)
        // Handle transcription data as needed
        return [data.overall_sentiment, data.sentiment_analysis ]
        console.log(data.overall_sentiment,"yahe ha dora wla");
    } catch (error) {
        console.error('Error:', error);
        // Handle error as needed
    }
}
const lodder=document.getElementById("disp_loader");


async function SearchSong() {
    console.log("Function is called");
    const accessToken = getAccessTokenFromHash();
    lodder.style.display = "inline-block";
    if (accessToken) {
        // Access token is present, you can now make requests to Spotify API
        console.log("Access token:", accessToken);
        const audioPlayer_2 = document.getElementById('audioPlayer');
        const src_player = audioPlayer_2.src;

        try {
            const transcription = await transcribeAudio(src_player);
            const [sentiment,data]=transcription;
            console.log(data);
             document.getElementById('result-sentimnet').innerHTML=data[0].text;
            document.getElementById('result-type').innerHTML=sentiment
           document.getElementById('Score').innerHTML=data[0].confidence;
            document.getElementById('show_results').style.display="flex";
            show_div.style.display = "flex";
            
            if (sentiment != null) {
                console.log(sentiment, "is the Sentiment");
                let songCategory = recommendSongsBySentiment(sentiment);
                const query = songCategory + " "; // Adding random element
                console.log("Query: ", query);
                console.log(accessToken);

                searchSadSongs(query, accessToken)
                    .then(sadSongs => {
                        displaySadSongss(sadSongs);
                    })
                    .catch(error => console.error('Error searching for songs:', error));
            } else {
                // alert("Record the audio first or transcription failed");
            }
        } catch (error) {
            console.error('Error transcribing audio:', error);
            alert("Error transcribing audio. Please try again.");
        }

        lodder.style.display = "none";
    } else {
        // Access token is not present, redirect user for authentication
        authenticate();
    }
}

// authenticate();


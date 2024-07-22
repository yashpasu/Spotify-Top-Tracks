
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    const artistNameInput = document.getElementById('artist-name');
    const countryNameInput = document.getElementById('country-name');
    const tracksList = document.getElementById('tracks-list');
    const chatForm = document.getElementById('chat-form');
    const chatMessageInput = document.getElementById('chat-message');
    const chatBox = document.getElementById('chat-box');

    //Create websocket connection
    const ws = new WebSocket('ws://localhost:3306');

    //Handle WebSocket connection
    ws.addEventListener('open', () => {
        console.log('WebSocket connected');
    });

    //Get message from websocket messages
    ws.addEventListener('message', (event) => {
        const { user, message } = JSON.parse(event.data);
        displayChatMessage(user, message);
    });

    //Spotify API credentials (access token)
    const clientId = 'b9a50bf9d19643abb5c390f34fe71990';
    const clientSecret = '3045cfdabacb4110b9f3b63cae17c4fe';

    //Function to get Spotify access token
    async function getAccessToken() {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': 'Basic ' + btoa(`${clientId}:${clientSecret}`)
            },
            body: 'grant_type=client_credentials'
        });
        const data = await response.json();
        return data.access_token;
    }


    //Deal with user input for search form.
    searchForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const artistName = artistNameInput.value;

        // If the user doesnt enter a country code get it from API
        let countryName = await getUserLocation();
        if (countryNameInput.value == null || countryNameInput.value.trim() === ''){
             countryName = await getUserLocation();
        }
        else {    
            countryName = countryNameInput.value;
        }


        
        try {
            //Fetch response from spotify api using access key
            const accessToken = await getAccessToken();
            const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(artistName)}&type=artist`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const data = await response.json();
            const artistId = data.artists.items[0].id;

            //Fetch the tracks based on user input
            const tracksResponse = await fetch(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${countryName}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            const tracksData = await tracksResponse.json();
            const tracks = tracksData.tracks;

            
            //Display tracks
            tracksList.innerHTML = '';
            tracks.slice(0, 10).forEach(track => { // Get top 10 tracks
                const trackDiv = document.createElement('div');
                trackDiv.innerHTML = `<p>${track.name} - ${track.album.name} <a href="${track.external_urls.spotify}" target="_blank">Listen</a></p>`;
                tracksList.appendChild(trackDiv);

            });

            //Create api call to execute insert into statement for the users search
            const tracksCount = await getAllTracksFromArtist(artistId, accessToken);
            const insertQuery = await fetch(`http://localhost:3306/api/top-tracks?artistName=${encodeURIComponent(artistName)}&countryName=${encodeURIComponent(countryName)}&tracksLength=${encodeURIComponent(tracksCount)}`, {method:"POST"});
            
        } 
        catch (error) {
            console.error('Error fetching top tracks:', error);
        }
    });

    //Deal with the chat button clicked
    chatForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const chatMessage = chatMessageInput.value.trim();
        if (chatMessage) {
            ws.send(JSON.stringify({ user: '-', message: chatMessage }));
            chatMessageInput.value = '';
        }
    });

    //Function to display chat messages
    function displayChatMessage(user, message) {
        const messageDiv = document.createElement('div');
        messageDiv.textContent = `${user}: ${message}`;
        chatBox.appendChild(messageDiv);
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    
     //Function to fetch artist's albums
     async function getArtistAlbums(artistId, accessToken) {
        const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album&limit=50`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        return data.items;
    }

    //Function to fetch tracks from each album
    async function getAlbumTracks(albumId, accessToken) {
        const response = await fetch(`https://api.spotify.com/v1/albums/${albumId}/tracks?limit=50`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        const data = await response.json();
        return data.items;
    }

    //Function to fetch all tracks from an artist
    async function getAllTracksFromArtist(artistId, accessToken) {
        const albums = await getArtistAlbums(artistId, accessToken);
        let allTracks = [];

        for (const album of albums) {
            const tracks = await getAlbumTracks(album.id, accessToken);
            allTracks = allTracks.concat(tracks);
            alltracksCount = allTracks.length
        }

        return alltracksCount;
    }

    //Function to get users location
    async function getUserLocation() {
        const response = await fetch('https://ipinfo.io/json?token=0903f5d26cd53a'); 
        const countryData = await response.json();
        return countryData.country;
    }
    
    


});

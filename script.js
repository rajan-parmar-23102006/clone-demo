// Data
let songs = [

  {
    title: "Ram Siya Ram",
    artist: "Sachet Tandon, Parampara Tandon",
    album: "Adipurush",
    duration: "3:50",
    src: "Ram Siya Ram.mp3",
    img: "ram.jpeg"
  },

  {
    title: "Bolo Har Har Har",
    artist: "Mithoon",
    album: "Heeriye",
    duration: "3:14",
    src: "Bolo Har Har Har.mp3",
    img: "shivaay.jpeg"
  },
  {
    title: "krishna dhun",
    artist: "rajan parmar",
    album: "Onyx",
    duration: "4:00",
    src: "krishna-flute.mp3",
    img: "krishna.jpeg"
  },
  {
    title: "Ram Aayenge",
    artist: "vishal mishra",
    album: "Final Girl",
    duration: "3:35",
    src: "Ram Aayenge.mp3",
    img: "Ramimage.jpg"
  },
    {
    title: "Shiv kailaaso ke waasi",
    artist: "hansraaj raghuvanshi",
    album: "Final Girl",
    duration: "3:35",
    src: "Shiv kailaaso ke waasi.mp3",
    img: "Shiv kailaaso ke waasi image.jpeg"
  },
  {
  title: "Kesariya",
  artist: "Arijit Singh",
  album: "Brahmāstra",
  duration: "4:28",
  src: "kesariyasong.mp3",
  img: "kesariyajpg.jpg"
},
{
  title: "Naatu Naatu",
  artist: "Rahul Sipligunj, Kaala Bhairava",
  album: "RRR",
  duration: "3:35",
  src: "Naacho Naacho song.mp3",
  img: "Naatu_Naatu.jpg"
},
{
  title: "satranga",
  artist: "Rahul Sipligunj, Kaala Bhairava",
  album: "RRR",
  duration: "3:35",
  src: "Satranga Animal song.mp3",
  img: "satrangaimg.jpeg"
},
{
  title: "Apna Bana",
  artist: "Rahul Sipligunj, Kaala Bhairava",
  album: "RRR",
  duration: "3:35",
  src: "apna bana Le song.mp3",
  img: "apna banale img.jpeg"
},
];
// Load saved play counts from localStorage (if available)
const savedSongData = JSON.parse(localStorage.getItem("songsData"));
if (savedSongData) {
  // Merge saved plays into current songs
  songs = songs.map((song, index) => ({
    ...song,
    plays: savedSongData[index]?.plays || 0
  }));
}


let playlists = {
  happy: {
    name: "Happy Hits",
    description: "Today's happy songs",
    image: "https://via.placeholder.com/150/1db954/ffffff?text=Happy+Hits",
    songs: [0, 1] // indexes from songs
  },
  lofi: {
    name: "Lofi Sleep",
    description: "Chill beats to relax",
    image: "https://via.placeholder.com/150/1db954/ffffff?text=Lofi+Sleep",
    songs: [2, 3]
  }
};

let userPlaylists = {};
let currentSongIndex = 0;
let audio = new Audio();
let isPlaying = false;
let currentMenuSongIndex = null;
let savedSongs = [];
let currentPage = 'home';

// DOM Elements
const playBtn = document.getElementById("play");
const prevBtn = document.getElementById("prev");
const nextBtn = document.getElementById("next");
const progressBar = document.getElementById("progress-bar");
const volumeControl = document.getElementById("volume");
const songTitle = document.getElementById("song-title");
const songArtist = document.getElementById("song-artist");
const songImg = document.getElementById("current-song-img");
const currentTimeEl = document.getElementById("current-time");
const totalTimeEl = document.getElementById("total-time");
const allSongsList = document.getElementById("all-songs");
const recentGrid = document.getElementById("recent-grid");
const mixesGrid = document.getElementById("mixes-grid");
const playlistsContainer = document.getElementById("playlists");
const userPlaylistsContainer = document.getElementById("user-playlists");
const songMenu = document.getElementById("song-menu");
const playlistSelectMenu = document.getElementById("playlist-select-menu");
const overlay = document.getElementById("overlay");
const saveSongBtn = document.getElementById("save-song-btn");
const librarySongsList = document.getElementById("library-songs");
const mobileMenuBtn = document.getElementById("mobileMenuBtn");
const sidebar = document.getElementById("sidebar");
const homePage = document.getElementById("home-page");
const searchPage = document.getElementById("search-page");
const libraryPage = document.getElementById("library-page");
const searchInput = document.getElementById("search-input");
const createPlaylistBtn = document.getElementById("create-playlist-btn");
const createPlaylistConfirm = document.getElementById("create-playlist-confirm");
const backToSongMenuBtn = document.getElementById("back-to-song-menu");
const trendingGrid = document.getElementById("trending-grid");

// Initialize the app
function init() {
  loadSong(currentSongIndex, false); // ⬅️ do NOT autoplay or increase plays on refresh

  renderAllSongs();
  renderRecentSongs();
  renderTrendingSongs();
  renderMixes();
  renderPlaylists();
  loadUserPlaylists();
  loadSavedSongs();
  setupEventListeners();
  updateSaveButton();
}


// Render trending songs
function renderTrendingSongs() {
  trendingGrid.innerHTML = '';

  // Sort by plays (highest first) and take top 5
  const trending = [...songs].sort((a, b) => (b.plays || 0) - (a.plays || 0)).slice(0, 5);

  trending.forEach((song) => {
    const actualIndex = songs.indexOf(song);
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.setAttribute('data-song-index', actualIndex);
    card.innerHTML = `
      <div class="card-img">
        <img src="${song.img}" alt="${song.title}">
        <button class="play-btn"><i class="fas fa-play"></i></button>
      </div>
      <p class="card-title">${song.title}</p>
      <p class="card-desc">${song.artist}</p>
      <small>Plays: ${song.plays || 0}</small>
    `;

    card.addEventListener('click', () => {
      loadSong(actualIndex);
    });

    trendingGrid.appendChild(card);
  });
}


// Setup event listeners
function setupEventListeners() {
  playBtn.addEventListener("click", togglePlay);
  prevBtn.addEventListener("click", playPrevSong);
  nextBtn.addEventListener("click", playNextSong);

  audio.addEventListener("timeupdate", updateProgress);
  audio.addEventListener("ended", playNextSong);
  audio.addEventListener("loadedmetadata", updateDuration);

  progressBar.addEventListener("input", seekAudio);
  volumeControl.addEventListener("input", setVolume);

  // Close menus when clicking overlay
  overlay.addEventListener("click", closeAllMenus);


  // Player menu button
  document.getElementById("player-menu-btn").addEventListener("click", function () {
    openSongMenu(currentSongIndex);
  });

  // Save song button
  saveSongBtn.addEventListener("click", saveCurrentSong);

  // Navigation items
  document.querySelectorAll('.nav li').forEach(item => {
    item.addEventListener('click', function () {
      const page = this.getAttribute('data-page');
      navigateTo(page);
    });
  });

  // Mobile menu button
  mobileMenuBtn.addEventListener('click', function () {
    sidebar.classList.toggle('active');
  });

  // Search input
  searchInput.addEventListener('input', function () {
    performSearch(this.value);
  });

  // Create playlist button
  createPlaylistBtn.addEventListener('click', showCreatePlaylistModal);

  // Create playlist confirm button
  createPlaylistConfirm.addEventListener('click', createPlaylist);

  // Back to song menu button
  backToSongMenuBtn.addEventListener('click', backToSongMenu);

  // Close modal buttons
  document.querySelectorAll('.close, .cancel-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const modalId = this.getAttribute('data-modal') || this.parentElement.getAttribute('data-modal');
      closeModal(modalId);
    });
  });

  // Menu items with data-action attributes
  document.querySelectorAll('.menu-item[data-action]').forEach(item => {
    item.addEventListener('click', function () {
      const action = this.getAttribute('data-action');
      if (typeof window[action] === 'function') {
        window[action]();
      }
    });
  });

  // Playlist cards with data attributes
  document.querySelectorAll('.playlist-card[data-playlist]').forEach(card => {
    card.addEventListener('click', function () {
      const playlistId = this.getAttribute('data-playlist');
      openPlaylist(playlistId);
    });
  });

  // Category cards with data attributes
  document.querySelectorAll('.playlist-card[data-category]').forEach(card => {
    card.addEventListener('click', function () {
      const category = this.getAttribute('data-category');
      searchCategory(category);
    });
  });
}

// Navigate to different pages
function navigateTo(page) {
  currentPage = page;

  // Update active nav item
  document.querySelectorAll('.nav li').forEach(item => {
    item.classList.remove('active');
    if (item.getAttribute('data-page') === page) {
      item.classList.add('active');
    }
  });

  // Show the correct page content
  homePage.style.display = page === 'home' ? 'block' : 'none';
  searchPage.style.display = page === 'search' ? 'block' : 'none';
  libraryPage.style.display = page === 'library' ? 'block' : 'none';

  // If library page, render saved songs
  if (page === 'library') {
    renderLibrarySongs();
  }

  // Close sidebar on mobile after selection
  if (window.innerWidth <= 768) {
    sidebar.classList.remove('active');
  }
}

// ✅ Improved Perform search
function performSearch(query) {
  const resultsContainer = document.getElementById('search-results');
  resultsContainer.innerHTML = ''; // clear previous

  if (!query.trim()) {
    resultsContainer.innerHTML = `
      <h3>Browse all</h3>
      <div class="grid" id="search-grid">
        <div class="playlist-card" data-category="Pop">
          <div class="card-img">
            <img src="https://via.placeholder.com/150/1db954/ffffff?text=Pop" alt="Pop">
          </div>
          <p class="card-title">Pop</p>
        </div>
        <div class="playlist-card" data-category="Rock">
          <div class="card-img">
            <img src="https://via.placeholder.com/150/1db954/ffffff?text=Rock" alt="Rock">
          </div>
          <p class="card-title">Rock</p>
        </div>
        <div class="playlist-card" data-category="Hip Hop">
          <div class="card-img">
            <img src="https://via.placeholder.com/150/1db954/ffffff?text=Hip+Hop" alt="Hip Hop">
          </div>
          <p class="card-title">Hip Hop</p>
        </div>
        <div class="playlist-card" data-category="Electronic">
          <div class="card-img">
            <img src="https://via.placeholder.com/150/1db954/ffffff?text=Electronic" alt="Electronic">
          </div>
          <p class="card-title">Electronic</p>
        </div>
      </div>
    `;
    return;
  }

  const results = songs.filter(song =>
    song.title.toLowerCase().includes(query.toLowerCase()) ||
    song.artist.toLowerCase().includes(query.toLowerCase()) ||
    song.album.toLowerCase().includes(query.toLowerCase())
  );

  if (results.length === 0) {
    resultsContainer.innerHTML = `<h3>No results found for "${query}"</h3>`;
    return;
  }

  resultsContainer.innerHTML = `<h3>Results for "${query}"</h3><div class="grid" id="search-grid"></div>`;
  const searchGrid = document.getElementById('search-grid');

  results.forEach(song => {
    const actualIndex = songs.indexOf(song);
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.innerHTML = `
      <div class="card-img">
        <img src="${song.img}" alt="${song.title}">
        <button class="play-btn"><i class="fas fa-play"></i></button>
      </div>
      <p class="card-title">${song.title}</p>
      <p class="card-desc">${song.artist}</p>
    `;

    // ✅ Play song when clicked
    card.addEventListener('click', () => {
      loadSong(actualIndex);
    });

    searchGrid.appendChild(card);
  });
}
// Search by category
function searchCategory(category) {
  searchInput.value = category;
  performSearch(category);
}

// Load a song
// Load a song
function loadSong(index, autoPlay = true) {
  if (songs.length === 0) return;

  currentSongIndex = index;
  const song = songs[currentSongIndex];

  audio.src = song.src;
  songTitle.textContent = song.title;
  songArtist.textContent = song.artist;
  songImg.src = song.img;

  // Update menu song info if menu is open
  if (songMenu.classList.contains('active')) {
    document.getElementById("menu-song-title").textContent = song.title;
    document.getElementById("menu-song-artist").textContent = song.artist;
    document.getElementById("menu-song-img").src = song.img;
  }

  updateSaveButton();

  // ✅ Only autoplay + count plays if user clicked play
  if (autoPlay) {
    song.plays = (song.plays || 0) + 1;   
    localStorage.setItem("songsData", JSON.stringify(songs)); // save plays
    playSong();
    renderTrendingSongs();
  }
}



// Play song
function playSong() {
  audio.play();
  isPlaying = true;
  playBtn.innerHTML = '<i class="fas fa-pause"></i>';
}

// Pause song
function pauseSong() {
  audio.pause();
  isPlaying = false;
  playBtn.innerHTML = '<i class="fas fa-play"></i>';
}

// Toggle play/pause
function togglePlay() {
  if (isPlaying) {
    pauseSong();
  } else {
    playSong();
  }
}

// Play previous song
function playPrevSong() {
  currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length;
  loadSong(currentSongIndex);
}

// Play next song
function playNextSong() {
  currentSongIndex = (currentSongIndex + 1) % songs.length;
  loadSong(currentSongIndex);
}

// Update progress bar
function updateProgress() {
  const value = (audio.currentTime / audio.duration) * 100 || 0;
  progressBar.value = value;

  // Update time display
  currentTimeEl.textContent = formatTime(audio.currentTime);
}

// Update total duration
function updateDuration() {
  totalTimeEl.textContent = formatTime(audio.duration);
}

// Format time (seconds to MM:SS)
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

// Seek audio
function seekAudio() {
  audio.currentTime = (progressBar.value / 100) * audio.duration;
}

// Set volume
function setVolume() {
  audio.volume = volumeControl.value;
}

// Render all songs
function renderAllSongs() {
  allSongsList.innerHTML = '';

  songs.forEach((song, index) => {
    const songRow = document.createElement('div');
    songRow.className = 'song-row';
    songRow.innerHTML = `
      <span class="index">${index + 1}</span>
      <div class="song-info-small">
        <img src="${song.img}" alt="${song.title}">
        <div class="song-details-small">
          <div class="title">${song.title}</div>
          <div class="artist">${song.artist}</div>
        </div>
        <button class="save-btn ${isSongSaved(index) ? 'saved' : ''}" data-song-index="${index}">
          <i class="${isSongSaved(index) ? 'fas' : 'far'} fa-heart"></i>
        </button>
      </div>
      <span class="album-name">${song.album}</span>
      <span class="duration">${song.duration}</span>
    `;

    songRow.addEventListener('click', () => {
      loadSong(index);
    });

    songRow.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      openSongMenu(index);
    });

    // Add event listener for save button
    const saveBtn = songRow.querySelector('.save-btn');
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const songIndex = parseInt(saveBtn.getAttribute('data-song-index'));
      saveSong(songIndex);
    });

    allSongsList.appendChild(songRow);
  });
}

// Render recent songs
function renderRecentSongs() {
  recentGrid.innerHTML = '';

  songs.slice(0, 20).forEach((song) => {
    const actualIndex = songs.indexOf(song); // get real index in songs[]
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.setAttribute('data-song-index', actualIndex);
    card.innerHTML = `
      <div class="card-img">
        <img src="${song.img}" alt="${song.title}">
        <button class="play-btn"><i class="fas fa-play"></i></button>
      </div>
      <p class="card-title">${song.title}</p>
      <p class="card-desc">${song.artist}</p>
    `;

    // ✅ Use actualIndex, not slice index
    card.addEventListener('click', () => {
      loadSong(actualIndex);
    });

    recentGrid.appendChild(card);
  });
}


// Render mixes
function renderMixes() {
  // For demo, show some mixed content
  mixesGrid.innerHTML = '';

  const mixTitles = [
    "Popular Mix",
    "Discover Weekly",
    "Release Radar",
    "Daily Mix 1"
  ];

  mixTitles.forEach((title, i) => {
    const card = document.createElement('div');
    card.className = 'playlist-card';
    card.innerHTML = `
      <div class="card-img">
        <img src="https://via.placeholder.com/150/1db954/ffffff?text=${encodeURIComponent(title)}" alt="${title}">
        <button class="play-btn"><i class="fas fa-play"></i></button>
      </div>
      <p class="card-title">${title}</p>
    
    `;

    mixesGrid.appendChild(card);
  });
}

// Render library songs
function renderLibrarySongs() {
  librarySongsList.innerHTML = '';

  if (savedSongs.length === 0) {
    librarySongsList.innerHTML = `
      <div style="text-align: center; padding: 40px; color: #b3b3b3;">
        <i class="fas fa-music" style="font-size: 48px; margin-bottom: 16px;"></i>
        <h3>No saved songs yet</h3>
        <p>Save songs from the Home page to see them here</p>
      </div>
    `;
    return;
  }

  savedSongs.forEach((songIndex, index) => {
    const song = songs[songIndex];
    const songRow = document.createElement('div');
    songRow.className = 'song-row';
    songRow.innerHTML = `
      <span class="index">${index + 1}</span>
      <div class="song-info-small">
        <img src="${song.img}" alt="${song.title}">
        <div class="song-details-small">
          <div class="title">${song.title}</div>
          <div class="artist">${song.artist}</div>
        </div>
        <button class="save-btn saved" data-song-index="${songIndex}">
          <i class="fas fa-heart"></i>
        </button>
      </div>
      <span class="album-name">${song.album}</span>
      <span class="duration">${song.duration}</span>
    `;

    songRow.addEventListener('click', () => {
      loadSong(songIndex);
    });

    // Add event listener for unsave button
    const saveBtn = songRow.querySelector('.save-btn');
    saveBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const songIndex = parseInt(saveBtn.getAttribute('data-song-index'));
      unsaveSong(songIndex);
    });

    librarySongsList.appendChild(songRow);
  });
}

// Render playlists in sidebar
function renderPlaylists() {
  playlistsContainer.innerHTML = '';

  for (const key in playlists) {
    if (playlists.hasOwnProperty(key)) {
      const playlist = playlists[key];
      const li = document.createElement('li');
      li.textContent = playlist.name;
      li.addEventListener('click', () => {
        openPlaylist(key);
      });
      playlistsContainer.appendChild(li);
    }
  }

  // Add user playlists
  for (const id in userPlaylists) {
    if (userPlaylists.hasOwnProperty(id)) {
      const playlist = userPlaylists[id];
      const li = document.createElement('li');
      li.textContent = playlist.name;
      li.addEventListener('click', () => {
        openUserPlaylist(id);
      });
      playlistsContainer.appendChild(li);
    }
  }
}

// Open playlist modal
function openPlaylist(name) {
  const playlist = playlists[name];
  if (!playlist) return;

  document.getElementById("playlistModal").classList.add("active");
  overlay.classList.add("active");

  document.getElementById("playlistName").textContent = playlist.name;
  document.getElementById("playlist-modal-img").src = playlist.image;
  document.getElementById("playlist-desc").textContent = playlist.description;
  document.getElementById("playlist-owner").textContent = "Spotify";
  document.getElementById("playlist-song-count").textContent = `${playlist.songs.length} songs`;

  const list = document.getElementById("playlistSongs");
  list.innerHTML = "";

  playlist.songs.forEach((songIndex, index) => {
    const song = songs[songIndex];
    const li = document.createElement('li');
    li.className = 'song-row';
    li.innerHTML = `
      <span class="index">${index + 1}</span>
      <div class="song-info-small">
        <img src="${song.img}" alt="${song.title}">
        <div class="song-details-small">
          <div class="title">${song.title}</div>
          <div class="artist">${song.artist}</div>
        </div>
      </div>
      <span class="album-name">${song.album}</span>
      <span class="duration">${song.duration}</span>
    `;

    li.addEventListener('click', () => {
      loadSong(songIndex);
    });

    list.appendChild(li);
  });
}

// Open user playlist
function openUserPlaylist(id) {
  const playlist = userPlaylists[id];
  if (!playlist) return;

  document.getElementById("playlistModal").classList.add("active");
  overlay.classList.add("active");

  document.getElementById("playlistName").textContent = playlist.name;
  document.getElementById("playlist-modal-img").src = playlist.image || "https://via.placeholder.com/200/333/ffffff?text=Playlist";
  document.getElementById("playlist-desc").textContent = playlist.description || "Your playlist";
  document.getElementById("playlist-owner").textContent = "You";
  document.getElementById("playlist-song-count").textContent = `${playlist.songs.length} songs`;

  const list = document.getElementById("playlistSongs");
  list.innerHTML = "";

  playlist.songs.forEach((songIndex, index) => {
    const song = songs[songIndex];
    const li = document.createElement('li');
    li.className = 'song-row';
    li.innerHTML = `
      <span class="index">${index + 1}</span>
      <div class="song-info-small">
        <img src="${song.img}" alt="${song.title}">
        <div class="song-details-small">
          <div class="title">${song.title}</div>
          <div class="artist">${song.artist}</div>
        </div>
      </div>
      <span class="album-name">${song.album}</span>
      <span class="duration">${song.duration}</span>
    `;

    li.addEventListener('click', () => {
      loadSong(songIndex);
    });

    list.appendChild(li);
  });
}

// Close playlist modal
function closePlaylist() {
  document.getElementById("playlistModal").classList.remove("active");
  overlay.classList.remove("active");
}

// Open song menu
function openSongMenu(index) {
  currentMenuSongIndex = index;
  const song = songs[index];

  document.getElementById("menu-song-title").textContent = song.title;
  document.getElementById("menu-song-artist").textContent = song.artist;
  document.getElementById("menu-song-img").src = song.img;

  songMenu.classList.add("active");
  overlay.classList.add("active");
}

// Close all menus
function closeAllMenus() {
  songMenu.classList.remove("active");
  playlistSelectMenu.classList.remove("active");
  document.getElementById("create-playlist-modal").classList.remove("active");
  document.getElementById("playlistModal").classList.remove("active");
  overlay.classList.remove("active");
}

// Show add to playlist menu
function showAddToPlaylistMenu() {
  songMenu.classList.remove("active");
  playlistSelectMenu.classList.add("active");

  renderUserPlaylistsForSelection();
}

// Back to song menu from playlist selection
function backToSongMenu() {
  playlistSelectMenu.classList.remove("active");
  songMenu.classList.add("active");
}

// Render user playlists for selection
function renderUserPlaylistsForSelection() {
  userPlaylistsContainer.innerHTML = '';

  for (const id in userPlaylists) {
    if (userPlaylists.hasOwnProperty(id)) {
      const playlist = userPlaylists[id];
      const item = document.createElement('div');
      item.className = 'menu-item';
      item.setAttribute('data-playlist-id', id);
      item.innerHTML = `
        <i class="fas fa-list"></i>
        <span>${playlist.name}</span>
      `;

      item.addEventListener('click', () => {
        const playlistId = item.getAttribute('data-playlist-id');
        addSongToPlaylist(playlistId, currentMenuSongIndex);
      });

      userPlaylistsContainer.appendChild(item);
    }
  }
}

// Add song to playlist
function addSongToPlaylist(playlistId, songIndex) {
  if (!userPlaylists[playlistId]) return;

  // Check if song already exists in playlist
  if (!userPlaylists[playlistId].songs.includes(songIndex)) {
    userPlaylists[playlistId].songs.push(songIndex);
    saveUserPlaylists();
    showToast(`Added to ${userPlaylists[playlistId].name}`);
  } else {
    showToast("Song is already in this playlist");
  }

  closeAllMenus();
}

// Show create playlist modal
function showCreatePlaylistModal() {
  document.getElementById("create-playlist-modal").classList.add("active");
  overlay.classList.add("active");
  document.getElementById("playlist-name").value = "";
}

// Close modal
function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active");
  overlay.classList.remove("active");
}

// Create new playlist
function createPlaylist() {
  const name = document.getElementById("playlist-name").value.trim();
  if (!name) return;

  const id = 'playlist_' + Date.now();
  userPlaylists[id] = {
    name: name,
    description: "",
    image: "https://via.placeholder.com/200/333/ffffff?text=Playlist",
    songs: []
  };

  saveUserPlaylists();
  renderPlaylists();
  closeModal('create-playlist-modal');

  // If we were adding a song, add it now
  if (currentMenuSongIndex !== null) {
    addSongToPlaylist(id, currentMenuSongIndex);
  }
}

// Save user playlists to localStorage
function saveUserPlaylists() {
  localStorage.setItem('userPlaylists', JSON.stringify(userPlaylists));
}

// Load user playlists from localStorage
function loadUserPlaylists() {
  const stored = localStorage.getItem('userPlaylists');
  if (stored) {
    userPlaylists = JSON.parse(stored);
  }
}

// Load saved songs from localStorage
function loadSavedSongs() {
  const stored = localStorage.getItem('savedSongs');
  if (stored) {
    savedSongs = JSON.parse(stored);
  }
}

// Save songs to localStorage
function saveSongs() {
  localStorage.setItem('savedSongs', JSON.stringify(savedSongs));
}

// Check if song is saved
function isSongSaved(index) {
  return savedSongs.includes(index);
}

// Save current song
function saveCurrentSong() {
  if (isSongSaved(currentSongIndex)) {
    unsaveSong(currentSongIndex);
  } else {
    saveSong(currentSongIndex);
  }
}

// Save song to library
function saveSong(index) {
  if (!savedSongs.includes(index)) {
    savedSongs.push(index);
    saveSongs();
    updateSaveButton();
    renderAllSongs();

    if (currentPage === 'library') {
      renderLibrarySongs();
    }

    showToast(`Added to your Library`);
  }
}

// Unsave song from library
function unsaveSong(index) {
  const songIndex = savedSongs.indexOf(index);
  if (songIndex > -1) {
    savedSongs.splice(songIndex, 1);
    saveSongs();
    updateSaveButton();
    renderAllSongs();

    if (currentPage === 'library') {
      renderLibrarySongs();
    }

    showToast(`Removed from your Library`);
  }
}

// Update save button appearance
function updateSaveButton() {
  if (isSongSaved(currentSongIndex)) {
    saveSongBtn.innerHTML = '<i class="fas fa-heart"></i>';
    saveSongBtn.style.color = '#1db954';
  } else {
    saveSongBtn.innerHTML = '<i class="far fa-heart"></i>';
    saveSongBtn.style.color = '#b3b3b3';
  }
}

// Add to queue function
function addToQueue() {
  showToast("Added to queue");
  closeAllMenus();
}

// Show toast message
function showToast(message) {
  const toast = document.createElement('div');
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    background-color: #1db954;
    color: white;
    padding: 10px 20px;
    border-radius: 20px;
    z-index: 1000;
  `;
  document.body.appendChild(toast);

  setTimeout(() => {
    document.body.removeChild(toast);
  }, 2000);
}

// Go to artist (placeholder)
function goToArtist() {
  showToast("Artist page would open here");
  closeAllMenus();
}

// Go to album (placeholder)
function goToAlbum() {
  showToast("Album page would open here");
  closeAllMenus();
}

// Share (placeholder)
function share() {
  showToast("Share options would appear here");
  closeAllMenus();
}

// ✅ Reset all songs' play counts
document.getElementById("resetPlaysBtn").addEventListener("click", () => {
  songs.forEach(song => song.plays = 0); // reset all to 0
  localStorage.setItem("songsData", JSON.stringify(songs)); // save
  renderTrendingSongs(); // refresh trending
  alert("All play counts have been reset to 0!");
});


// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
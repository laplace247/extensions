const songsList = [
    {
        name: "Unica",
        artist: "Ozuna",
        src: "https://files.catbox.moe/3t66qb.mp3",
        cover: "https://i.postimg.cc/hvYjKZ62/1.png"
    },
    {
        name: "Vaina Loca",
        artist: "Ozuna x Manuel Turizo",
        src: "https://files.catbox.moe/cne8v6.mp3",
        cover: "https://i.postimg.cc/pT4rH1gq/2.jpg"
    },
    {
        name: "Dile Que Tu Me Quieres",
        artist: "Ozuna",
        src: "https://files.catbox.moe/fuoeok.mp3",
        cover: "https://i.postimg.cc/2jL3wrZJ/3.jpg"
    }
];

const artistName = document.querySelector('.artist-name');
const musicName = document.querySelector('.song-name');
const fillBar = document.querySelector('.fill-bar');
const time = document.querySelector('.time');
const cover = document.getElementById('cover');
const playBtn = document.getElementById('play');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const loopBtn = document.getElementById('loop');
const shuffleBtn = document.getElementById('shuffle');
const volumeBtn = document.getElementById('volumeToggle');
const volumeSlider = document.getElementById('volumeSlider');
const prog = document.querySelector('.progress-bar');

let song = new Audio();
let currentSong = 0;
let playing = false;
let loopMode = false;
let shuffleMode = false;
let isMuted = false;

document.addEventListener('DOMContentLoaded', () => {
    loadSong(currentSong);
    song.addEventListener('timeupdate', updateProgress);
    song.addEventListener('ended', nextSong);
    prevBtn.addEventListener('click', prevSong);
    nextBtn.addEventListener('click', nextSong);
    playBtn.addEventListener('click', togglePlayPause);
    loopBtn.addEventListener('click', toggleLoop);
    shuffleBtn.addEventListener('click', toggleShuffle);
    volumeBtn.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', changeVolume);
    prog.addEventListener('click', seek);
});

function loadSong(index) {
    const { name, artist, src, cover: thumb } = songsList[index];
    artistName.innerText = artist;
    musicName.innerText = name;
    song.src = src;
    cover.style.backgroundImage = `url(${thumb})`;
}

function updateProgress() {
    if (song.duration) {
        const pos = (song.currentTime / song.duration) * 100;
        fillBar.style.width = `${pos}%`;
        const duration = formatTime(song.duration);
        const currentTime = formatTime(song.currentTime);
        time.innerText = `${currentTime} - ${duration}`;
    }
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

function togglePlayPause() {
    if (playing) {
        song.pause();
    } else {
        song.play();
    }
    playing = !playing;
    playBtn.classList.toggle('fa-pause', playing);
    playBtn.classList.toggle('fa-play', !playing);
    cover.classList.toggle('active', playing);
}

function nextSong() {
    if (shuffleMode) {
        currentSong = Math.floor(Math.random() * songsList.length);
    } else {
        currentSong = (currentSong + 1) % songsList.length;
    }
    playMusic();
}

function prevSong() {
    if (shuffleMode) {
        currentSong = Math.floor(Math.random() * songsList.length);
    } else {
        currentSong = (currentSong - 1 + songsList.length) % songsList.length;
    }
    playMusic();
}

function playMusic() {
    loadSong(currentSong);
    song.play();
    playing = true;
    playBtn.classList.add('fa-pause');
    playBtn.classList.remove('fa-play');
    cover.classList.add('active');
}

function seek(e) {
    const pos = (e.offsetX / prog.clientWidth) * song.duration;
    song.currentTime = pos;
}

function toggleLoop() {
    loopMode = !loopMode;
    song.loop = loopMode;
    loopBtn.classList.toggle('loop-active', loopMode);
}

function toggleShuffle() {
    shuffleMode = !shuffleMode;
    shuffleBtn.classList.toggle('shuffle-active', shuffleMode);
}

function toggleMute() {
    isMuted = !isMuted;
    song.muted = isMuted;
    volumeBtn.classList.toggle('volume-muted', isMuted);
    volumeBtn.classList.toggle('fa-volume-high', !isMuted);
    volumeBtn.classList.toggle('fa-volume-xmark', isMuted);
}

function changeVolume() {
    const volume = volumeSlider.value / 100;
    song.volume = volume;
    updateVolumeIcon(volume);
}

function updateVolumeIcon(volume) {
    if (!isMuted) {
        volumeBtn.classList.remove('fa-volume-high', 'fa-volume-low', 'fa-volume-off');
        if (volume > 0.5) {
            volumeBtn.classList.add('fa-volume-high');
        } else if (volume > 0) {
            volumeBtn.classList.add('fa-volume-low');
        } else {
            volumeBtn.classList.add('fa-volume-off');
        }
    }
}
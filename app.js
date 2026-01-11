// Bible books with abbreviations matching the JSON file
const BOOKS = [
    { name: 'Genesis', abbrev: 'gn', chapters: 50 },
    { name: 'Exodus', abbrev: 'ex', chapters: 40 },
    { name: 'Leviticus', abbrev: 'lv', chapters: 27 },
    { name: 'Numbers', abbrev: 'nm', chapters: 36 },
    { name: 'Deuteronomy', abbrev: 'dt', chapters: 34 },
    { name: 'Joshua', abbrev: 'jos', chapters: 24 },
    { name: 'Judges', abbrev: 'jdgs', chapters: 21 },
    { name: 'Ruth', abbrev: 'ru', chapters: 4 },
    { name: '1 Samuel', abbrev: '1sm', chapters: 31 },
    { name: '2 Samuel', abbrev: '2sm', chapters: 24 },
    { name: '1 Kings', abbrev: '1kgs', chapters: 22 },
    { name: '2 Kings', abbrev: '2kgs', chapters: 25 },
    { name: '1 Chronicles', abbrev: '1chr', chapters: 29 },
    { name: '2 Chronicles', abbrev: '2chr', chapters: 36 },
    { name: 'Ezra', abbrev: 'ezr', chapters: 10 },
    { name: 'Nehemiah', abbrev: 'neh', chapters: 13 },
    { name: 'Esther', abbrev: 'est', chapters: 10 },
    { name: 'Job', abbrev: 'job', chapters: 42 },
    { name: 'Psalms', abbrev: 'ps', chapters: 150 },
    { name: 'Proverbs', abbrev: 'prv', chapters: 31 },
    { name: 'Ecclesiastes', abbrev: 'eccl', chapters: 12 },
    { name: 'Song of Solomon', abbrev: 'ssol', chapters: 8 },
    { name: 'Isaiah', abbrev: 'is', chapters: 66 },
    { name: 'Jeremiah', abbrev: 'jer', chapters: 52 },
    { name: 'Lamentations', abbrev: 'lam', chapters: 5 },
    { name: 'Ezekiel', abbrev: 'ez', chapters: 48 },
    { name: 'Daniel', abbrev: 'dn', chapters: 12 },
    { name: 'Hosea', abbrev: 'hos', chapters: 14 },
    { name: 'Joel', abbrev: 'jl', chapters: 3 },
    { name: 'Amos', abbrev: 'am', chapters: 9 },
    { name: 'Obadiah', abbrev: 'ob', chapters: 1 },
    { name: 'Jonah', abbrev: 'jon', chapters: 4 },
    { name: 'Micah', abbrev: 'mic', chapters: 7 },
    { name: 'Nahum', abbrev: 'nah', chapters: 3 },
    { name: 'Habakkuk', abbrev: 'hab', chapters: 3 },
    { name: 'Zephaniah', abbrev: 'zep', chapters: 3 },
    { name: 'Haggai', abbrev: 'hag', chapters: 2 },
    { name: 'Zechariah', abbrev: 'zec', chapters: 14 },
    { name: 'Malachi', abbrev: 'mal', chapters: 4 },
    { name: 'Matthew', abbrev: 'mt', chapters: 28 },
    { name: 'Mark', abbrev: 'mk', chapters: 16 },
    { name: 'Luke', abbrev: 'lk', chapters: 24 },
    { name: 'John', abbrev: 'jo', chapters: 21 },
    { name: 'Acts', abbrev: 'act', chapters: 28 },
    { name: 'Romans', abbrev: 'rm', chapters: 16 },
    { name: '1 Corinthians', abbrev: '1co', chapters: 16 },
    { name: '2 Corinthians', abbrev: '2co', chapters: 13 },
    { name: 'Galatians', abbrev: 'gal', chapters: 6 },
    { name: 'Ephesians', abbrev: 'eph', chapters: 6 },
    { name: 'Philippians', abbrev: 'phi', chapters: 4 },
    { name: 'Colossians', abbrev: 'col', chapters: 4 },
    { name: '1 Thessalonians', abbrev: '1th', chapters: 5 },
    { name: '2 Thessalonians', abbrev: '2th', chapters: 3 },
    { name: '1 Timothy', abbrev: '1tm', chapters: 6 },
    { name: '2 Timothy', abbrev: '2tm', chapters: 4 },
    { name: 'Titus', abbrev: 'tit', chapters: 3 },
    { name: 'Philemon', abbrev: 'phm', chapters: 1 },
    { name: 'Hebrews', abbrev: 'heb', chapters: 13 },
    { name: 'James', abbrev: 'jm', chapters: 5 },
    { name: '1 Peter', abbrev: '1pe', chapters: 5 },
    { name: '2 Peter', abbrev: '2pe', chapters: 3 },
    { name: '1 John', abbrev: '1jo', chapters: 5 },
    { name: '2 John', abbrev: '2jo', chapters: 1 },
    { name: '3 John', abbrev: '3jo', chapters: 1 },
    { name: 'Jude', abbrev: 'jd', chapters: 1 },
    { name: 'Revelation', abbrev: 'rev', chapters: 22 }
];

// Bible data (loaded from JSON)
let bibleData = null;

// Current state
let currentBookIndex = null;
let currentChapter = null;
let verses = [];
let currentVerseIndex = 0;
let isPlaying = false;
let speed = 1;
let selectedVoice = null;
let allVoices = [];

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    // Load Bible JSON
    try {
        document.getElementById('verses').innerHTML = '<p class="loading">Loading Bible data...</p>';
        const res = await fetch('bible.json');
        bibleData = await res.json();
        document.getElementById('verses').innerHTML = '<p class="subtitle">Select a book and chapter to begin</p>';
    } catch (err) {
        document.getElementById('verses').innerHTML = '<p class="error">Failed to load Bible data</p>';
        console.error(err);
        return;
    }
    
    populateBooks();
    populateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoices;
    }
});

function populateBooks() {
    const select = document.getElementById('book-select');
    BOOKS.forEach((book, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = book.name;
        select.appendChild(opt);
    });
    
    select.addEventListener('change', () => {
        populateChapters(parseInt(select.value));
    });
}

function populateChapters(bookIndex) {
    const select = document.getElementById('chapter-select');
    select.innerHTML = '<option value="">-- Chapter --</option>';
    
    if (bookIndex < 0 || !BOOKS[bookIndex]) return;
    
    const book = BOOKS[bookIndex];
    for (let i = 1; i <= book.chapters; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `Chapter ${i}`;
        select.appendChild(opt);
    }
}

function populateVoices() {
    const select = document.getElementById('voice-select');
    const voices = speechSynthesis.getVoices();
    allVoices = voices.filter(v => v.lang.startsWith('en'));
    
    select.innerHTML = '';
    let defaultIndex = 0;
    
    allVoices.forEach((voice, i) => {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${voice.name} (${voice.lang})`;
        select.appendChild(opt);
        
        if (voice.name.toLowerCase().includes('superstar')) {
            defaultIndex = i;
        }
    });
    
    if (allVoices.length > 0) {
        select.value = defaultIndex;
        selectedVoice = allVoices[defaultIndex];
    }
    
    select.addEventListener('change', () => {
        selectedVoice = allVoices[select.value];
    });
}

function loadChapter() {
    const bookIndex = parseInt(document.getElementById('book-select').value);
    const chapter = parseInt(document.getElementById('chapter-select').value);
    
    if (isNaN(bookIndex) || isNaN(chapter)) {
        alert('Please select a book and chapter');
        return;
    }
    
    currentBookIndex = bookIndex;
    currentChapter = chapter;
    
    const book = BOOKS[bookIndex];
    const bookData = bibleData[bookIndex];
    
    if (!bookData || !bookData.chapters[chapter - 1]) {
        document.getElementById('verses').innerHTML = '<p class="error">Chapter not found</p>';
        return;
    }
    
    // Get verses (array of strings)
    const chapterVerses = bookData.chapters[chapter - 1];
    verses = chapterVerses.map((text, i) => ({
        num: i + 1,
        text: text.replace(/\{[^}]*\}/g, '') // Remove KJV annotations like {was}
    }));
    
    document.getElementById('book-title').textContent = `${book.name} ${chapter}`;
    document.getElementById('current-ref').textContent = `${book.name} ${chapter}`;
    
    renderVerses();
    currentVerseIndex = 0;
    highlightVerse(0);
}

function renderVerses() {
    const container = document.getElementById('verses');
    container.innerHTML = '';
    
    let html = '<p>';
    verses.forEach((v, i) => {
        html += `<span class="verse" data-index="${i}"><span class="verse-num">${v.num}</span>${v.text} </span>`;
        if ((i + 1) % 4 === 0 && i < verses.length - 1) {
            html += '</p><p>';
        }
    });
    html += '</p>';
    
    container.innerHTML = html;
    
    container.querySelectorAll('.verse').forEach(el => {
        el.addEventListener('click', () => {
            const idx = parseInt(el.dataset.index);
            goToVerse(idx);
        });
    });
}

function highlightVerse(index) {
    document.querySelectorAll('.verse.reading').forEach(el => el.classList.remove('reading'));
    
    const verse = document.querySelector(`.verse[data-index="${index}"]`);
    if (verse) {
        verse.classList.add('reading');
        verse.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    
    if (verses[index]) {
        const book = BOOKS[currentBookIndex];
        document.getElementById('current-ref').textContent = 
            `${book.name} ${currentChapter}:${verses[index].num}`;
    }
}

function goToVerse(index) {
    if (index < 0 || index >= verses.length) return;
    currentVerseIndex = index;
    highlightVerse(index);
    
    if (isPlaying) {
        speechSynthesis.cancel();
        speakCurrentVerse();
    }
}

function speakCurrentVerse() {
    if (!isPlaying || currentVerseIndex >= verses.length) {
        if (currentVerseIndex >= verses.length) {
            const book = BOOKS[currentBookIndex];
            if (currentChapter < book.chapters) {
                currentChapter++;
                document.getElementById('chapter-select').value = currentChapter;
                loadChapter();
                if (isPlaying) setTimeout(speakCurrentVerse, 100);
            } else {
                isPlaying = false;
            }
        }
        return;
    }
    
    const verse = verses[currentVerseIndex];
    highlightVerse(currentVerseIndex);
    
    const utterance = new SpeechSynthesisUtterance(verse.text);
    utterance.rate = speed;
    if (selectedVoice) utterance.voice = selectedVoice;
    
    utterance.onend = () => {
        if (isPlaying) {
            currentVerseIndex++;
            speakCurrentVerse();
        }
    };
    
    utterance.onerror = (e) => console.log('Speech error:', e);
    
    speechSynthesis.speak(utterance);
}

function playFromCurrent() {
    if (verses.length === 0) return;
    isPlaying = true;
    speakCurrentVerse();
}

function pausePlayback() {
    isPlaying = false;
    speechSynthesis.cancel();
}

function prevVerse() {
    if (currentVerseIndex > 0) {
        goToVerse(currentVerseIndex - 1);
    }
}

function nextVerse() {
    if (currentVerseIndex < verses.length - 1) {
        goToVerse(currentVerseIndex + 1);
    }
}

function prevChapter() {
    if (currentChapter > 1) {
        speechSynthesis.cancel();
        currentChapter--;
        document.getElementById('chapter-select').value = currentChapter;
        loadChapter();
        if (isPlaying) setTimeout(speakCurrentVerse, 100);
    }
}

function nextChapter() {
    const book = BOOKS[currentBookIndex];
    if (book && currentChapter < book.chapters) {
        speechSynthesis.cancel();
        currentChapter++;
        document.getElementById('chapter-select').value = currentChapter;
        loadChapter();
        if (isPlaying) setTimeout(speakCurrentVerse, 100);
    }
}

function setSpeed(newSpeed) {
    speed = newSpeed;
    
    document.querySelectorAll('[data-speed]').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-speed="${speed}"]`).classList.add('active');
    
    if (isPlaying) {
        speechSynthesis.cancel();
        speakCurrentVerse();
    }
}

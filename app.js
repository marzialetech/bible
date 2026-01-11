// Bible books with chapter counts
const BOOKS = {
    // Old Testament
    'Genesis': 50, 'Exodus': 40, 'Leviticus': 27, 'Numbers': 36, 'Deuteronomy': 34,
    'Joshua': 24, 'Judges': 21, 'Ruth': 4, '1 Samuel': 31, '2 Samuel': 24,
    '1 Kings': 22, '2 Kings': 25, '1 Chronicles': 29, '2 Chronicles': 36,
    'Ezra': 10, 'Nehemiah': 13, 'Esther': 10, 'Job': 42, 'Psalms': 150,
    'Proverbs': 31, 'Ecclesiastes': 12, 'Song of Solomon': 8, 'Isaiah': 66,
    'Jeremiah': 52, 'Lamentations': 5, 'Ezekiel': 48, 'Daniel': 12,
    'Hosea': 14, 'Joel': 3, 'Amos': 9, 'Obadiah': 1, 'Jonah': 4,
    'Micah': 7, 'Nahum': 3, 'Habakkuk': 3, 'Zephaniah': 3, 'Haggai': 2,
    'Zechariah': 14, 'Malachi': 4,
    // New Testament
    'Matthew': 28, 'Mark': 16, 'Luke': 24, 'John': 21, 'Acts': 28,
    'Romans': 16, '1 Corinthians': 16, '2 Corinthians': 13, 'Galatians': 6,
    'Ephesians': 6, 'Philippians': 4, 'Colossians': 4, '1 Thessalonians': 5,
    '2 Thessalonians': 3, '1 Timothy': 6, '2 Timothy': 4, 'Titus': 3,
    'Philemon': 1, 'Hebrews': 13, 'James': 5, '1 Peter': 5, '2 Peter': 3,
    '1 John': 5, '2 John': 1, '3 John': 1, 'Jude': 1, 'Revelation': 22
};

// Current state
let currentBook = null;
let currentChapter = null;
let verses = [];
let currentVerseIndex = 0;
let isPlaying = false;
let speed = 1;
let selectedVoice = null;
let allVoices = [];

// API Configuration - swap this to ESV later
const API = {
    // bible-api.com (WEB translation) - free, no key needed
    fetch: async (book, chapter) => {
        const query = `${book}+${chapter}`;
        const res = await fetch(`https://bible-api.com/${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        return data.verses.map(v => ({
            num: v.verse,
            text: v.text.trim()
        }));
    }
    
    // ESV API - uncomment and add your key when ready
    // fetch: async (book, chapter) => {
    //     const API_KEY = 'YOUR_ESV_API_KEY';
    //     const query = `${book}+${chapter}`;
    //     const res = await fetch(`https://api.esv.org/v3/passage/text/?q=${encodeURIComponent(query)}&include-headings=false&include-footnotes=false&include-verse-numbers=false&include-short-copyright=false&include-passage-references=false`, {
    //         headers: { 'Authorization': `Token ${API_KEY}` }
    //     });
    //     if (!res.ok) throw new Error('Failed to fetch');
    //     const data = await res.json();
    //     // Parse ESV response into verses array
    //     // Note: ESV API returns full text, you'd need to parse verses differently
    //     return parseESVResponse(data);
    // }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    populateBooks();
    populateVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = populateVoices;
    }
});

function populateBooks() {
    const select = document.getElementById('book-select');
    Object.keys(BOOKS).forEach(book => {
        const opt = document.createElement('option');
        opt.value = book;
        opt.textContent = book;
        select.appendChild(opt);
    });
    
    select.addEventListener('change', () => {
        populateChapters(select.value);
    });
}

function populateChapters(book) {
    const select = document.getElementById('chapter-select');
    select.innerHTML = '<option value="">-- Chapter --</option>';
    
    if (!book || !BOOKS[book]) return;
    
    for (let i = 1; i <= BOOKS[book]; i++) {
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

async function loadChapter() {
    const book = document.getElementById('book-select').value;
    const chapter = document.getElementById('chapter-select').value;
    
    if (!book || !chapter) {
        alert('Please select a book and chapter');
        return;
    }
    
    currentBook = book;
    currentChapter = parseInt(chapter);
    
    document.getElementById('book-title').textContent = `${book} ${chapter}`;
    document.getElementById('verses').innerHTML = '<p class="loading">Loading...</p>';
    document.getElementById('current-ref').textContent = `${book} ${chapter}`;
    
    try {
        verses = await API.fetch(book, chapter);
        renderVerses();
        currentVerseIndex = 0;
        highlightVerse(0);
    } catch (err) {
        document.getElementById('verses').innerHTML = `<p class="error">Error: ${err.message}</p>`;
        verses = [];
    }
}

function renderVerses() {
    const container = document.getElementById('verses');
    container.innerHTML = '';
    
    // Group verses into paragraphs (roughly every 3-5 verses)
    let html = '<p>';
    verses.forEach((v, i) => {
        html += `<span class="verse" data-index="${i}"><span class="verse-num">${v.num}</span>${v.text} </span>`;
        // New paragraph roughly every 4 verses or at natural breaks
        if ((i + 1) % 4 === 0 && i < verses.length - 1) {
            html += '</p><p>';
        }
    });
    html += '</p>';
    
    container.innerHTML = html;
    
    // Add click handlers
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
        document.getElementById('current-ref').textContent = 
            `${currentBook} ${currentChapter}:${verses[index].num}`;
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
            // Auto-advance to next chapter
            if (currentChapter < BOOKS[currentBook]) {
                currentChapter++;
                document.getElementById('chapter-select').value = currentChapter;
                loadChapter().then(() => {
                    if (isPlaying) speakCurrentVerse();
                });
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
        loadChapter().then(() => {
            if (isPlaying) speakCurrentVerse();
        });
    }
}

function nextChapter() {
    if (currentBook && currentChapter < BOOKS[currentBook]) {
        speechSynthesis.cancel();
        currentChapter++;
        document.getElementById('chapter-select').value = currentChapter;
        loadChapter().then(() => {
            if (isPlaying) speakCurrentVerse();
        });
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

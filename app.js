import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

env.allowLocalModels = false;
env.useBrowserCache = true;

const micBtn = document.getElementById('mic-btn');
const status = document.getElementById('status');
const userTextDisplay = document.getElementById('user-text');
const aiTextDisplay = document.getElementById('ai-text');
const progressBar = document.getElementById('progress-bar');
const loadStatus = document.getElementById('load-status');
const loadPerc = document.getElementById('load-perc');
const loaderArea = document.getElementById('loader-area');

let generator = null;

// AI কথা বলার ফাংশন
function speak(text) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US'; // বাংলার জন্য 'bn-BD' দিতে পারেন
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
}

// ভয়েস শোনার সেটিংস
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US'; 

// লোডিং প্রগ্রেস আপডেট
function onProgress(data) {
    if (data.status === 'progress') {
        const p = data.progress.toFixed(1);
        progressBar.style.width = p + '%';
        loadPerc.innerText = p + '%';
        loadStatus.innerText = "মডেল ডাউনলোড হচ্ছে...";
    } else if (data.status === 'ready') {
        loaderArea.style.display = 'none';
        status.innerText = "AI প্রস্তুত - কথা বলুন";
        micBtn.disabled = false;
    }
}

// এআই লোড করা
async function loadAI() {
    try {
        generator = await pipeline('text2text-generation', 'Xenova/flan-t5-small', {
            progress_callback: onProgress
        });
    } catch (e) {
        loadStatus.innerText = "Error!";
        status.innerText = "ইন্টারনেট চেক করুন";
    }
}

// কথা বলা শুরু
micBtn.onclick = () => {
    if (!generator) return;
    micBtn.classList.add('mic-active');
    status.innerText = "আমি শুনছি...";
    recognition.start();
};

recognition.onresult = async (event) => {
    const transcript = event.results[0][0].transcript;
    userTextDisplay.innerText = "You: " + transcript;
    micBtn.classList.remove('mic-active');
    status.innerText = "ভাবছি...";

    try {
        const output = await generator(`Answer simply: ${transcript}`, { max_new_tokens: 50 });
        const response = output[0].generated_text;
        
        aiTextDisplay.innerText = response;
        speak(response);
        status.innerText = "উত্তর দিচ্ছি...";
        setTimeout(() => { status.innerText = "AI প্রস্তুত - কথা বলুন"; }, 3000);
    } catch (err) {
        status.innerText = "সমস্যা হয়েছে";
    }
};

recognition.onerror = () => {
    micBtn.classList.remove('mic-active');
    status.innerText = "আবার চেষ্টা করুন";
};

window.onload = loadAI;

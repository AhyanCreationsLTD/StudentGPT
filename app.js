import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

env.allowLocalModels = false;
env.useBrowserCache = true;

const chatBox = document.getElementById('chat-box');
const textInput = document.getElementById('text-input');
const submitBtn = document.getElementById('submit-btn');
const micBtn = document.getElementById('mic-trigger');
const progressBar = document.getElementById('progress-bar');
const loadLabel = document.getElementById('load-label');
const statusDot = document.getElementById('status-dot');

let aiModel = null;
let visionModel = null;
let isModelReady = false;

// Voice Engine
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'en-US';

function speak(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = 1.0;
    window.speechSynthesis.speak(u);
}

// ডাউনলোড প্রগ্রেস লজিক (১, ২, ৩... ১০০)
function updateProgress(data) {
    if (data.status === 'progress') {
        const percent = Math.round(data.progress);
        progressBar.style.width = percent + '%';
        loadLabel.innerText = `Downloading Model: ${percent}%`;
        loadLabel.style.color = '#eab308';
    } else if (data.status === 'ready') {
        // মডেল যখন পুরোপুরি তৈরি
        isModelReady = true;
        progressBar.style.width = '100%';
        setTimeout(() => progressBar.parentElement.style.display = 'none', 1000);
        loadLabel.innerText = 'Online';
        loadLabel.style.color = '#10a37f';
        statusDot.classList.replace('bg-yellow-500', 'bg-emerald-500');
    }
}

async function initAI() {
    try {
        // টেক্সট এবং ইমেজ মডেল লোড
        aiModel = await pipeline('text2text-generation', 'Xenova/flan-t5-small', { progress_callback: updateProgress });
        visionModel = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');
    } catch (e) {
        loadLabel.innerText = 'Connection Error';
        statusDot.style.backgroundColor = 'red';
    }
}

function appendMsg(role, text) {
    document.getElementById('welcome-screen')?.remove();
    const isBot = role === 'StudentGPT';
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message-row';
    msgDiv.innerHTML = `
        <div class="inner-content">
            <div class="avatar ${isBot ? 'bot-avatar' : 'user-avatar'}">${isBot ? 'S' : 'U'}</div>
            <div class="text-slate-200 text-sm leading-relaxed w-full">
                <p class="font-bold text-[10px] uppercase text-slate-500 mb-1">${role}</p>
                <div>${text}</div>
            </div>
        </div>
    `;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function handleChat() {
    // মডেল লোড না হলে সতর্কতা
    if (!isModelReady) {
        alert("মডেল লোডিং হচ্ছে, অনুগ্রহ করে ১০০% হওয়া পর্যন্ত অপেক্ষা করে মেসেজ দিন।");
        return;
    }

    const text = textInput.value.trim();
    const imageFile = document.getElementById('image-upload').files[0];
    if (!text && !imageFile) return;

    appendMsg('You', text || (imageFile ? "Sent an image." : ""));
    textInput.value = "";
    let imageDescription = "";

    // ইমেজ এনালাইসিস
    if (imageFile) {
        const imgUrl = URL.createObjectURL(imageFile);
        const res = await visionModel(imgUrl);
        imageDescription = `[Student uploaded image showing: ${res[0].generated_text}] `;
        clearImage();
    }

    // AI প্রম্পট (Academic Mode)
    const prompt = `System: You are StudentGPT by AhyanCreationsLTD. Answer only academic questions. 
                   Context: ${imageDescription} 
                   Student: ${text}
                   Assistant:`;
    
    try {
        const result = await aiModel(prompt, { max_new_tokens: 200, temperature: 0.4 });
        const aiResponse = result[0].generated_text;
        appendMsg('StudentGPT', aiResponse);
        speak(aiResponse);
    } catch (e) {
        appendMsg('StudentGPT', 'দুঃখিত, প্রসেস করার সময় ভুল হয়েছে।');
    }
}

micBtn.onclick = () => {
    if (!isModelReady) return alert("অপেক্ষা করুন, মডেল লোড হচ্ছে...");
    micBtn.classList.add('pulse-mic');
    recognition.start();
};

recognition.onresult = (e) => {
    micBtn.classList.remove('pulse-mic');
    textInput.value = e.results[0][0].transcript;
    handleChat();
};

submitBtn.onclick = handleChat;
textInput.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); } });

window.onload = initAI;
    

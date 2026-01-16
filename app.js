import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

env.allowLocalModels = false;
env.useBrowserCache = true;

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const progressBar = document.getElementById('progress-bar');
const loadText = document.getElementById('load-text');

let tutor = null;
let vision = null;

// Text-to-Speech
function speak(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; // বাংলা হলে 'bn-BD'
    window.speechSynthesis.speak(u);
}

// Voice Recognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// প্রগ্রেস দেখানো
function progress(data) {
    if (data.status === 'progress') {
        const p = data.progress.toFixed(0);
        progressBar.style.width = p + '%';
        loadText.innerText = `মডেল লোড হচ্ছে: ${p}%`;
    } else if (data.status === 'ready') {
        document.getElementById('loader').innerHTML = "🟢 Online";
    }
}

async function init() {
    // পড়াশোনার জন্য দক্ষ মডেল (Flan-T5)
    tutor = await pipeline('text2text-generation', 'Xenova/flan-t5-small', { progress_callback: progress });
    // ইমেজ ক্যাপশনিং মডেল
    vision = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');
}

function appendMessage(role, text) {
    const isBot = role === 'StudentGPT';
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message';
    msgDiv.innerHTML = `
        <div class="avatar ${isBot ? 'bot-avatar' : 'user-avatar'}">${isBot ? 'S' : 'U'}</div>
        <div class="content space-y-2">
            <p class="font-bold text-xs uppercase tracking-widest text-slate-500">${role}</p>
            <div class="prose prose-invert max-w-none text-slate-200">${text}</div>
        </div>
    `;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function handleChat() {
    const text = userInput.value.trim();
    const file = document.getElementById('file-input').files[0];
    if (!text && !file) return;

    appendMessage('You', text);
    userInput.value = "";
    let context = "";

    // ছবি প্রসেসিং
    if (file) {
        const url = URL.createObjectURL(file);
        const res = await vision(url);
        context = `[Image context: ${res[0].generated_text}] `;
        removeImg();
    }

    // AI উত্তর (Academic Guardrail)
    const prompt = `Instruction: You are StudentGPT, a strict academic tutor. Answer educational questions only. If irrelevant, say "I can only help with studies." Context: ${context} Question: ${text}`;
    
    try {
        const result = await tutor(prompt, { max_new_tokens: 200, temperature: 0.5 });
        const finalMsg = result[0].generated_text;
        appendMessage('StudentGPT', finalMsg);
        speak(finalMsg);
    } catch (e) {
        appendMessage('StudentGPT', 'দুঃখিত, আমি এই মুহূর্তে উত্তর দিতে পারছি না।');
    }
}

micBtn.onclick = () => { micBtn.classList.add('mic-active'); recognition.start(); };
recognition.onresult = (e) => { 
    micBtn.classList.remove('mic-active');
    userInput.value = e.results[0][0].transcript;
    handleChat();
};
sendBtn.onclick = handleChat;
window.onload = init;
    

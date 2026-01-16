import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

env.allowLocalModels = false;
env.useBrowserCache = true;

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');
const micBtn = document.getElementById('mic-btn');
const progressBar = document.getElementById('progress-bar');
const loadLabel = document.getElementById('load-label');
const statusDot = document.getElementById('status-dot');

let model = null;
let vision = null;
let isReady = false;

// স্বাগত বার্তা ফাংশন
function welcomeUser() {
    const welcomeMsg = "স্টুডেন্ট জিপিটি তে আপনাকে স্বাগতম! পড়ালেখার যেকোনো বিষয়ে স্টুডেন্ট জিপিটি সবসময় সবার জন্য উন্মুক্ত। আমাকে আহিয়ান ক্রিয়েশন লিমিটেড এর প্রতিষ্ঠাতা মোহাম্মদ আবদুল্লাহ তৈরি করেছেন। ধন্যবাদ স্টুডেন্ট জিপিটি ব্যবহার এর জন্য।";
    appendMsg('StudentGPT', welcomeMsg);
    speak(welcomeMsg);
}

// ভয়েস আউটপুট (মিষ্টি ভয়েস সেট করার চেষ্টা)
function speak(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'bn-BD'; // বাংলা সাপোর্ট
    u.pitch = 1.2;    // মিষ্টি স্বরের জন্য পিচ একটু বাড়ানো
    u.rate = 0.9;     // গলার স্বর স্পষ্ট করার জন্য গতি সামান্য কমানো
    window.speechSynthesis.speak(u);
}

// ভয়েস ইনপুট
const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
recognition.lang = 'bn-BD';

// প্রগ্রেস ট্র্যাকিং
function onProgress(data) {
    if (data.status === 'progress') {
        const p = Math.round(data.progress);
        progressBar.style.width = p + '%';
        loadLabel.innerText = `মডেল ডাউনলোড: ${p}%`;
    } else if (data.status === 'ready') {
        isReady = true;
        loadLabel.innerText = "Online";
        statusDot.classList.replace('bg-yellow-500', 'bg-green-500');
        statusDot.classList.remove('animate-pulse');
        document.getElementById('progress-parent').style.display = 'none';
        welcomeUser(); // ডাউনলোড শেষ হলে স্বাগত বার্তা
    }
}

async function init() {
    model = await pipeline('text2text-generation', 'Xenova/flan-t5-small', { progress_callback: onProgress });
    vision = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');
}

function appendMsg(sender, text, isImage = false) {
    if (isImage) {
        const img = document.createElement('img');
        img.src = text;
        img.className = 'user-img';
        chatBox.appendChild(img);
    } else {
        const div = document.createElement('div');
        div.className = `msg ${sender === 'StudentGPT' ? 'bot-msg' : 'user-msg'}`;
        div.innerText = text;
        chatBox.appendChild(div);
    }
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function handleChat() {
    if (!isReady) return alert("দয়া করে মডেল ১০০% লোড হওয়া পর্যন্ত অপেক্ষা করুন।");
    
    const text = userInput.value.trim();
    const file = document.getElementById('file-input').files[0];
    
    if (!text && !file) return;

    if (file) {
        const url = URL.createObjectURL(file);
        appendMsg('You', url, true);
    }
    if (text) appendMsg('You', text);
    
    userInput.value = "";
    document.getElementById('file-input').value = "";

    // স্পেশাল প্রশ্ন চেক (কে তৈরি করেছে?)
    const creatorQuestions = ["কে তৈরি করেছে", "তোমার মালিক কে", "who created you", "who is your founder"];
    const isCreatorQuestion = creatorQuestions.some(q => text.toLowerCase().includes(q));

    if (isCreatorQuestion) {
        const response = "আমাকে আহিয়ান ক্রিয়েশন লিমিটেড এর প্রতিষ্ঠাতা মোহাম্মদ আবদুল্লাহ তৈরি করেছেন।";
        setTimeout(() => {
            appendMsg('StudentGPT', response);
            speak(response);
        }, 500);
        return;
    }

    // জেনারেল এআই রেসপন্স
    try {
        const res = await model(`Academic Task: ${text}`, { 
            max_new_tokens: 100, 
            repetition_penalty: 2.0,
            temperature: 0.3 
        });
        const reply = res[0].generated_text;
        appendMsg('StudentGPT', reply);
        speak(reply);
    } catch (err) {
        appendMsg('StudentGPT', 'দুঃখিত, আমি বুঝতে পারিনি।');
    }
}

micBtn.onclick = () => { if(isReady) recognition.start(); };
recognition.onresult = (e) => {
    userInput.value = e.results[0][0].transcript;
    handleChat();
};

sendBtn.onclick = handleChat;
userInput.onkeydown = (e) => { if(e.key === 'Enter') handleChat(); };

window.onload = init;

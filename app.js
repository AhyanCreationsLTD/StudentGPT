import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

env.allowLocalModels = false;

const splash = document.getElementById('splash');
const mainApp = document.getElementById('main-app');
const bar = document.getElementById('bar');
const percentText = document.getElementById('percent');
const splashText = document.getElementById('splash-text');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');

let textGen, visionGen;
let isLoaded = false;

// Voice Output
function speak(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'bn-BD';
    u.pitch = 1.1; u.rate = 1.0;
    window.speechSynthesis.speak(u);
}

// পরিচয়ের মেসেজ
const introText = "স্টুডেন্ট জিপিটি তে আপনাকে স্বাগতম! পড়ালেখার যেকোনো বিষয়ে স্টুডেন্ট জিপিটি সবসময় সবার জন্য উন্মুক্ত। আমাকে আহিয়ান ক্রিয়েশন লিমিটেড এর প্রতিষ্ঠাতা মোহাম্মদ আবদুল্লাহ তৈরি করেছেন। ধন্যবাদ স্টুডেন্ট জিপিটি ব্যবহার এর জন্য।";

// মডেল লোডিং প্রগ্রেস
async function loadModels() {
    try {
        textGen = await pipeline('text2text-generation', 'Xenova/flan-t5-small', {
            progress_callback: (data) => {
                if (data.status === 'progress') {
                    const p = Math.round(data.progress);
                    bar.style.width = p + '%';
                    percentText.innerText = p + '%';
                    if (p === 20) {
                        splashText.innerText = introText;
                        speak(introText);
                    }
                }
            }
        });
        visionGen = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');
        
        // লোড শেষ হলে মেসেজিং স্ক্রিনে নিয়ে যাওয়া
        isLoaded = true;
        setTimeout(() => {
            splash.style.display = 'none';
            mainApp.classList.remove('hidden');
            appendMsg('StudentGPT', introText);
        }, 1500);
    } catch (e) {
        splashText.innerText = "Error Loading! Check Internet.";
    }
}

function appendMsg(sender, text, isImage = false) {
    const div = document.createElement('div');
    div.className = `msg ${sender === 'StudentGPT' ? 'bot-msg' : 'user-msg'}`;
    if (isImage) {
        div.innerHTML = `<img src="${text}" class="rounded-lg max-w-full">`;
    } else {
        div.innerText = text;
    }
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// Typing Animation show
function showTyping() {
    const div = document.createElement('div');
    div.id = 'typing-indicator';
    div.className = 'msg bot-msg flex gap-1 items-center py-4';
    div.innerHTML = `<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>`;
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function handleChat() {
    const text = userInput.value.trim();
    const file = document.getElementById('file-input').files[0];
    if (!text && !file) return;

    if (file) appendMsg('You', URL.createObjectURL(file), true);
    if (text) appendMsg('You', text);
    userInput.value = "";

    // Safety & Creator Check
    if (/(sex|porn|18\+|harmful|kill)/i.test(text)) {
        appendMsg('StudentGPT', "দুঃখিত, আমি কেবল পড়াশোনা বিষয়ক নিরাপদ প্রশ্নের উত্তর দিতে পারি।");
        return;
    }
    if (/(owner|creator|তৈরি করেছে|আবদুল্লাহ)/i.test(text)) {
        const creatorMsg = "আমাকে আহিয়ান ক্রিয়েশন লিমিটেড এর প্রতিষ্ঠাতা মোহাম্মদ আবদুল্লাহ তৈরি করেছেন।";
        appendMsg('StudentGPT', creatorMsg);
        speak(creatorMsg);
        return;
    }

    showTyping();
    
    try {
        let context = "";
        if (file) {
            const res = await visionGen(URL.createObjectURL(file));
            context = `Image Context: ${res[0].generated_text}. `;
        }
        
        const output = await textGen(context + text, { max_new_tokens: 150 });
        document.getElementById('typing-indicator')?.remove();
        
        const response = output[0].generated_text;
        appendMsg('StudentGPT', response);
        speak(response);
    } catch (err) {
        document.getElementById('typing-indicator')?.remove();
        appendMsg('StudentGPT', "Error processing request.");
    }
}

// কল অপশন (ভয়েস ইনপুট সরাসরি অ্যাক্টিভ করবে)
document.getElementById('call-btn').onclick = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'bn-BD';
    recognition.start();
    speak("আমি শুনছি, বলুন।");
    recognition.onresult = (e) => {
        userInput.value = e.results[0][0].transcript;
        handleChat();
    };
};

document.getElementById('send-btn').onclick = handleChat;
userInput.onkeydown = (e) => { if(e.key === 'Enter') handleChat(); };

// ইমেজ প্রিভিউ
document.getElementById('file-input').onchange = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
        document.getElementById('img-preview').src = reader.result;
        document.getElementById('img-preview-box').classList.remove('hidden');
    };
    reader.readAsDataURL(e.target.files[0]);
};

window.onload = loadModels;
        

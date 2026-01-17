import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

// ব্রাউজার মেমোরি অপ্টিমাইজেশন
env.allowLocalModels = false;
env.useBrowserCache = true;

const splash = document.getElementById('splash-screen');
const app = document.getElementById('app-container');
const progressBar = document.getElementById('progress-bar');
const statusText = document.getElementById('loading-status');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');

let textModel, visionModel;

// ১. মডেল লোডিং প্রসেস (Real-time Progress)
async function initAI() {
    try {
        textModel = await pipeline('text2text-generation', 'Xenova/flan-t5-small', {
            progress_callback: (p) => {
                if (p.status === 'progress') {
                    let progress = Math.round(p.progress);
                    progressBar.style.width = progress + '%';
                    statusText.innerText = `মডেল লোড হচ্ছে: ${progress}%`;
                }
            }
        });
        
        visionModel = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');

        // লোড শেষ হলে ইন্টারফেস পরিবর্তন
        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            app.classList.remove('hidden');
        }, 500);
    } catch (err) {
        statusText.innerText = "Error! ইন্টারনেট কানেকশন চেক করুন।";
    }
}

// ২. ভয়েস আউটপুট ফাংশন
function speak(text) {
    window.speechSynthesis.cancel();
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'bn-BD'; // বাংলা ভয়েস
    window.speechSynthesis.speak(speech);
}

// ৩. চ্যাট মেসেজ যোগ করা
function appendMessage(sender, text, isImage = false) {
    const div = document.createElement('div');
    div.className = `msg ${sender === 'User' ? 'user-msg' : 'bot-msg'}`;
    
    if (isImage) {
        div.innerHTML = `<img src="${text}" style="width:100%; border-radius:10px;">`;
    } else {
        div.innerText = text;
        // ভয়েস বাটন যোগ করা
        if (sender !== 'User') {
            const btn = document.createElement('button');
            btn.innerText = "🔊";
            btn.style.marginLeft = "10px";
            btn.onclick = () => speak(text);
            div.appendChild(btn);
        }
    }
    
    chatBox.appendChild(div);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ৪. এআই রেসপন্স হ্যান্ডলিং (Safety Filter সহ)
async function handleChat() {
    const text = userInput.value.trim();
    const imageInput = document.getElementById('image-upload');
    const file = imageInput.files[0];

    if (!text && !file) return;

    if (file) {
        const url = URL.createObjectURL(file);
        appendMessage('User', url, true);
    }
    if (text) appendMessage('User', text);

    userInput.value = "";
    document.getElementById('preview-container').classList.add('hidden');

    // Safety Filter (Harmful/18+ Check)
    const harmfulWords = ['sex', 'porn', 'kill', 'suicide', 'abuse', '১৮+', 'যৌন'];
    if (harmfulWords.some(word => text.toLowerCase().includes(word))) {
        appendMessage('StudentGPT', "দুঃখিত, আমি কেবল পড়াশোনা এবং গঠনমূলক প্রশ্নের উত্তর দিয়ে থাকি।");
        return;
    }

    // টাইপিং এনিমেশন
    const typing = document.createElement('div');
    typing.className = 'typing';
    typing.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    chatBox.appendChild(typing);

    try {
        let aiInput = text;
        if (file) {
            const visionResult = await visionModel(URL.createObjectURL(file));
            aiInput = `Image content: ${visionResult[0].generated_text}. Question: ${text}`;
        }

        const output = await textModel(aiInput, { max_new_tokens: 150 });
        typing.remove();
        
        const reply = output[0].generated_text;
        appendMessage('StudentGPT', reply);
    } catch (err) {
        typing.remove();
        appendMessage('StudentGPT', "আমি এখন কিছুটা ব্যস্ত, দয়া করে আবার চেষ্টা করুন।");
    }
}

// ৫. কল ফিচার (সরাসরি কথা বলা)
document.getElementById('call-btn').onclick = () => {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'bn-BD';
    recognition.start();
    
    speak("আমি শুনছি, বলুন।");
    
    recognition.onresult = (event) => {
        const voiceText = event.results[0][0].transcript;
        userInput.value = voiceText;
        handleChat();
    };
};

document.getElementById('send-btn').onclick = handleChat;
userInput.onkeydown = (e) => { if (e.key === 'Enter') handleChat(); };

// ইমেজ প্রিভিউ লজিক
document.getElementById('image-upload').onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('image-preview').src = URL.createObjectURL(file);
        document.getElementById('preview-container').classList.remove('hidden');
    }
};

window.onload = initAI;
    

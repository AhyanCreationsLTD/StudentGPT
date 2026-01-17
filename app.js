import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

// মেমোরি বাঁচানোর জন্য সেটিংস
env.allowLocalModels = false;
env.useBrowserCache = true;

const splash = document.getElementById('splash');
const app = document.getElementById('app');
const bar = document.getElementById('bar');
const pcText = document.getElementById('pc-text');
const box = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');

let studentGPT;

// ভয়েস আউটপুট
function speak(text) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'bn-BD';
    window.speechSynthesis.speak(u);
}

// এআই লোড করা
async function init() {
    try {
        studentGPT = await pipeline('text2text-generation', 'Xenova/flan-t5-small', {
            progress_callback: (p) => {
                if (p.status === 'progress') {
                    let progress = Math.round(p.progress);
                    bar.style.width = progress + '%';
                    pcText.innerText = progress + '%';
                }
            }
        });

        splash.style.opacity = '0';
        setTimeout(() => {
            splash.style.display = 'none';
            app.classList.remove('hidden');
        }, 500);

        const welcome = "স্টুডেন্ট জিপিটি তে আপনাকে স্বাগতম! আমাকে তৈরি করেছেন মোহাম্মদ আবদুল্লাহ। আমি আপনাকে সাহায্য করতে প্রস্তুত।";
        appendMsg('Bot', welcome);
        speak(welcome);

    } catch (e) {
        document.getElementById('st-label').innerText = "ইন্টারনেট কানেকশন চেক করে রিফ্রেশ দিন।";
    }
}

function appendMsg(sender, text) {
    const d = document.createElement('div');
    d.className = `msg ${sender === 'User' ? 'user-msg' : 'bot-msg'}`;
    d.innerText = text;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
}

async function handleChat() {
    const val = userInput.value.trim();
    if (!val) return;

    appendMsg('User', val);
    userInput.value = "";

    // পরিচয় চেক
    if (/তৈরি করেছে|আবদুল্লাহ|প্রতিষ্ঠাতা|owner/i.test(val)) {
        const res = "আমাকে আহিয়ান ক্রিয়েশন লিমিটেড এর প্রতিষ্ঠাতা মোহাম্মদ আবদুল্লাহ তৈরি করেছেন।";
        setTimeout(() => { appendMsg('Bot', res); speak(res); }, 500);
        return;
    }

    // টাইপিং এনিমেশন
    const t = document.createElement('div');
    t.className = 'typing';
    t.innerText = "StudentGPT লিখছে...";
    box.appendChild(t);

    try {
        const out = await studentGPT(val, { max_new_tokens: 100 });
        t.remove();
        const reply = out[0].generated_text;
        appendMsg('Bot', reply);
        speak(reply);
    } catch (e) {
        t.remove();
        appendMsg('Bot', "দুঃখিত, আমি বুঝতে পারিনি।");
    }
}

// কল/কথা বলা অপশন
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
userInput.onkeydown = (e) => { if (e.key === 'Enter') handleChat(); };

window.onload = init;
            

const splash = document.getElementById('splash');
const app = document.getElementById('app');
const bar = document.getElementById('bar');
const pc = document.getElementById('pc');
const box = document.getElementById('chat-box');
const ui = document.getElementById('ui');

// ভয়েস আউটপুট
function speak(t) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'bn-BD';
    window.speechSynthesis.speak(u);
}

// লোডিং প্রগ্রেস সিমুলেশন (যাতে কালো স্ক্রিন না আসে)
let progress = 0;
function loadApp() {
    let interval = setInterval(() => {
        progress += Math.floor(Math.random() * 10) + 1;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            setTimeout(() => {
                splash.style.display = 'none';
                app.style.display = 'flex';
                const intro = "স্টুডেন্ট জিপিটি তে আপনাকে স্বাগতম! আমাকে তৈরি করেছেন মোহাম্মদ আবদুল্লাহ। আমি আপনাকে সাহায্য করতে প্রস্তুত।";
                append('Bot', intro);
                speak(intro);
            }, 500);
        }
        bar.style.width = progress + '%';
        pc.innerText = progress + '%';
    }, 150);
}

function append(role, text) {
    const d = document.createElement('div');
    d.className = `msg ${role === 'Bot' ? 'b-msg' : 'u-msg'}`;
    d.innerText = text;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
}

// এআই রেসপন্স লজিক
async function handleChat() {
    const val = ui.value.trim();
    if (!val) return;

    append('User', val);
    ui.value = "";

    // আব্দুল্লাহর পরিচয় (আপনার রিকোয়ারমেন্ট অনুযায়ী)
    if (/তৈরি করেছে|আবদুল্লাহ|প্রতিষ্ঠাতা|owner|creator/i.test(val)) {
        const res = "আমাকে আহিয়ান ক্রিয়েশন লিমিটেড এর প্রতিষ্ঠাতা মোহাম্মদ আবদুল্লাহ তৈরি করেছেন।";
        setTimeout(() => { append('Bot', res); speak(res); }, 600);
        return;
    }

    // সিম্পল এআই রেসপন্স (যাতে অফলাইনেও মেসেজ আসে)
    setTimeout(() => {
        let reply = "আমি আপনার প্রশ্নটি বুঝতে পেরেছি। পড়াশোনা বিষয়ক যেকোনো সাহায্য করতে আমি প্রস্তুত।";
        append('Bot', reply);
        speak(reply);
    }, 1000);
}

document.getElementById('sb').onclick = handleChat;
ui.onkeydown = (e) => { if (e.key === 'Enter') handleChat(); };

// কল অপশন (ভয়েস ইনপুট)
document.getElementById('call').onclick = () => {
    const sr = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    sr.lang = 'bn-BD';
    sr.start();
    speak("আমি শুনছি, বলুন।");
    sr.onresult = (e) => {
        ui.value = e.results[0][0].transcript;
        handleChat();
    };
};

window.onload = loadApp;
    

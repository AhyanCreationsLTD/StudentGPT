import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

env.allowLocalModels = false;

const splash = document.getElementById('splash');
const mainApp = document.getElementById('main-app');
const bar = document.getElementById('bar');
const pc = document.getElementById('pc');
const box = document.getElementById('box');
const ui = document.getElementById('ui');

let model, vision;

function speak(t) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(t);
    u.lang = 'bn-BD';
    window.speechSynthesis.speak(u);
}

// পরিচয়ের মেসেজ
const intro = "স্টুডেন্ট জিপিটি তে আপনাকে স্বাগতম! পড়ালেখার যেকোনো বিষয়ে স্টুডেন্ট জিপিটি সবসময় সবার জন্য উন্মুক্ত। আমাকে আহিয়ান ক্রিয়েশন লিমিটেড এর প্রতিষ্ঠাতা মোহাম্মদ আবদুল্লাহ তৈরি করেছেন।";

async function init() {
    try {
        model = await pipeline('text2text-generation', 'Xenova/flan-t5-small', {
            progress_callback: (d) => {
                if(d.status === 'progress') {
                    let p = Math.round(d.progress);
                    bar.style.width = p + '%';
                    pc.innerText = p + '%';
                }
            }
        });
        vision = await pipeline('image-to-text', 'Xenova/vit-gpt2-image-captioning');
        
        splash.style.display = 'none';
        mainApp.style.display = 'flex';
        
        append('StudentGPT', intro);
        speak(intro);
    } catch (e) { alert("Internet slow! Refresh please."); }
}

function append(s, t) {
    const d = document.createElement('div');
    d.className = `msg ${s === 'StudentGPT' ? 'bot-msg' : 'user-msg'}`;
    d.innerText = t;
    box.appendChild(d);
    box.scrollTop = box.scrollHeight;
}

async function chat() {
    const t = ui.value.trim();
    if(!t) return;
    append('You', t);
    ui.value = "";

    // আব্দুল্লাহর পরিচয় চেক
    if(/তৈরি করেছে|প্রতিষ্ঠাতা|আবদুল্লাহ|owner|creator/i.test(t)) {
        const res = "আমাকে আহিয়ান ক্রিয়েশন লিমিটেড এর প্রতিষ্ঠাতা মোহাম্মদ আবদুল্লাহ তৈরি করেছেন।";
        setTimeout(() => { append('StudentGPT', res); speak(res); }, 500);
        return;
    }

    // Typing animation
    const td = document.createElement('div');
    td.className = 'typing'; td.innerHTML = '<div class="dot"></div><div class="dot"></div><div class="dot"></div>';
    box.appendChild(td);

    try {
        const out = await model(t, { max_new_tokens: 100 });
        td.remove();
        const reply = out[0].generated_text;
        append('StudentGPT', reply);
        speak(reply);
    } catch(e) { td.remove(); }
}

document.getElementById('sb').onclick = chat;
ui.onkeydown = (e) => { if(e.key === 'Enter') chat(); };

// কল অপশন (ভয়েস ইনপুট)
document.getElementById('call').onclick = () => {
    const sr = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    sr.lang = 'bn-BD';
    sr.start();
    sr.onresult = (e) => { ui.value = e.results[0][0].transcript; chat(); };
};

window.onload = init;

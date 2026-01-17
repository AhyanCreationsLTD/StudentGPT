const splash = document.getElementById('splash');
const app = document.getElementById('app');
const bar = document.getElementById('bar');
const pcText = document.getElementById('pc-text');
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const typing = document.getElementById('typing-indicator');

// ১. স্মুথ লোডিং প্রসেস
let progress = 0;
window.onload = () => {
    let loadTimer = setInterval(() => {
        progress += Math.floor(Math.random() * 7) + 3;
        if (progress >= 100) {
            progress = 100;
            clearInterval(loadTimer);
            setTimeout(() => {
                splash.classList.add('hidden');
                app.classList.remove('hidden');
                appendMessage('Bot', "স্টুডেন্ট জিপিটি তে আপনাকে স্বাগতম! আমি আপনার পড়াশোনার সঙ্গী। আমাকে তৈরি করেছেন মোহাম্মদ আবদুল্লাহ।");
            }, 500);
        }
        bar.style.width = progress + '%';
        pcText.innerText = progress + '%';
    }, 100);
};

// ২. মেসেজ যোগ করার ফাংশন
function appendMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `msg ${sender === 'User' ? 'user-msg' : 'bot-msg'}`;
    msgDiv.innerText = text;
    chatBox.appendChild(msgDiv);
    chatBox.scrollTop = chatBox.scrollHeight;
}

// ৩. চ্যাট হ্যান্ডলিং (শুধুমাত্র টেক্সট)
async function handleChat() {
    const question = userInput.value.trim();
    if (!question) return;

    appendMessage('User', question);
    userInput.value = "";
    typing.classList.remove('hidden');

    // এআই রেসপন্স সিমুলেশন
    setTimeout(() => {
        typing.classList.add('hidden');
        let answer = "";

        const lowerQ = question.toLowerCase();
        
        // আব্দুল্লাহর পরিচয়
        if (lowerQ.includes("তৈরি") || lowerQ.includes("আবদুল্লাহ") || lowerQ.includes("owner") || lowerQ.includes("creator")) {
            answer = "আমাকে আহিয়ান ক্রিয়েশন লিমিটেড এর প্রতিষ্ঠাতা মোহাম্মদ আবদুল্লাহ তৈরি করেছেন।";
        } 
        // সেফটি ফিল্টার
        else if (lowerQ.match(/sex|porn|kill|bad|১৮\+|খারাপ/)) {
            answer = "দুঃখিত, আমি কেবল পড়াশোনা এবং শিক্ষামূলক প্রশ্নের উত্তর দিতে পারি।";
        } 
        // সাধারণ উত্তর
        else {
            answer = "আপনার প্রশ্নটি আমি বুঝতে পেরেছি। স্টুডেন্ট জিপিটি হিসেবে আমি আপনাকে গণিত, বিজ্ঞান বা যেকোনো বিষয়ে সাহায্য করতে প্রস্তুত। দয়া করে আপনার নির্দিষ্ট প্রশ্নটি লিখুন।";
        }

        appendMessage('Bot', answer);
    }, 1200);
}

// ইভেন্ট লিসেনার
document.getElementById('send-btn').onclick = handleChat;
userInput.onkeypress = (e) => { if (e.key === 'Enter') handleChat(); };

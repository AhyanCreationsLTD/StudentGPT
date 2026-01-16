import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

// গিটহাব পেজের জন্য প্রয়োজনীয় কনফিগারেশন
env.allowLocalModels = false;
env.useBrowserCache = true;

const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let generator = null;

function appendMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender === 'You' ? 'user-message' : 'bot-message'}`;
    messageElement.innerHTML = `<p><strong>${sender}:</strong> ${text}</p>`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight;
}

async function loadModel() {
    try {
        appendMessage('StudentGPT', 'মডেল লোড হওয়া শুরু হয়েছে... প্রথমবার প্রায় ৮০-১০০ এমবি ফাইল ডাউনলোড হবে। অনুগ্রহ করে ১-২ মিনিট অপেক্ষা করুন এবং ইন্টারনেট কানেকশন চেক করুন।');
        
        // আমরা আরও ছোট একটি মডেল ব্যবহার করছি দ্রুত লোড হওয়ার জন্য
        generator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-78M');
        
        appendMessage('StudentGPT', 'অভিনন্দন! মডেল লোড সম্পন্ন হয়েছে। এখন আপনি পড়াশোনা বিষয়ক যে কোনো প্রশ্ন করতে পারেন।');
    } catch (error) {
        console.error("Model load error:", error);
        appendMessage('StudentGPT', 'দুঃখিত! মডেলটি ডাউনলোড হতে বাধা পাচ্ছে। আপনার ইন্টারনেট চেক করে পেজটি রিফ্রেশ (Refresh) দিন।');
    }
}

async function generateResponse(userText) {
    if (!generator) return "মডেল এখনও তৈরি নয়।";

    try {
        const output = await generator(userText, {
            max_new_tokens: 150,
            temperature: 0.7,
        });
        return output[0].generated_text;
    } catch (error) {
        return "উত্তরের জন্য প্রসেস করার সময় একটি সমস্যা হয়েছে।";
    }
}

sendBtn.onclick = async () => {
    const text = userInput.value.trim();
    if (!text || !generator) return;

    appendMessage('You', text);
    userInput.value = '';

    const response = await generateResponse(text);
    appendMessage('StudentGPT', response);
};

userInput.onkeypress = (e) => { if (e.key === 'Enter') sendBtn.click(); };

// পেজ লোড হলে মডেল শুরু হবে
window.onload = loadModel;

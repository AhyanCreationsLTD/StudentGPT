import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

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

// লোডিং স্ট্যাটাস দেখানোর ফাংশন
function updateLoadingStatus(data) {
    if (data.status === 'progress') {
        const progress = data.progress.toFixed(2);
        // আমরা সরাসরি চ্যাট বক্সে স্ট্যাটাস আপডেট দেখাবো
        let loader = document.getElementById('ai-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'ai-loader';
            loader.className = 'message bot-message';
            chatBox.appendChild(loader);
        }
        loader.innerHTML = `<p><strong>StudentGPT:</strong> মডেল ডাউনলোড হচ্ছে: ${progress}% সম্পন্ন।</p>`;
        chatBox.scrollTop = chatBox.scrollHeight;
    } else if (data.status === 'ready') {
        const loader = document.getElementById('ai-loader');
        if (loader) loader.remove();
        appendMessage('StudentGPT', 'মডেল রেডি! এখন প্রশ্ন করতে পারো।');
    }
}

async function loadModel() {
    try {
        appendMessage('StudentGPT', 'মডেল লোড হওয়া শুরু হয়েছে...');
        
        // প্রগ্রেস দেখার জন্য progress_callback যোগ করা হয়েছে
        generator = await pipeline('text2text-generation', 'Xenova/LaMini-Flan-T5-78M', {
            progress_callback: updateLoadingStatus
        });
        
    } catch (error) {
        console.error("Model load error:", error);
        appendMessage('StudentGPT', 'ইন্টারনেট কানেকশন চেক করে আবার চেষ্টা করো।');
    }
}

async function generateResponse(userText) {
    if (!generator) return "মডেল এখনও লোড হয়নি।";
    const output = await generator(userText, {
        max_new_tokens: 200,
        temperature: 0.7,
    });
    return output[0].generated_text;
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

window.onload = loadModel;

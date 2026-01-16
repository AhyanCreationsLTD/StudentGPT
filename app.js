import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

// কনফিগারেশন
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

// প্রগ্রেস দেখানোর ফাংশন
function showProgress(data) {
    if (data.status === 'progress') {
        const progressContainer = document.getElementById('progress-container');
        const progressBar = document.getElementById('progress-bar');
        
        if (!progressContainer) {
            const container = document.createElement('div');
            container.id = 'progress-container';
            container.style.display = 'block';
            container.innerHTML = '<div id="progress-bar"></div>';
            chatBox.appendChild(container);
        }

        const bar = document.getElementById('progress-bar');
        bar.style.width = data.progress + '%';
        
        // টেক্সট আপডেট
        let statusText = document.getElementById('status-text');
        if (!statusText) {
            statusText = document.createElement('p');
            statusText.id = 'status-text';
            statusText.style.fontSize = '12px';
            chatBox.appendChild(statusText);
        }
        statusText.innerText = `StudentGPT ডাউনলোড হচ্ছে: ${data.progress.toFixed(1)}%`;
    } else if (data.status === 'ready') {
        const container = document.getElementById('progress-container');
        if (container) container.remove();
        const statusText = document.getElementById('status-text');
        if (statusText) statusText.remove();
        appendMessage('StudentGPT', 'মডেল এখন প্রস্তুত! প্রশ্ন করুন।');
    }
}

async function loadModel() {
    try {
        // 'Xenova/flan-t5-small' ব্যবহার করছি কারণ এটি সবচেয়ে ছোট এবং দ্রুত (মাত্র ৬০ এমবি)
        generator = await pipeline('text2text-generation', 'Xenova/flan-t5-small', {
            progress_callback: showProgress
        });
    } catch (error) {
        console.error("Error:", error);
        appendMessage('StudentGPT', 'মডেল লোড হতে সমস্যা হচ্ছে। অনুগ্রহ করে পেজটি রিফ্রেশ দিন।');
    }
}

async function generateResponse(text) {
    if (!generator) return "দয়া করে মডেল লোড হওয়া পর্যন্ত অপেক্ষা করুন।";
    const output = await generator(text, { max_new_tokens: 100 });
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

window.onload = loadModel;

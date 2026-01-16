import { pipeline } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.1';

// DOM elements
const chatBox = document.getElementById('chat-box');
const userInput = document.getElementById('user-input');
const sendBtn = document.getElementById('send-btn');

let generator = null; // AI model instance
let isModelLoading = false; // To prevent multiple simultaneous loads

// --- Utility Functions ---

/**
 * Appends a message to the chat box.
 * @param {string} sender - 'You' or 'StudentGPT'
 * @param {string} text - The message content
 */
function appendMessage(sender, text) {
    const messageElement = document.createElement('div');
    messageElement.className = `message ${sender === 'You' ? 'user-message' : 'bot-message'}`;
    messageElement.innerHTML = `<p><strong>${sender}:</strong> ${text}</p>`;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to bottom
}

/**
 * Disables or enables the input and send button.
 * @param {boolean} disabled - true to disable, false to enable
 */
function toggleInputState(disabled) {
    userInput.disabled = disabled;
    sendBtn.disabled = disabled;
    sendBtn.textContent = disabled ? 'Processing...' : 'Send';
}

// --- AI Model Logic ---

/**
 * Loads the AI model using Transformers.js.
 */
async function loadModel() {
    if (isModelLoading) return; // Prevent double-loading
    isModelLoading = true;
    toggleInputState(true);
    appendMessage('StudentGPT', 'মডেল লোড হচ্ছে... অনুগ্রহ করে অপেক্ষা করুন (এটি আপনার ইন্টারনেট গতি ও ডিভাইসের উপর নির্ভর করবে)।');

    try {
        // Load a small but capable text generation model
        generator = await pipeline('text2text-generation', 'Xenova/laMini-Flan-T5-78M');
        appendMessage('StudentGPT', 'মডেল রেডি! এখন আপনি StudentGPT এর সাথে কথা বলতে পারেন।');
    } catch (error) {
        console.error("Error loading model:", error);
        appendMessage('StudentGPT', 'দুঃখিত, মডেল লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
        isModelLoading = false;
        toggleInputState(false);
    }
}

/**
 * Generates a response from the AI model.
 * @param {string} userText - The user's input question.
 * @returns {Promise<string>} - The AI's generated response.
 */
async function generateResponse(userText) {
    if (!generator) {
        appendMessage('StudentGPT', 'মডেল এখনও লোড হয়নি। অনুগ্রহ করে কিছুক্ষণ অপেক্ষা করুন।');
        return "মডেল লোড হচ্ছে...";
    }

    toggleInputState(true); // Disable input while processing

    try {
        // System instruction to guide StudentGPT's personality
        const systemPrompt = `Context: You are StudentGPT, a highly knowledgeable, helpful, and friendly AI academic assistant designed for students. 
        Your goal is to provide clear, concise, and accurate answers, explanations, and study assistance in Bengali or English as requested.
        Always break down complex topics, offer examples, help with grammar, and provide encouragement.
        Student Question: ${userText}`;

        const output = await generator(systemPrompt, {
            max_new_tokens: 250, // Allow longer responses
            temperature: 0.7,    // A bit creative but still factual
            repetition_penalty: 1.2,
            do_sample: true,     // Enable sampling for more varied responses
        });
        return output[0].generated_text;
    } catch (error) {
        console.error("Error generating response:", error);
        return "দুঃখিত, উত্তর তৈরি করতে সমস্যা হয়েছে।";
    } finally {
        toggleInputState(false); // Enable input after processing
    }
}

// --- Event Listeners ---

sendBtn.onclick = async () => {
    const text = userInput.value.trim();
    if (!text) return;

    appendMessage('You', text);
    userInput.value = ''; // Clear input field

    // Display a "..." message while AI processes
    const thinkingMessageElement = document.createElement('div');
    thinkingMessageElement.className = 'message bot-message';
    thinkingMessageElement.innerHTML = '<p><strong>StudentGPT:</strong> ...</p>';
    chatBox.appendChild(thinkingMessageElement);
    chatBox.scrollTop = chatBox.scrollHeight;

    const response = await generateResponse(text);
    thinkingMessageElement.querySelector('p').innerHTML = `<strong>StudentGPT:</strong> ${response}`; // Update the thinking message
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll again after update
};

// Allows sending message by pressing Enter key
userInput.onkeypress = (e) => {
    if (e.key === 'Enter' && !sendBtn.disabled) {
        sendBtn.click();
    }
};

// --- Initial Setup ---
document.addEventListener('DOMContentLoaded', loadModel); // Load model when the page is ready

  

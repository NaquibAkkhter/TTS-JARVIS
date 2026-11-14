// 1. HTML Elements ko pakadna
const textInput = document.getElementById('text-input');
const charCount = document.getElementById('count');
const voiceSelect = document.getElementById('voice-select');
const emotionSlider = document.getElementById('emotion-slider');
const emotionVal = document.getElementById('emotion-val');
const styleSlider = document.getElementById('style-slider');
const styleVal = document.getElementById('style-val');
const generateBtn = document.getElementById('generate-btn');
const resultBox = document.getElementById('result-box');
const audioPlayer = document.getElementById('audio-player');
const downloadBtn = document.getElementById('download-btn');

const tabVoice = document.getElementById('tab-voice');
const tabSfx = document.getElementById('tab-sfx');
const voiceControls = document.getElementById('voice-controls');
const emotionTags = document.getElementById('emotion-tags');

// 👇 Aapki ElevenLabs API Key yahan set hai
const ELEVEN_API_KEY = "sk_2ffe2b490c8049aaddec7ba803b67f54250b2ed05b052cf6";

let currentAudioUrl = null;
let currentMode = "voice"; // "voice" ya "sfx"

// 2. Mode Switching Logic (Human Voice vs Sound Effects)
tabVoice.addEventListener('click', () => {
    currentMode = "voice";
    tabVoice.classList.add('active');
    tabSfx.classList.remove('active');
    voiceControls.classList.remove('hidden');
    emotionTags.classList.remove('hidden');
    textInput.placeholder = "Yahan Hindi ya English mein dialogue likhein... (Jaise: Aaj main bahut khush hoon! ... Kya sach mein?)";
    generateBtn.textContent = "🔊 Generate Real Audio";
});

tabSfx.addEventListener('click', () => {
    currentMode = "sfx";
    tabSfx.classList.add('active');
    tabVoice.classList.remove('active');
    voiceControls.classList.add('hidden');
    emotionTags.classList.add('hidden');
    textInput.placeholder = "Sound Effect English mein describe karein... (Jaise: Heavy thunderstorm and rain, Cinematic bass boom, Scary footsteps in dark room)";
    generateBtn.textContent = "💥 Generate Sound Effect";
});

// 3. Quick Emotion Buttons (Click karne par text mein add ho)
document.querySelectorAll('.tag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const textToInsert = btn.getAttribute('data-insert');
        textInput.value += textToInsert;
        charCount.textContent = textInput.value.length;
        textInput.focus();
    });
});

// 4. Live Character Counter & Slider Percentage Update
textInput.addEventListener('input', () => {
    charCount.textContent = textInput.value.length;
});

emotionSlider.addEventListener('input', () => {
    emotionVal.textContent = `${emotionSlider.value}%`;
});

styleSlider.addEventListener('input', () => {
    styleVal.textContent = `${styleSlider.value}%`;
});

// 5. ElevenLabs Human Voice Function (Custom Voice ID + Emotion Support)
async function generateHumanVoice(text, defaultVoiceId) {
    const customIdInput = document.getElementById('custom-voice-id');
    const customVoiceId = customIdInput ? customIdInput.value.trim() : "";
    
    const finalVoiceId = customVoiceId !== "" ? customVoiceId : defaultVoiceId;

    const stability = (100 - parseInt(emotionSlider.value)) / 100;
    const style = parseInt(styleSlider.value) / 100;

    const url = `https://api.elevenlabs.io/v1/text-to-speech/${finalVoiceId}`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "xi-api-key": ELEVEN_API_KEY.trim(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
                stability: stability,
                similarity_boost: 0.75,
                style: style,
                use_speaker_boost: true
            }
        })
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail?.message || `API Error: ${response.status}`);
    }

    return await response.blob();
}

// 6. ElevenLabs Sound Effect (SFX) Function
async function generateSoundEffect(promptText) {
    const url = "https://api.elevenlabs.io/v1/sound-generation";

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "xi-api-key": ELEVEN_API_KEY.trim(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text: promptText,
            duration_seconds: 4,
            prompt_influence: 0.4
        })
    });

    if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail?.message || `SFX API Error: ${response.status}`);
    }

    return await response.blob();
}

// 7. Generate Button Click Handler
generateBtn.addEventListener('click', async () => {
    const text = textInput.value.trim();

    if (text === "") {
        alert("Kripya pehle kuch text likhein!");
        return;
    }

    if (!ELEVEN_API_KEY || ELEVEN_API_KEY.includes("YAHAN")) {
        alert("Pehle script.js mein apni ElevenLabs API Key daalein!");
        return;
    }

    generateBtn.textContent = "⏳ AI Studio Working...";
    generateBtn.disabled = true;

    try {
        let audioBlob;
        if (currentMode === "voice") {
            audioBlob = await generateHumanVoice(text, voiceSelect.value);
        } else {
            audioBlob = await generateSoundEffect(text);
        }

        if (currentAudioUrl) {
            URL.revokeObjectURL(currentAudioUrl);
        }

        currentAudioUrl = URL.createObjectURL(audioBlob);
        audioPlayer.src = currentAudioUrl;
        resultBox.classList.remove('hidden');
        audioPlayer.play();

    } catch (error) {
        alert("Error: " + error.message);
        console.error("Full Error:", error);
    } finally {
        generateBtn.textContent = currentMode === "voice" ? "🔊 Generate Real Audio" : "💥 Generate Sound Effect";
        generateBtn.disabled = false;
    }
});

// 8. Download MP3 Button
downloadBtn.addEventListener('click', () => {
    if (!currentAudioUrl) return;

    const a = document.createElement('a');
    a.href = currentAudioUrl;
    a.download = `naquib-${currentMode}-${Date.now()}.mp3`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
});
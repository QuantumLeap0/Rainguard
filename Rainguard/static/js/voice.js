// ======================================================
// RAINGUARD VOICE MODULE
// ======================================================

let recognition = null;

let recognitionSupported = false;

let recognitionAttempts = 0;

let successfulRecognitions = 0;


// ======================================================
// INITIALIZE SPEECH RECOGNITION
// ======================================================

function initializeVoiceRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        recognitionSupported = false;

        return false;
    }


    recognitionSupported = true;


    recognition = new SpeechRecognition();


    // Telugu voice recognition
    recognition.lang = "te-IN";

    recognition.continuous = false;

    recognition.interimResults = false;

    recognition.maxAlternatives = 1;


    recognition.onstart = function () {

        updateVoiceStatus(
            "🎤 Listening..."
        );

    };


    recognition.onresult = function(event) {

        recognitionAttempts++;

        successfulRecognitions++;


        const transcript =
            event.results[0][0].transcript;


        displayRecognizedSpeech(
            transcript
        );


        updateVoiceStatus(
            "✅ Speech recognized"
        );


        checkComprehension(
            transcript
        );

    };


    recognition.onerror = function(event) {

        recognitionAttempts++;


        console.log(
            "Voice recognition error:",
            event.error
        );


        updateVoiceStatus(
            "⚠️ Voice recognition failed"
        );


        showVoiceFallback();

    };


    recognition.onend = function() {

        console.log(
            "Voice recognition ended."
        );

    };


    return true;
}


// ======================================================
// START VOICE REGISTRATION
// ======================================================

function startVoiceRegistration() {

    hideVoiceFallback();


    if (!recognitionSupported) {

        showVoiceFallback();

        speakPolicyDisclosure();

        return;
    }


    speakPolicyDisclosure();


    setTimeout(
        function() {

            startListening();

        },
        3500
    );

}


// ======================================================
// SPEAK POLICY DISCLOSURE
// ======================================================

function speakPolicyDisclosure() {

    if (!("speechSynthesis" in window)) {

        showVoiceFallback();

        return;
    }


    window.speechSynthesis.cancel();


    const message =
        "రెయిన్ గార్డ్ రైతు పంట బీమా. " +
        "మీ ప్రాంతంలో వర్షపాతం నిర్ణయించిన స్థాయి కంటే తక్కువగా ఉంటే, " +
        "బీమా చెల్లింపు ఆటోమేటిక్‌గా మీ ఆఫ్‌లైన్ వాలెట్‌లో జమ అవుతుంది. " +
        "బీమా పాలసీని అర్థం చేసుకున్న తర్వాత మాత్రమే అది అమలులోకి వస్తుంది.";


    const speech =
        new SpeechSynthesisUtterance(
            message
        );


    speech.lang = "te-IN";

    speech.rate = 0.85;

    speech.pitch = 1;


    window.speechSynthesis.speak(
        speech
    );
}


// ======================================================
// START LISTENING
// ======================================================

function startListening() {

    if (!recognition) {

        showVoiceFallback();

        return;
    }


    updateVoiceStatus(
        "🎤 Please answer the question..."
    );


    try {

        recognition.start();

    }

    catch(error) {

        console.log(
            "Recognition could not start:",
            error
        );

        showVoiceFallback();

    }

}


// ======================================================
// COMPREHENSION CHECK
// ======================================================

function checkComprehension(
    transcript
) {

    const text =
        transcript.toLowerCase();


    /*
        For prototype purposes we accept
        common Telugu/English responses.

        Correct answers:
        అవును
        అవును నాకు అర్థమైంది
        yes
        understood
    */


    const positiveWords = [

        "అవును",
        "అర్థమైంది",
        "అర్థమయ్యింది",
        "yes",
        "understood",
        "ok"

    ];


    let understood = false;


    for (
        const word of positiveWords
    ) {

        if (
            text.includes(word)
        ) {

            understood = true;

            break;
        }

    }


    if (understood) {

        showComprehensionSuccess();

    }

    else {

        showComprehensionRetry();

    }

}


// ======================================================
// SUCCESS
// ======================================================

function showComprehensionSuccess() {

    const box =
        document.getElementById(
            "comprehensionResult"
        );


    if (!box) return;


    box.style.display = "block";


    box.className =
        "success-box";


    box.innerHTML = `

        <h3>
            ✅ Policy Understanding Confirmed
        </h3>

        <p>
            Your response indicates that
            you understood the policy.
        </p>

        <p>
            The policy can now be continued
            for binding.
        </p>

    `;


    updateVoiceStatus(
        "✅ Comprehension check passed"
    );
}


// ======================================================
// RETRY
// ======================================================

function showComprehensionRetry() {

    const box =
        document.getElementById(
            "comprehensionResult"
        );


    if (!box) return;


    box.style.display = "block";


    box.className =
        "warning-box";


    box.innerHTML = `

        <h3>
            ⚠️ Please try again
        </h3>

        <p>
            We could not confirm your
            understanding.
        </p>

        <p>
            Please listen again and answer
            "అవును" when you understand.
        </p>

        <button
            class="btn btn-primary"
            onclick="startVoiceRegistration()">

            🔊 Listen Again

        </button>

    `;

}


// ======================================================
// FALLBACK
// ======================================================

function showVoiceFallback() {

    const fallback =
        document.getElementById(
            "voiceFallback"
        );


    if (!fallback) return;


    fallback.style.display =
        "block";


    fallback.innerHTML = `

        <div class="warning-box">

            <h3>
                ⚠️ Voice Recognition Unavailable
            </h3>

            <p>
                Your device or browser could
                not recognize speech.
            </p>

            <p>
                You can continue using the
                button-based fallback.
            </p>

            <button
                class="btn btn-secondary"
                onclick="manualComprehension()">

                ✓ I Understand

            </button>

        </div>

    `;

}


// ======================================================
// HIDE FALLBACK
// ======================================================

function hideVoiceFallback() {

    const fallback =
        document.getElementById(
            "voiceFallback"
        );


    if (fallback) {

        fallback.style.display =
            "none";
    }

}


// ======================================================
// MANUAL FALLBACK
// ======================================================

function manualComprehension() {

    showComprehensionSuccess();

}


// ======================================================
// DISPLAY TRANSCRIPT
// ======================================================

function displayRecognizedSpeech(
    transcript
) {

    const output =
        document.getElementById(
            "recognizedSpeech"
        );


    if (!output) return;


    output.style.display =
        "block";


    output.innerHTML = `

        <strong>
            🎤 You said:
        </strong>

        <p>
            ${transcript}
        </p>

    `;

}


// ======================================================
// STATUS
// ======================================================

function updateVoiceStatus(
    message
) {

    const status =
        document.getElementById(
            "voiceStatus"
        );


    if (status) {

        status.textContent =
            message;
    }

}


// ======================================================
// ACCURACY METRIC
// ======================================================

function getVoiceAccuracy() {

    if (
        recognitionAttempts === 0
    ) {

        return 0;
    }


    return (
        successfulRecognitions /
        recognitionAttempts
    ) * 100;

}


// ======================================================
// EXPOSE FUNCTIONS
// ======================================================

window.startVoiceRegistration =
    startVoiceRegistration;

window.startListening =
    startListening;

window.manualComprehension =
    manualComprehension;

window.getVoiceAccuracy =
    getVoiceAccuracy;


// ======================================================
// INITIALIZE
// ======================================================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        initializeVoiceRecognition();

    }
);
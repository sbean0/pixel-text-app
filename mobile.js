window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const fonts = urlParams.get('fonts') ? urlParams.get('fonts').split(',') : [];
    const text = urlParams.get('text') || 'Sample Text';
    const color = urlParams.get('color') ? `#${urlParams.get('color')}` : '#000000';
    const encodedNote = urlParams.get('note') || '';
    const hideNote = urlParams.get('hideNote') === 'true';

    console.log('URL Parameters:', {
        fonts: fonts,
        text: text,
        color: color,
        encodedNote: encodedNote,
        hideNote: hideNote
    });

    const previewDiv = document.getElementById('textPreview');
    const fontListDiv = document.getElementById('fontList');
    const customNoteDiv = document.getElementById('customNote');
    const revealHintDiv = document.getElementById('revealHint');
    const showFontsBtn = document.getElementById('showFontsBtn');
    let isFontListVisible = false;
    let tapCount = 0;
    const tapsRequired = 3;
    let shakeCount = 0;
    const shakesRequired = 2;
    let lastShake = 0;
    const shakeThreshold = 15; // Acceleration threshold for a shake
    const shakeTimeWindow = 1000; // Time window (ms) to count as separate shakes
    let noteRevealed = false; // Track if the note has been revealed

    let note = '';
    try {
        note = encodedNote ? atob(decodeURIComponent(encodedNote)) : '';
    } catch (e) {
        console.error('Failed to decode note:', e);
        note = '';
    }
    console.log('Decoded note:', note);

    customNoteDiv.textContent = note ? `Note: ${note}` : '';

    if (!hideNote && note) {
        customNoteDiv.classList.add('visible');
        noteRevealed = true;
    } else if (hideNote && note) {
        revealHintDiv.style.display = 'block'; // Show the hint
    }

    // Function to reveal the note
    function revealNote() {
        if (!noteRevealed) {
            customNoteDiv.classList.add('visible');
            revealHintDiv.style.display = 'none'; // Hide the hint after revealing
            noteRevealed = true;
            tapCount = 0; // Reset tap count
            shakeCount = 0; // Reset shake count
        }
    }

    // Tap detection
    if (hideNote && note) {
        document.addEventListener('touchstart', (e) => {
            if (noteRevealed) return; // Skip if note is already revealed
            tapCount++;
            console.log('Tap count:', tapCount);
            if (tapCount >= tapsRequired) {
                revealNote();
            }
        });
    }

    // Shake detection
    if (hideNote && note) {
        if (window.DeviceMotionEvent) {
            window.addEventListener('devicemotion', (e) => {
                if (noteRevealed) return; // Skip if note is already revealed
                const acceleration = e.accelerationIncludingGravity;
                if (!acceleration) return;

                const x = acceleration.x || 0;
                const y = acceleration.y || 0;
                const z = acceleration.z || 0;

                // Calculate total acceleration
                const totalAcceleration = Math.sqrt(x * x + y * y + z * z);

                // Detect a shake based on acceleration threshold
                const currentTime = Date.now();
                if (totalAcceleration > shakeThreshold && (currentTime - lastShake) > shakeTimeWindow) {
                    shakeCount++;
                    lastShake = currentTime;
                    console.log('Shake count:', shakeCount);

                    if (shakeCount >= shakesRequired) {
                        revealNote();
                    }
                }
            });
        } else {
            console.warn('DeviceMotionEvent not supported. Note can still be revealed by tapping.');
        }
    }

    fonts.forEach(font => {
        const textDiv = document.createElement('div');
        textDiv.className = 'text-item';
        textDiv.style.fontFamily = `"${font}", sans-serif`;
        textDiv.style.color = color;
        textDiv.textContent = text;
        previewDiv.appendChild(textDiv);
    });

    fontListDiv.textContent = fonts.length > 0 ? `Fonts used: ${fonts.join(', ')}` : 'No fonts specified';

    showFontsBtn.addEventListener('click', () => {
        isFontListVisible = !isFontListVisible;
        fontListDiv.style.display = isFontListVisible ? 'block' : 'none';
        showFontsBtn.textContent = isFontListVisible ? 'Hide Font Names' : 'Show Font Names';
    });
};
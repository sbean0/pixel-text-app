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
    const showFontsBtn = document.getElementById('showFontsBtn');
    let isFontListVisible = false;
    let tapSequence = [];
    let noteRevealed = false;

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
    }

    function revealNote() {
        if (!noteRevealed) {
            customNoteDiv.classList.add('visible');
            noteRevealed = true;
            tapSequence = [];
        }
    }

    if (hideNote && note) {
        document.addEventListener('touchstart', (e) => {
            if (noteRevealed) return;

            // Get the tap coordinates
            const touch = e.touches[0];
            const x = touch.clientX;
            const y = touch.clientY;

            // Get viewport dimensions
            const viewportWidth = window.innerWidth;
            const viewportHeight = window.innerHeight;

            // Determine the quadrant
            const isRight = x > viewportWidth / 2;
            const isBottom = y > viewportHeight / 2;
            let quadrant;
            if (isRight && !isBottom) {
                quadrant = 'top-right';
            } else if (isRight && isBottom) {
                quadrant = 'bottom-right';
            } else if (!isRight && isBottom) {
                quadrant = 'bottom-left';
            } else {
                quadrant = 'top-left';
            }

            console.log(`Tap at (${x}, ${y}) - Quadrant: ${quadrant}`);

            // Add the quadrant to the sequence
            tapSequence.push(quadrant);

            // Check the sequence
            const requiredSequence = ['top-right', 'bottom-right', 'bottom-left'];
            if (tapSequence.length === requiredSequence.length) {
                const isCorrectSequence = tapSequence.every((tap, index) => tap === requiredSequence[index]);
                if (isCorrectSequence) {
                    revealNote();
                } else {
                    console.log('Incorrect tap sequence:', tapSequence);
                    tapSequence = []; // Reset if the sequence is incorrect
                }
            }
        });
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
window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const fonts = urlParams.get('fonts') ? urlParams.get('fonts').split(',') : [];
    const text = urlParams.get('text') || 'Sample Text';
    const color = urlParams.get('color') ? `#${urlParams.get('color')}` : '#000000';
    const note = urlParams.get('note') || '';
    const hideNote = urlParams.get('hideNote') === 'true';

    const previewDiv = document.getElementById('textPreview');
    const fontListDiv = document.getElementById('fontList');
    const customNoteDiv = document.getElementById('customNote');
    const showFontsBtn = document.getElementById('showFontsBtn');
    let isFontListVisible = false;
    let tapCount = 0;
    const tapsRequired = 3; // Number of taps to reveal the note

    // Set the note content
    customNoteDiv.textContent = note ? `Note: ${note}` : '';

    // Show the note if not hidden, otherwise wait for taps
    if (!hideNote && note) {
        customNoteDiv.classList.add('visible');
    }

    // Add tap event listener to reveal the note
    document.addEventListener('touchstart', (e) => {
        if (hideNote && note) {
            tapCount++;
            if (tapCount >= tapsRequired) {
                customNoteDiv.classList.add('visible');
                tapCount = 0; // Reset tap count after revealing
            }
        }
    });

    // Display the text preview in each font
    fonts.forEach(font => {
        const textDiv = document.createElement('div');
        textDiv.className = 'text-item';
        textDiv.style.fontFamily = `"${font}", sans-serif`;
        textDiv.style.color = color;
        textDiv.textContent = text;
        previewDiv.appendChild(textDiv);
    });

    // Populate the font list (initially hidden)
    fontListDiv.textContent = fonts.length > 0 ? `Fonts used: ${fonts.join(', ')}` : 'No fonts specified';

    // Toggle font list visibility on button click
    showFontsBtn.addEventListener('click', () => {
        isFontListVisible = !isFontListVisible;
        fontListDiv.style.display = isFontListVisible ? 'block' : 'none';
        showFontsBtn.textContent = isFontListVisible ? 'Hide Font Names' : 'Show Font Names';
    });
};
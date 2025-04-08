window.onload = function() {
    const urlParams = new URLSearchParams(window.location.search);
    const fonts = urlParams.get('fonts') ? urlParams.get('fonts').split(',') : [];
    const text = urlParams.get('text') || 'Sample Text';
    const color = urlParams.get('color') ? `#${urlParams.get('color')}` : '#000000';

    const previewDiv = document.getElementById('textPreview');
    const fontListDiv = document.getElementById('fontList');
    const showFontsBtn = document.getElementById('showFontsBtn');
    let isFontListVisible = false;

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
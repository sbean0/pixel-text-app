const originalFavorites = ["Monospace", "Press Start 2P", "VT323", "Pixelify Sans", "Silkscreen"];
let swappedOutFavorites = [];

function preloadFonts() {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 1;
    offscreenCanvas.height = 1;
    const ctx = offscreenCanvas.getContext('2d');
    const fonts = [
        "Monospace", "Press Start 2P", "VT323", "Pixelify Sans", "Silkscreen",
        "Orbitron", "Bungee", "Audiowide", "Geo", "Changa"
    ];
    fonts.forEach(font => {
        ctx.font = `60px "${font}"`;
        ctx.fillText("preload", 0, 0);
    });
}

window.onload = function() {
    preloadFonts();
    updateFavoriteDropdown();
};

function generateText() {
    const canvas = document.getElementById('textCanvas');
    const ctx = canvas.getContext('2d');
    const userText = document.getElementById('userInput').value;
    const selectedColor = document.getElementById('colorPicker').value;

    const checkboxes = document.querySelectorAll('input[name="font"]:checked');
    const selectedFonts = Array.from(checkboxes).map(cb => cb.value);

    if (selectedFonts.length === 0) {
        alert("Please select at least one font!");
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sectionHeight = canvas.height / selectedFonts.length;

    selectedFonts.forEach((font, index) => {
        ctx.font = `60px "${font}"`;
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = selectedColor;

        const textWidth = ctx.measureText(userText).width;
        const x = (canvas.width - textWidth) / 2;
        const metrics = ctx.measureText(userText);
        const textHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        const y = index * sectionHeight + (sectionHeight - textHeight) / 2 + metrics.fontBoundingBoxAscent;

        ctx.fillText(userText, x, y);

        if (index < selectedFonts.length - 1) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, (index + 1) * sectionHeight);
            ctx.lineTo(canvas.width, (index + 1) * sectionHeight);
            ctx.stroke();
        }
    });
}

function swapWithNewFont() {
    const dropdown = document.getElementById('newFontDropdown');
    const newFont = dropdown.value;
    if (!newFont) {
        alert("Please select a new font from the dropdown!");
        return;
    }

    const checkboxes = document.querySelectorAll('input[name="font"]');
    const checkedBoxes = Array.from(checkboxes).filter(cb => cb.checked);

    if (checkedBoxes.length === 0) {
        alert("Please check at least one favorite font to swap!");
        return;
    }

    const firstChecked = checkedBoxes[0];
    const oldFont = firstChecked.value;
    if (originalFavorites.includes(oldFont) && !swappedOutFavorites.includes(oldFont)) {
        swappedOutFavorites.push(oldFont);
    }
    firstChecked.value = newFont;
    firstChecked.nextSibling.textContent = ` ${newFont}`;
    updateFavoriteDropdown();
    generateText();
}

function swapWithFavoriteFont() {
    const dropdown = document.getElementById('favoriteFontDropdown');
    const favoriteFont = dropdown.value;
    if (!favoriteFont) {
        alert("Please select a favorite font to swap back!");
        return;
    }

    const checkboxes = document.querySelectorAll('input[name="font"]');
    const checkedBoxes = Array.from(checkboxes).filter(cb => cb.checked);

    if (checkedBoxes.length === 0) {
        alert("Please check at least one font to swap back!");
        return;
    }

    const firstChecked = checkedBoxes[0];
    firstChecked.value = favoriteFont;
    firstChecked.nextSibling.textContent = ` ${favoriteFont}`;
    swappedOutFavorites = swappedOutFavorites.filter(f => f !== favoriteFont);
    updateFavoriteDropdown();
    generateText();
}

function addCustomFont() {
    const customFontInput = document.getElementById('customFontInput').value.trim();
    if (!customFontInput) {
        alert("Please enter a font name or URL!");
        return;
    }

    const checkboxes = document.querySelectorAll('input[name="font"]');
    const checkedBoxes = Array.from(checkboxes).filter(cb => cb.checked);

    if (checkedBoxes.length === 0) {
        alert("Please check at least one favorite font to replace with your custom font!");
        return;
    }

    // Check if it's a URL
    if (customFontInput.startsWith('http://') || customFontInput.startsWith('https://')) {
        const fontName = `CustomFont_${Date.now()}`; // Unique name for the font
        const fontFace = new FontFace(fontName, `url(${customFontInput})`);
        fontFace.load().then(loadedFont => {
            document.fonts.add(loadedFont);
            replaceFont(checkedBoxes[0], fontName);
        }).catch(err => {
            alert("Failed to load font from URL: " + err.message);
        });
    } else {
        // Assume it's a font name available on the user's system
        replaceFont(checkedBoxes[0], customFontInput);
    }

    document.getElementById('customFontInput').value = ''; // Clear input
}

function replaceFont(checkbox, newFont) {
    const oldFont = checkbox.value;
    if (originalFavorites.includes(oldFont) && !swappedOutFavorites.includes(oldFont)) {
        swappedOutFavorites.push(oldFont);
    }
    checkbox.value = newFont;
    checkbox.nextSibling.textContent = ` ${newFont}`;
    updateFavoriteDropdown();
    generateText();
}

function updateFavoriteDropdown() {
    const dropdown = document.getElementById('favoriteFontDropdown');
    dropdown.innerHTML = '<option value="">Swap Back to Favorite</option>';
    swappedOutFavorites.forEach(font => {
        const option = document.createElement('option');
        option.value = font;
        option.textContent = font;
        dropdown.appendChild(option);
    });
}

function downloadImage() {
    const canvas = document.getElementById('textCanvas');
    const link = document.createElement('a');
    link.download = 'font-comparison.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}
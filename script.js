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
    setupDragAndDrop();
    generateText(); // Initial render
    
    // Add real-time toggle for divider lines
    const showDividersCheckbox = document.getElementById('showDividers');
    showDividersCheckbox.addEventListener('change', generateText);
};

function setupDragAndDrop() {
    const containers = document.querySelectorAll('.new-fonts, .active-fonts, .favorite-fonts');
    containers.forEach(container => {
        container.addEventListener('dragover', e => e.preventDefault());
        container.addEventListener('drop', e => {
            e.preventDefault();
            const font = e.dataTransfer.getData('text/plain');
            
            if (container.id === 'activeFonts') {
                const currentFonts = container.querySelectorAll('.font-item').length;
                if (currentFonts >= 6) {
                    alert("Maximum of 6 fonts allowed in Active Fonts!");
                    return;
                }
            }

            const fontItem = document.createElement('div');
            fontItem.className = 'font-item';
            fontItem.draggable = true;
            fontItem.textContent = font;
            container.appendChild(fontItem);
            const draggedElement = document.querySelector('.dragging');
            if (draggedElement) draggedElement.remove();
            if (container.id === 'favoriteFonts' && originalFavorites.includes(font) && !swappedOutFavorites.includes(font)) {
                swappedOutFavorites.push(font);
            }
            if (container.id === 'activeFonts') generateText();
        });
    });

    document.addEventListener('dragstart', e => {
        if (e.target.className === 'font-item') {
            e.target.classList.add('dragging');
            e.dataTransfer.setData('text/plain', e.target.textContent);
        }
    });

    document.addEventListener('dragend', e => {
        if (e.target.className.includes('font-item')) {
            e.target.classList.remove('dragging');
        }
    });
}

function generateText() {
    const canvas = document.getElementById('textCanvas');
    const ctx = canvas.getContext('2d');
    const userText = document.getElementById('userInput').value;
    const selectedColor = document.getElementById('colorPicker').value;
    const showDividers = document.getElementById('showDividers').checked;

    const activeFonts = Array.from(document.querySelectorAll('#activeFonts .font-item')).map(item => item.textContent);

    if (activeFonts.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const qrHeight = 100;
    const textAreaHeight = canvas.height - qrHeight;
    const sectionHeight = textAreaHeight / activeFonts.length;

    activeFonts.forEach((font, index) => {
        ctx.font = `60px "${font}"`;
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = selectedColor;

        const metrics = ctx.measureText(userText);
        const textHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        const textWidth = ctx.measureText(userText).width;
        const x = (canvas.width - textWidth) / 2;
        const y = qrHeight + (index * sectionHeight) + (sectionHeight / 2) + (metrics.fontBoundingBoxAscent - textHeight / 2);

        ctx.fillText(userText, x, y);

        if (showDividers && index < activeFonts.length - 1) {
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, qrHeight + (index + 1) * sectionHeight);
            ctx.lineTo(canvas.width, qrHeight + (index + 1) * sectionHeight);
            ctx.stroke();
        }
    });

    const fontParam = encodeURIComponent(activeFonts.join(','));
    const textParam = encodeURIComponent(userText);
    const colorParam = selectedColor.replace('#', '');
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const qrUrl = `${baseUrl}mobile.html?fonts=${fontParam}&text=${textParam}&color=${colorParam}`;
    const qrCanvas = document.createElement('canvas');
    QRCode.toCanvas(qrCanvas, qrUrl, { 
        width: 100, 
        margin: 1,
        color: {
            dark: selectedColor, // Use the selected color for the QR code
            light: '#ffffff' // Keep the background white
        }
    }, (error) => {
        if (error) console.error(error);
        ctx.drawImage(qrCanvas, canvas.width - 110, 10);
    });
}

function addCustomFont() {
    const customFontInput = document.getElementById('customFontInput').value.trim();
    if (!customFontInput) {
        alert("Please enter a font name or URL!");
        return;
    }

    const activeBox = document.getElementById('activeFonts');
    const currentFonts = activeBox.querySelectorAll('.font-item').length;
    if (currentFonts >= 6) {
        alert("Maximum of 6 fonts allowed in Active Fonts! Remove one first.");
        return;
    }

    if (customFontInput.startsWith('http://') || customFontInput.startsWith('https://')) {
        const fontName = `CustomFont_${Date.now()}`;
        const fontFace = new FontFace(fontName, `url(${customFontInput})`);
        fontFace.load().then(loadedFont => {
            document.fonts.add(loadedFont);
            addFontToBox(activeBox, fontName);
        }).catch(err => {
            alert("Failed to load font from URL: " + err.message);
        });
    } else {
        addFontToBox(activeBox, customFontInput);
    }

    document.getElementById('customFontInput').value = '';
}

function addFontToBox(box, font) {
    const fontItem = document.createElement('div');
    fontItem.className = 'font-item';
    fontItem.draggable = true;
    fontItem.textContent = font;
    box.appendChild(fontItem);
    generateText();
}

function downloadImage() {
    const canvas = document.getElementById('textCanvas');
    const link = document.createElement('a');
    link.download = 'font-comparison.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}
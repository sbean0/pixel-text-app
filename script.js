const fontSizeAdjustments = {
    "Press Start 2P": 48,
};

const allFonts = [
    "Monospace", "Press Start 2P", "VT323", "Pixelify Sans", "Silkscreen",
    "Orbitron", "Bungee", "Audiowide", "Geo", "Changa"
];

function preloadFonts() {
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = 1;
    offscreenCanvas.height = 1;
    const ctx = offscreenCanvas.getContext('2d');
    allFonts.forEach(font => {
        const fontSize = fontSizeAdjustments[font] || 60;
        ctx.font = `${fontSize}px "${font}"`;
        ctx.fillText("preload", 0, 0);
    });
}

window.onload = function() {
    preloadFonts();
    setupDragAndDrop();
    generateText();
    
    const showDividersCheckbox = document.getElementById('showDividers');
    showDividersCheckbox.addEventListener('change', generateText);
};

function setupDragAndDrop() {
    const containers = document.querySelectorAll('.available-fonts, .active-fonts');
    containers.forEach(container => {
        container.addEventListener('dragover', e => e.preventDefault());
        container.addEventListener('drop', e => {
            e.preventDefault();
            const font = e.dataTransfer.getData('text/plain');
            const draggedElement = document.querySelector('.dragging');
            
            if (container.id === 'activeFonts') {
                const currentFonts = container.querySelectorAll('.font-item').length;
                if (currentFonts >= 6) {
                    alert("Maximum of 6 fonts allowed in Active Fonts!");
                    return;
                }
                const fontItem = document.createElement('div');
                fontItem.className = 'font-item';
                fontItem.draggable = true;
                fontItem.textContent = font;
                container.appendChild(fontItem);
                generateText();
            } else if (container.id === 'availableFonts') {
                const existingFonts = Array.from(container.querySelectorAll('.font-item')).map(item => item.textContent);
                if (!existingFonts.includes(font)) {
                    const fontItem = document.createElement('div');
                    fontItem.className = 'font-item';
                    fontItem.draggable = true;
                    fontItem.textContent = font;
                    container.appendChild(fontItem);
                }
                if (draggedElement && draggedElement.parentElement.id === 'activeFonts') {
                    draggedElement.remove();
                    generateText();
                }
            }
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
    const customNote = document.getElementById('customNote').value;
    const hideNote = document.getElementById('hideNote').checked;
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
        const fontSize = fontSizeAdjustments[font] || 60;
        ctx.font = `${fontSize}px "${font}"`;
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
    const noteParam = customNote ? encodeURIComponent(btoa(customNote)) : '';
    const hideNoteParam = hideNote ? 'true' : 'false';
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    const qrUrl = `${baseUrl}mobile.html?fonts=${fontParam}&text=${textParam}&color=${colorParam}&note=${noteParam}&hideNote=${hideNoteParam}`;
    const qrCanvas = document.createElement('canvas');
    QRCode.toCanvas(qrCanvas, qrUrl, { 
        width: 100, 
        margin: 1,
        color: {
            dark: selectedColor,
            light: '#ffffff'
        }
    }, (error) => {
        if (error) console.error(error);
        ctx.drawImage(qrCanvas, canvas.width - 110, 10); // Adjusted for new width (1000 - 110 = 890)
    });
}

function addCustomFont() {
    const customFontInput = document.getElementById('customFontInput').value.trim();
    if (!customFontInput) {
        alert("Please enter a font name or URL!");
        return;
    }

    const availableBox = document.getElementById('availableFonts');
    const activeBox = document.getElementById('activeFonts');
    const currentActiveFonts = activeBox.querySelectorAll('.font-item').length;
    if (currentActiveFonts >= 6) {
        alert("Maximum of 6 fonts allowed in Active Fonts! Remove one first.");
        return;
    }

    if (customFontInput.startsWith('http://') || customFontInput.startsWith('https://')) {
        const fontName = `CustomFont_${Date.now()}`;
        const fontFace = new FontFace(fontName, `url(${customFontInput})`);
        fontFace.load().then(loadedFont => {
            document.fonts.add(loadedFont);
            addFontToAvailableBox(fontName);
            addFontToBox(activeBox, fontName);
        }).catch(err => {
            alert("Failed to load font from URL: " + err.message);
        });
    } else {
        addFontToAvailableBox(customFontInput);
        addFontToBox(activeBox, customFontInput);
    }

    document.getElementById('customFontInput').value = '';
}

function addFontToAvailableBox(font) {
    const availableBox = document.getElementById('availableFonts');
    const existingFonts = Array.from(availableBox.querySelectorAll('.font-item')).map(item => item.textContent);
    if (!existingFonts.includes(font)) {
        const fontItem = document.createElement('div');
        fontItem.className = 'font-item';
        fontItem.draggable = true;
        fontItem.textContent = font;
        availableBox.appendChild(fontItem);
        allFonts.push(font);
    }
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
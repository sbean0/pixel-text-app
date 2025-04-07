function generateText() {
    const canvas = document.getElementById('textCanvas');
    const ctx = canvas.getContext('2d');
    const userText = document.getElementById('userInput').value; // Removed .toUpperCase()
    const selectedColor = document.getElementById('colorPicker').value;

    // Get selected fonts
    const checkboxes = document.querySelectorAll('input[name="font"]:checked');
    const selectedFonts = Array.from(checkboxes).map(cb => cb.value);

    if (selectedFonts.length === 0) {
        alert("Please select at least one font!");
        return;
    }

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate section height
    const sectionHeight = canvas.height / selectedFonts.length;

    // Draw each selected font
    selectedFonts.forEach((font, index) => {
        ctx.font = `60px "${font}"`;
        ctx.imageSmoothingEnabled = false;
        ctx.fillStyle = selectedColor;

        const textWidth = ctx.measureText(userText).width;
        const x = (canvas.width - textWidth) / 2; // Center horizontally
        const metrics = ctx.measureText(userText);
        const textHeight = metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
        const y = index * sectionHeight + (sectionHeight - textHeight) / 2 + metrics.fontBoundingBoxAscent;

        ctx.fillText(userText, x, y);

        // Draw a horizontal line between sections
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

function downloadImage() {
    const canvas = document.getElementById('textCanvas');
    const link = document.createElement('a');
    link.download = 'font-comparison.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
}
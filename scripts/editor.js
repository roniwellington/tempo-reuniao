function addTitle() {
    
        document.execCommand('formatBlock', false, 'h1');
        document.execCommand('insertText', false, title);
        document.execCommand('formatBlock', false, 'div');
    
}

function addSubtitle() {
    document.execCommand('formatBlock', false, 'h2');
    document.execCommand('insertText', false, subtitle);
    document.execCommand('formatBlock', false, 'div');
   
}

function addParagraph() {
    document.execCommand('formatBlock', false, 'p');
    document.execCommand('insertText', false, paragraph);
    
}

function toggleBold() {
    document.execCommand('bold');
}

function addImage() {
    document.getElementById('imageInput').click();
}

function loadImage(event) {
    let file = event.target.files[0];
    let reader = new FileReader();
    reader.onload = function(e) {
        let img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '100%';
        let caption = prompt("Digite a legenda da imagem:");
        let figure = document.createElement('figure');
        figure.appendChild(img);
        if (caption) {
            let figcaption = document.createElement('figcaption');
            figcaption.textContent = caption;
            figure.appendChild(figcaption);
        }
        document.getElementById('editor').appendChild(figure);
    };
    reader.readAsDataURL(file);
}

async function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const editor = document.getElementById('editor');
    

    // Create a temporary div to hold the cloned editor content
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.top = '-99999px';
    tempDiv.style.width = '210mm'; // A4 width
    tempDiv.style.padding = '20px'; // Add some padding if necessary
    tempDiv.innerHTML = editor.innerHTML;
    document.body.appendChild(tempDiv);

    await html2canvas(tempDiv, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0
        
        // Add the image to the PDF and handle multi-page content
        while (heightLeft > 0) {
            doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= 297;
            position -= 297;
            if (heightLeft > 0) {
                doc.addPage();
            }
        }
        doc.save('documento.pdf');
    });
    document.body.removeChild(tempDiv); // Clean up the temporary div
}
function downloadPNG() {
    html2canvas(document.getElementById('editor')).then(canvas => {
        let link = document.createElement('a');
        link.download = 'documento.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
}

function downloadJPEG() {
    html2canvas(document.getElementById('editor')).then(canvas => {
        let link = document.createElement('a');
        link.download = 'documento.jpeg';
        link.href = canvas.toDataURL('image/jpeg');
        link.click();
    });
}

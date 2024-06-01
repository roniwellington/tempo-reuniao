function addTitle() {
    // let title = prompt("Digite o título:");
        document.execCommand('formatBlock', false, 'h1');
        document.execCommand('insertText', false, title);
        document.execCommand('formatBlock', false, 'div');
    // if (title) {
    //     document.execCommand('formatBlock', false, 'h1');
    //     document.execCommand('insertText', false, title);
    //     document.execCommand('formatBlock', false, 'div'); // Reseta o formato para o próximo conteúdo ser div
    // }
}

function addSubtitle() {
    document.execCommand('formatBlock', false, 'h2');
    document.execCommand('insertText', false, subtitle);
    document.execCommand('formatBlock', false, 'div');
    // let subtitle = prompt("Digite o subtítulo:");
    // if (subtitle) {
    //     document.execCommand('formatBlock', false, 'h2');
    //     document.execCommand('insertText', false, subtitle);
    //     document.execCommand('formatBlock', false, 'div'); // Reseta o formato para o próximo conteúdo ser div
    // }
}

function addParagraph() {
    document.execCommand('formatBlock', false, 'p');
    document.execCommand('insertText', false, paragraph);
    // let paragraph = prompt("Digite o parágrafo:");
    // if (paragraph) {
    //     document.execCommand('formatBlock', false, 'p');
    //     document.execCommand('insertText', false, paragraph);
    // }
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
    
    await html2canvas(editor, { scale: 2 }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 210; // A4 width in mm
        const imgHeight = canvas.height * imgWidth / canvas.width;
        
        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        doc.save('documento.pdf');
    });
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

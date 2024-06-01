document.getElementById('file-input').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const viewerContainer = document.getElementById('viewer-container');
    viewerContainer.innerHTML = '';

    if (!file) return;

    const fileReader = new FileReader();
    
    fileReader.onload = function(e) {
        const content = e.target.result;
        const fileType = file.type;

        if (fileType === 'application/pdf') {
            renderPDF(content, viewerContainer);
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            renderDOCX(content, viewerContainer);
        } else if (fileType === 'text/plain') {
            renderTXT(content, viewerContainer);
        } else if (fileType.startsWith('image/')) {
            renderImage(content, viewerContainer);
        } else if (fileType.startsWith('video/')) {
            renderVideo(content, viewerContainer);
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
            renderXLSX(content, viewerContainer);
        } else if (fileType === 'text/csv') {
            renderCSV(content, viewerContainer);
        } else if (fileType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation') {
            renderPPTX(file, viewerContainer);
        } else {
            viewerContainer.innerText = 'Formato de arquivo não suportado';
        }
    };
    
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        fileReader.readAsDataURL(file);
    } else {
        fileReader.readAsArrayBuffer(file);
    }
});

document.getElementById('download-pdf').addEventListener('click', function() {
    const viewerContainer = document.getElementById('viewer-container');
    convertToPDF(viewerContainer);
});

document.getElementById('download-png').addEventListener('click', function() {
    const viewerContainer = document.getElementById('viewer-container');
    html2canvas(viewerContainer).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = 'arquivo.png';
        link.click();
    });
});

document.getElementById('download-jpeg').addEventListener('click', function() {
    const viewerContainer = document.getElementById('viewer-container');
    html2canvas(viewerContainer).then(canvas => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/jpeg');
        link.download = 'arquivo.jpeg';
        link.click();
    });
});

function renderPDF(content, container) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';

    const loadingTask = pdfjsLib.getDocument({data: content});
    loadingTask.promise.then(function(pdf) {
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            pdf.getPage(pageNum).then(function(page) {
                const scale = 1.5;
                const viewport = page.getViewport({ scale: scale });

                const canvas = document.createElement('canvas');
                container.appendChild(canvas);
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                page.render(renderContext);
            });
        }
    });
}

function renderDOCX(content, container) {
    mammoth.convertToHtml({arrayBuffer: content})
        .then(function(result) {
            container.innerHTML = result.value;
        })
        .catch(function(err) {
            container.innerText = 'Erro ao carregar o documento DOCX';
            console.error(err);
        });
}

function renderTXT(content, container) {
    const text = new TextDecoder().decode(content);
    const pre = document.createElement('pre');
    pre.textContent = text;
    container.appendChild(pre);
}

function renderImage(content, container) {
    const img = document.createElement('img');
    img.src = content;
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    container.appendChild(img);
}

function renderVideo(content, container) {
    const video = document.createElement('video');
    video.src = content;
    video.controls = true;
    video.style.maxWidth = '100%';
    video.style.maxHeight = '100%';
    container.appendChild(video);
}

function renderXLSX(content, container) {
    const data = new Uint8Array(content);
    const workbook = XLSX.read(data, {type: 'array'});

    workbook.SheetNames.forEach(function(sheetName) {
        const htmlString = XLSX.utils.sheet_to_html(workbook.Sheets[sheetName]);
        container.innerHTML += htmlString;
    });
}

function renderCSV(content, container) {
    const text = new TextDecoder().decode(content);
    Papa.parse(text, {
        complete: function(results) {
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');

            results.data.forEach((row, index) => {
                const tr = document.createElement('tr');
                row.forEach(cell => {
                    const td = document.createElement(index ? 'td' : 'th');
                    td.textContent = cell;
                    tr.appendChild(td);
                });
                if (index) {
                    tbody.appendChild(tr);
                } else {
                    thead.appendChild(tr);
                }
            });

            table.appendChild(thead);
            table.appendChild(tbody);
            container.appendChild(table);
        }
    });
}

function renderPPTX(file, container) {
    const fileURL = URL.createObjectURL(file);
    const iframe = document.createElement('iframe');
    iframe.src = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fileURL)}`;
    iframe.width = '100%';
    iframe.height = '600px';
    container.appendChild(iframe);
}

function convertToPDF(container) {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4'
    });

    html2canvas(container, {
        scale: 3
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        
        const margin = 20;
        const leftMargin = margin;
        const topMargin = margin;
        const imgWidth = pdfWidth - leftMargin * 2;
        const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', leftMargin, topMargin, imgWidth, imgHeight);
        pdf.save('arquivo.pdf');
    });
}

document.getElementById('fileInput').addEventListener('change', handleFile, false);
document.getElementById('downloadPdfBtn').addEventListener('click', downloadAsPDF, false);
document.getElementById('downloadJpegBtn').addEventListener('click', downloadAsJPEG, false);
document.getElementById('downloadPngBtn').addEventListener('click', downloadAsPNG, false);

let zoomLevel = 1;

function handleFile(event) {
    const file = event.target.files[0];
    const fileContent = document.getElementById('fileContent');
    const reader = new FileReader();
    const downloadButtons = document.getElementById('downloadButtons');

    fileContent.innerHTML = '';
    downloadButtons.style.display = 'none';

    const fileType = file.type;

    if (fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || fileType === 'application/vnd.ms-excel') {
        reader.onload = function(e) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            
            const sheetTabs = document.getElementById('sheetTabs');
            sheetTabs.innerHTML = '';
            workbook.SheetNames.forEach((sheetName, index) => {
                const tab = document.createElement('div');
                tab.className = 'tab';
                tab.innerText = sheetName;
                tab.addEventListener('click', () => displaySheet(workbook, sheetName));
                if (index === 0) tab.classList.add('active');
                sheetTabs.appendChild(tab);
            });

            displaySheet(workbook, workbook.SheetNames[0]);
        };
        reader.readAsArrayBuffer(file);
    } else if (fileType === 'application/pdf') {
        reader.onload = function(e) {
            displayPDF(e.target.result);
            downloadButtons.style.display = 'block';
        };
        reader.readAsArrayBuffer(file);
    } else if (fileType.startsWith('image/')) {
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.src = e.target.result;
            img.id = 'zoomableImage';
            fileContent.appendChild(img);
            downloadButtons.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else if (fileType === 'text/html' || fileType === 'text/plain' || fileType === 'application/javascript') {
        reader.onload = function(e) {
            const pre = document.createElement('pre');
            pre.textContent = e.target.result;
            fileContent.appendChild(pre);
            downloadButtons.style.display = 'block';
        };
        reader.readAsText(file);
    } else if (file.name.endsWith('.gsheet')) {
        reader.onload = function(e) {
            const data = JSON.parse(e.target.result);
            fetch(data.url)
                .then(response => response.json())
                .then(gsheetData => {
                    const json = XLSX.utils.sheet_to_json(gsheetData, { header: 1, raw: false });
                    displayExcelData(json);
                    downloadButtons.style.display = 'block';
                });
        };
        reader.readAsText(file);
    } else if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        reader.onload = function(e) {
            const zip = new PizZip(e.target.result);
            const doc = new window.docxtemplater().loadZip(zip);
            const text = doc.getFullText();
            const pre = document.createElement('pre');
            pre.textContent = text;
            fileContent.appendChild(pre);
            downloadButtons.style.display = 'block';
        };
        reader.readAsArrayBuffer(file);
    } else if (fileType === 'text/csv') {
        reader.onload = function(e) {
            const csv = Papa.parse(e.target.result, { header: true });
            displayCSVData(csv.data);
            downloadButtons.style.display = 'block';
        };
        reader.readAsText(file);
    } else {
        alert('Tipo de arquivo não suportado!');
    }
}

function displaySheet(workbook, sheetName) {
    const sheet = workbook.Sheets[sheetName];
    const html = XLSX.utils.sheet_to_html(sheet);
    const fileContent = document.getElementById('fileContent');
    fileContent.innerHTML = html;

    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    const activeTab = Array.from(document.querySelectorAll('.tab')).find(tab => tab.innerText === sheetName);
    activeTab.classList.add('active');
}

function displayPDF(data) {
    const fileContent = document.getElementById('fileContent');
    fileContent.innerHTML = '';

    const loadingTask = pdfjsLib.getDocument({data: data});
    loadingTask.promise.then(function(pdf) {
        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            pdf.getPage(pageNum).then(function(page) {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const viewport = page.getViewport({scale: 1.5});

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                canvas.style.width = '100%';
                canvas.style.height = 'auto';

                page.render({canvasContext: ctx, viewport: viewport}).promise.then(() => {
                    fileContent.appendChild(canvas);
                });
            });
        }
    });
}

function displayExcelData(data) {
    const fileContent = document.getElementById('fileContent');
    const table = document.createElement('table');
    data.forEach(row => {
        const tr = document.createElement('tr');
        row.forEach(cell => {
            const td = document.createElement('td');
            td.textContent = cell;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
    fileContent.innerHTML = '';
    fileContent.appendChild(table);
}

function displayCSVData(data) {
    const fileContent = document.getElementById('fileContent');
    const table = document.createElement('table');
    if (data.length > 0) {
        const thead = document.createElement('thead');
        const tr = document.createElement('tr');
        Object.keys(data[0]).forEach(key => {
            const th = document.createElement('th');
            th.textContent = key;
            tr.appendChild(th);
        });
        thead.appendChild(tr);
        table.appendChild(thead);
    }
    const tbody = document.createElement('tbody');
    data.forEach(row => {
        const tr = document.createElement('tr');
        Object.values(row).forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            tr.appendChild(td);
        });
        tbody.appendChild(tr);
    });
    table.appendChild(tbody);
    fileContent.innerHTML = '';
    fileContent.appendChild(table);
}

function downloadAsPDF() {
    const fileContent = document.getElementById('fileContent');
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
    });

    html2canvas(fileContent, {
        scale: 3, // Aumenta a escala para melhorar a qualidade
        useCORS: true
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 190; // Ajuste para considerar as margens
        const pageHeight = 277; // Altura da página A4 menos as margens
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 10; // Margem superior

        doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight); // Margens laterais de 10mm
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight + 10; // Margem superior para páginas seguintes
            doc.addPage();
            doc.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        doc.save('download.pdf');
    });
}


function downloadAsJPEG() {
    const fileContent = document.getElementById('fileContent');

    html2canvas(fileContent, {
        scale: 3, // Aumenta a escala para melhorar a qualidade
        useCORS: true
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 1.0); // Qualidade máxima
        const a = document.createElement('a');
        a.href = imgData;
        a.download = 'download.jpeg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

function downloadAsPNG() {
    const fileContent = document.getElementById('fileContent');

    html2canvas(fileContent, {
        scale: 3, // Aumenta a escala para melhorar a qualidade
        useCORS: true
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = imgData;
        a.download = 'download.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}


function scrollToTop() {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
}

window.addEventListener('scroll', function() {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (document.documentElement.scrollTop > 200 || document.body.scrollTop > 200) {
        backToTopBtn.style.display = 'block';
    } else {
        backToTopBtn.style.display = 'none';
    }
});

document.getElementById('zoomInBtn').addEventListener('click', () => {
    zoomLevel += 0.1;
    applyZoom();
});

document.getElementById('zoomOutBtn').addEventListener('click', () => {
    if (zoomLevel > 0.1) {
        zoomLevel -= 0.1;
        applyZoom();
    }
});

function applyZoom() {
    const zoomableImage = document.getElementById('zoomableImage');
    if (zoomableImage) {
        zoomableImage.style.transform = `scale(${zoomLevel})`;
    }
}

document.getElementById('menu-toggle').addEventListener('click', function() {
    const menu = document.querySelector('.menu');
    menu.style.display = menu.style.display === 'flex' ? 'none' : 'flex';
});


import * as XLSX from 'xlsx';

// Web Worker için yeni dosya
const worker = new Worker('calc-worker.js');

class BatchProcessor {
    constructor() {
        this.setupWorker();
        this.setupUI();
    }

    setupWorker() {
        worker.onmessage = (e) => {
            const { type, data } = e.data;
            switch(type) {
                case 'progress':
                    this.updateProgress(data.percent);
                    break;
                case 'complete':
                    this.processComplete(data.results, data.errors);
                    break;
                case 'error':
                    this.showError(data.message);
                    break;
            }
        };
    }

    updateProgress(percent) {
        const progressBar = document.querySelector('.progress-bar');
        const progressFill = progressBar.querySelector('.fill');
        const progressText = document.querySelector('.progress-text');
        
        progressBar.style.display = 'block';
        progressFill.style.width = `${percent}%`;
        progressText.textContent = `İşleniyor... ${percent}%`;
    }

    processComplete(results, errors) {
        // Özet görünümü
        const summary = document.getElementById('summary');
        summary.style.display = 'block';
        summary.innerHTML = `
            <h3>İşlem Özeti</h3>
            <p>Toplam İşlenen: ${results.length}</p>
            <p>Başarılı: ${results.length - errors.length}</p>
            <p>Hatalı: ${errors.length}</p>
        `;

        // Hata listesi
        if (errors.length > 0) {
            const errorList = document.getElementById('errorList');
            errorList.style.display = 'block';
            errorList.innerHTML = `
                <h4>Hatalı Satırlar</h4>
                ${errors.map(err => `
                    <div class="error-item">
                        Satır ${err.row}: ${err.message}
                    </div>
                `).join('')}
            `;
        }

        // Excel dosyasını oluştur
        this.createExcelFile(results);
    }

    createExcelFile(results) {
        const ws = XLSX.utils.json_to_sheet(results);
        
        // Stil tanımlamaları
        ws['!cols'] = [
            {wch: 20}, // Ürün Adı
            {wch: 12}, // Satış Fiyatı
            {wch: 12}, // Maliyet
            // ...diğer sütunlar
        ];

        // Başlık stilleri
        const headerStyle = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "4CAF50" } },
            alignment: { horizontal: "center" }
        };

        // Hücre stillerini uygula
        Object.keys(ws).forEach(cell => {
            if (cell[0] === '!') return; // Özel propertyler
            
            if (cell.endsWith('1')) { // Başlıklar
                ws[cell].s = headerStyle;
            }
        });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sonuçlar');
        
        // Şablon sayfası ekle
        const templateWs = this.createTemplateSheet();
        XLSX.utils.book_append_sheet(wb, templateWs, 'Şablon ve Açıklamalar');

        XLSX.writeFile(wb, 'hesaplama-sonuclari.xlsx');
    }

    createTemplateSheet() {
        const template = [{
            'Ürün Adı': 'Örnek Ürün',
            'Satış Fiyatı': '100',
            'Ürün Maliyeti': '50',
            'Fatura': 'Var',
            'Kargo Maliyeti': '10',
            'Hizmet Maliyeti': '5',
            'Komisyon Oranı': '10'
        }];

        const ws = XLSX.utils.json_to_sheet(template);
        
        // Açıklamalar ekle
        XLSX.utils.sheet_add_aoa(ws, [
            ['Açıklamalar:'],
            ['- Ürün Adı: Benzersiz ürün tanımlayıcı'],
            ['- Satış Fiyatı: TL cinsinden satış bedeli'],
            ['- Fatura: "Var" veya "Yok" yazın'],
            ['- Komisyon Oranı: % değeri (örn: 10)']
        ], {origin: 'A10'});

        return ws;
    }

    setupUI() {
        const dropZone = document.getElementById('dropZone');
        const fileInput = document.getElementById('fileInput');

        dropZone.onclick = () => fileInput.click();
        dropZone.ondragover = (e) => {
            e.preventDefault();
            dropZone.style.background = '#e8f5e9';
        };
        dropZone.ondragleave = () => {
            dropZone.style.background = '#f8f9fa';
        };
        dropZone.ondrop = (e) => {
            e.preventDefault();
            this.handleFile(e.dataTransfer.files[0]);
        };
        fileInput.onchange = (e) => {
            this.handleFile(e.target.files[0]);
        };
    }

    async handleFile(file) {
        try {
            const data = await this.readExcel(file);
            worker.postMessage({ type: 'process', data });
        } catch (error) {
            alert('Hata: ' + error.message);
        }
    }

    readExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const workbook = XLSX.read(e.target.result, {type: 'array'});
                    const sheet = workbook.Sheets[workbook.SheetNames[0]];
                    const data = XLSX.utils.sheet_to_json(sheet);
                    resolve(data);
                } catch (error) {
                    reject(new Error('Excel dosyası okunamadı'));
                }
            };
            reader.onerror = () => reject(new Error('Dosya okunamadı'));
            reader.readAsArrayBuffer(file);
        });
    }

    showError(message) {
        alert('Hata: ' + message);
    }
}

// Sayfa yüklendiğinde işlemciyi başlat
window.onload = () => {
    const processor = new BatchProcessor();
    window.downloadTemplate = () => processor.downloadTemplate();
};

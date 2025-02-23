self.onmessage = function(e) {
    const { data, chunkSize = 100 } = e.data;
    const errors = [];
    const results = [];
    
    // Chunk'lar halinde işle
    for (let i = 0; i < data.length; i += chunkSize) {
        const chunk = data.slice(i, i + chunkSize);
        
        chunk.forEach((row, index) => {
            try {
                const result = calculateRow(row);
                results.push(result);
            } catch (error) {
                errors.push({
                    row: i + index + 1,
                    message: error.message
                });
            }
        });
        
        // İlerleme durumunu bildir
        const progress = Math.min(((i + chunkSize) / data.length) * 100, 100);
        self.postMessage({
            type: 'progress',
            data: { percent: Math.round(progress) }
        });
    }
    
    // İşlem tamamlandı
    self.postMessage({
        type: 'complete',
        data: { results, errors }
    });
};

function calculateRow(row) {
    // Veri doğrulama
    validateRow(row);
    
    // Hesaplama işlemleri
    // ...existing calculation logic...
    
    return result;
}

function validateRow(row) {
    if (!row['Ürün Adı'])
        throw new Error('Ürün adı boş olamaz');
    
    if (isNaN(parseFloat(row['Satış Fiyatı'])))
        throw new Error('Geçersiz satış fiyatı');
    
    // ...other validations...
}

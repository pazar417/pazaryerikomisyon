let calculationHistory = [];
let selectedRowIndex = -1;

// Varsayılan hizmet ücretleri için global değişken
let serviceRatesByMarketplace = {
    'Trendyol': 8.4,
    'Hepsiburada': 14.4,
    'N11': 4.1
};

function calculateProfit() {
    const marketplace = document.getElementById('marketplaceSelect').value;
    // Form değerlerini al - Türkçe format
    var productName = document.getElementById('productName').value;
    var sellingPrice = parseLocalFloat(document.getElementById('sellingPrice').value);
    var productCost = parseLocalFloat(document.getElementById('productCost').value);
    var hasInvoice = document.getElementById('hasInvoice').checked;
    var shippingCost = parseLocalFloat(document.getElementById('shippingCost').value);
    var serviceCost = parseLocalFloat(document.getElementById('serviceCost').value);
    var commissionRate = parseLocalFloat(document.getElementById('commissionRate').value);

    // Girdi doğrulaması
    if (!productName || isNaN(sellingPrice) || isNaN(productCost) || isNaN(shippingCost) || isNaN(serviceCost) || isNaN(commissionRate)) {
        alert("Lütfen tüm alanları doğru şekilde doldurun.");
        return;
    }

    // Komisyon hesapla
    var commissionAmount = (commissionRate / 100) * sellingPrice;

    // Toplam maliyet hesapla (ürün maliyeti her zaman dahil)
    var totalCost = productCost + shippingCost + serviceCost + commissionAmount;

    // Faturalı maliyet hesapla
    var invoicedCost = (hasInvoice ? productCost : 0) + shippingCost + serviceCost + commissionAmount;

    // Vergi hesaplamaları
    var netProfitBeforeTax = sellingPrice - totalCost;
    var taxableProfit = sellingPrice - (hasInvoice ? totalCost : (shippingCost + serviceCost + commissionAmount));
    var taxAmount = taxableProfit * 0.20;
    var stopajAmount = (netProfitBeforeTax - taxAmount) * 0.01;
    var netProfitAfterTax = netProfitBeforeTax - taxAmount - stopajAmount;
    var profitMargin = (netProfitBeforeTax / sellingPrice) * 100;

    // Sonuçları göster - Türkçe format
    document.getElementById('netProfitBeforeTax').textContent = formatCurrency(netProfitBeforeTax);
    document.getElementById('profitMargin').textContent = formatCurrency(profitMargin);
    document.getElementById('commissionAmount').textContent = formatCurrency(commissionAmount);
    document.getElementById('totalCost').textContent = formatCurrency(totalCost);
    document.getElementById('invoicedCost').textContent = formatCurrency(invoicedCost);
    document.getElementById('taxAmount').textContent = formatCurrency(taxAmount);
    document.getElementById('stopajAmount').textContent = formatCurrency(stopajAmount);
    document.getElementById('netProfitAfterTax2').textContent = formatCurrency(netProfitAfterTax);

    // Yeni hesaplama objesi
    const calculation = {
        marketplace: marketplace,
        productName: productName,
        sellingPrice: formatCurrency(sellingPrice),
        productCost: formatCurrency(productCost),
        hasInvoice: hasInvoice ? 'Var' : 'Yok',
        shippingCost: formatCurrency(shippingCost),
        serviceCost: formatCurrency(serviceCost),
        commissionRate: formatCurrency(commissionRate),
        commissionAmount: formatCurrency(commissionAmount),
        netProfitBeforeTax: formatCurrency(netProfitBeforeTax),
        netProfitAfterTax: formatCurrency(netProfitAfterTax),
        profitMargin: formatCurrency(profitMargin)
    };

    // Sadece son girdiyi kontrol et
    const lastEntry = calculationHistory[0];
    const isDuplicate = lastEntry && 
        lastEntry.productName === calculation.productName &&
        lastEntry.sellingPrice === calculation.sellingPrice &&
        lastEntry.productCost === calculation.productCost &&
        lastEntry.hasInvoice === calculation.hasInvoice &&
        lastEntry.shippingCost === calculation.shippingCost &&
        lastEntry.serviceCost === calculation.serviceCost &&
        lastEntry.commissionRate === calculation.commissionRate;

    // Eğer son girdi ile aynı değilse geçmişe ekle
    if (!isDuplicate) {
        calculationHistory.unshift(calculation);
        updateHistory();
        saveToLocalStorage();
    }

    // Kargo Durumu hesaplamaları
    const oneItemTotal = sellingPrice;
    const twoItemsTotal = sellingPrice * 2;
    const threeItemsTotal = sellingPrice * 3;
    
    const shippingForOneItem = calculateShippingCost(oneItemTotal);
    const shippingForTwoItems = calculateShippingCost(twoItemsTotal);
    const shippingForThreeItems = calculateShippingCost(threeItemsTotal);
    
    // Kargo tasarruf hesaplamaları
    const shippingProfitTwo = (shippingForOneItem * 2) - shippingForTwoItems;
    const shippingProfitThree = (shippingForOneItem * 3) - shippingForThreeItems;

    // Sonuçları göster
    document.getElementById('totalOneItem').textContent = formatCurrency(oneItemTotal);
    document.getElementById('shippingForOne').textContent = formatCurrency(shippingForOneItem);
    document.getElementById('totalTwoItems').textContent = formatCurrency(twoItemsTotal);
    document.getElementById('shippingForTwo').textContent = formatCurrency(shippingForTwoItems);
    document.getElementById('totalThreeItems').textContent = formatCurrency(threeItemsTotal);
    document.getElementById('shippingForThree').textContent = formatCurrency(shippingForThreeItems);
    document.getElementById('shippingProfitTwo').textContent = formatCurrency(shippingProfitTwo);
    document.getElementById('shippingProfitThree').textContent = formatCurrency(shippingProfitThree);
}

function updateHistory() {
    const historyTable = document.getElementById('historyTable');
    historyTable.innerHTML = '';
    
    calculationHistory.forEach((item, index) => {
        // Sayıları Türkçe formatına çevir
        const formatTurkish = (num) => num.replace('.', ',');
        
        const row = document.createElement('tr');
        row.dataset.index = index;
        row.className = index === selectedRowIndex ? 'selected-row' : '';
        row.innerHTML = `
            <td>${item.productName}</td>
            <td>${formatTurkish(item.sellingPrice)} ₺</td>
            <td>${formatTurkish(item.productCost)} ₺</td>
            <td>${item.hasInvoice}</td>
            <td>${formatTurkish(item.shippingCost)} ₺</td>
            <td>${formatTurkish(item.serviceCost)} ₺</td>
            <td>${formatTurkish(item.commissionRate)}%</td>
            <td>${formatTurkish(item.commissionAmount)} ₺</td>
            <td>${formatTurkish(item.netProfitBeforeTax)} ₺</td>
            <td>${formatTurkish(item.netProfitAfterTax)} ₺</td>
            <td>${formatTurkish(item.profitMargin)}%</td>
        `;
        row.addEventListener('click', () => selectHistoryRow(index));
        historyTable.appendChild(row);
    });
}

function selectHistoryRow(index) {
    selectedRowIndex = index;
    const selectedCalculation = calculationHistory[index];
    
    // Sayıları Türkçe formatına çevir (noktayı virgüle dönüştür)
    const formatTurkish = (num) => num.replace('.', ',');
    
    document.getElementById('productName').value = selectedCalculation.productName;
    document.getElementById('sellingPrice').value = formatTurkish(selectedCalculation.sellingPrice);
    document.getElementById('productCost').value = formatTurkish(selectedCalculation.productCost);
    document.getElementById('hasInvoice').checked = selectedCalculation.hasInvoice === 'Var';
    document.getElementById('shippingCost').value = formatTurkish(selectedCalculation.shippingCost);
    document.getElementById('serviceCost').value = formatTurkish(selectedCalculation.serviceCost);
    document.getElementById('commissionRate').value = formatTurkish(selectedCalculation.commissionRate);
    
    updateHistory();
}

// LocalStorage yönetimi için fonksiyonlar
function saveToLocalStorage() {
    localStorage.setItem('calculationHistory', JSON.stringify(calculationHistory));
}

function loadFromLocalStorage() {
    const saved = localStorage.getItem('calculationHistory');
    if (saved) {
        calculationHistory = JSON.parse(saved);
        updateHistory();
    }
}

// Input validasyon fonksiyonu - Türkçe format için güncellendi
function validateNumericInput(event) {
    const value = event.target.value;
    // Sadece rakam, virgül ve nokta karakterlerine izin ver
    if (!/^[\d.,]*$/.test(value)) {
        event.target.value = value.replace(/[^\d.,]/g, '');
    }
    
    // Birden fazla virgül veya nokta kullanımını engelle
    const parts = value.split(/[.,]/);
    if (parts.length > 2) {
        event.target.value = parts[0] + ',' + parts[1];
    }
    
    // Virgül veya noktadan sonra en fazla 2 basamağa izin ver
    if (parts[1] && parts[1].length > 2) {
        event.target.value = parts[0] + ',' + parts[1].slice(0, 2);
    }
}

// Para formatı fonksiyonu - Türkçe format
function formatCurrency(number) {
    return number.toFixed(2).replace('.', ',');
}

// Sayısal değer dönüştürme yardımcı fonksiyonu
function parseLocalFloat(str) {
    if (!str) return 0;
    // Binlik ayracı olan noktaları kaldır ve virgülü noktaya çevir
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || 0;
}

// Döviz kuru değişkeni
let currentExchangeRate = 0;

// Döviz kurunu al
async function fetchExchangeRate() {
    try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        currentExchangeRate = data.rates.TRY;
        document.getElementById('currentRate').textContent = currentExchangeRate.toFixed(2);
    } catch (error) {
        console.error('Döviz kuru alınamadı:', error);
        alert('Döviz kuru bilgisi alınamadı. Lütfen internet bağlantınızı kontrol edin.');
    }
}

// Döviz çevirme fonksiyonu
function convertCurrency() {
    const usdAmount = parseLocalFloat(document.getElementById('usdAmount').value);
    if (isNaN(usdAmount)) {
        alert('Lütfen geçerli bir tutar girin');
        return;
    }

    const tryAmount = usdAmount * currentExchangeRate;
    document.getElementById('productCost').value = formatCurrency(tryAmount);
}

// Kargo fiyatları için global değişken - güncellendi
let shippingRatesByMarketplace = {
    'Trendyol': [
        { min: 0, max: 149.99, cost: 44 },
        { min: 150, max: 249.99, cost: 75 },
        { min: 250, max: Infinity, cost: 85 }
    ],
    'Hepsiburada': [
        { min: 0, max: 149.99, cost: 42 },
        { min: 150, max: 299.99, cost: 60 },
        { min: 300, max: Infinity, cost: 74.40 }
    ],
    'N11': [
        { min: 0, max: 149.99, cost: 43 },
        { min: 150, max: 299.99, cost: 75 },
        { min: 300, max: Infinity, cost: 87.4 }
    ]
};

// Kargo maliyeti hesaplama fonksiyonu - güncellendi
function calculateShippingCost(sellingPrice) {
    const currentMarketplace = document.getElementById('marketplaceSelect').value;
    const rates = shippingRatesByMarketplace[currentMarketplace] || shippingRatesByMarketplace['Trendyol'];
    
    // Hiç kargo fiyat aralığı yoksa
    if (!rates || rates.length === 0) {
        console.warn(`${currentMarketplace} için kargo fiyat aralığı tanımlanmamış`);
        return 0; // veya varsayılan bir değer
    }

    for (const rate of rates) {
        if (sellingPrice >= rate.min && sellingPrice <= rate.max) {
            return rate.cost;
        }
    }
    return rates[rates.length - 1].cost;
}

// Geçici kargo oranlarını tutacak değişken ekle
let tempShippingRates = null;

function toggleShippingEdit() {
    const table = document.getElementById('shippingRatesTable');
    const editColumn = table.querySelectorAll('.edit-column');
    const controls = document.querySelector('.shipping-controls');
    const editButton = document.querySelector('.edit-button');
    const marketplaceSelect = document.getElementById('marketplaceSelect');
    
    const isEditing = controls.style.display === 'none';
    
    if (isEditing) {
        // Düzenleme başlıyor
        const currentMarketplace = marketplaceSelect.value;
        tempShippingRates = JSON.parse(JSON.stringify(shippingRatesByMarketplace[currentMarketplace] || []));
        
        // Pazaryeri seçimini kilitle
        marketplaceSelect.disabled = true;
        marketplaceSelect.style.opacity = '0.6';
        marketplaceSelect.title = 'Düzenleme modunda pazaryeri değiştirilemez';
    } else {
        // İptal ediliyor
        const currentMarketplace = marketplaceSelect.value;
        if (tempShippingRates !== null) {
            shippingRatesByMarketplace[currentMarketplace] = JSON.parse(JSON.stringify(tempShippingRates));
            tempShippingRates = null;
        }
        
        // Pazaryeri seçimini serbest bırak
        marketplaceSelect.disabled = false;
        marketplaceSelect.style.opacity = '1';
        marketplaceSelect.title = '';
    }
    
    controls.style.display = isEditing ? 'flex' : 'none';
    editButton.querySelector('.edit-text').textContent = isEditing ? 'İptal' : 'Düzenle';
    editColumn.forEach(col => col.style.display = isEditing ? '' : 'none');
    
    renderShippingRates(isEditing);
}

function saveShippingRates() {
    const inputs = document.querySelectorAll('#shippingRatesTable input');
    const newRates = [];
    const currentMarketplace = document.getElementById('marketplaceSelect').value;
    
    for (let i = 0; i < inputs.length; i += 3) {
        const min = parseFloat(inputs[i].value);
        const maxInput = inputs[i+1].value.trim();
        const max = maxInput === '' || maxInput === '∞' ? Infinity : parseFloat(maxInput);
        const cost = parseFloat(inputs[i+2].value);
        
        if (isNaN(min) || (maxInput !== '' && maxInput !== '∞' && isNaN(max)) || isNaN(cost)) {
            alert('Lütfen geçerli sayısal değerler girin.\nBitiş fiyatını boş bırakarak veya ∞ yazarak sonsuz yapabilirsiniz.');
            return;
        }

        // Negatif değerleri kontrol et
        if (min < 0 || (max !== Infinity && max < 0) || cost < 0) {
            alert('Negatif değerler kullanılamaz!');
            return;
        }
        
        newRates.push({ min, max, cost });
    }

    // Fiyat aralıklarının mantıklı olup olmadığını kontrol et
    for (let i = 0; i < newRates.length - 1; i++) {
        if (newRates[i].max !== Infinity && newRates[i].max >= newRates[i + 1].min) {
            alert('Fiyat aralıkları çakışmamalı ve sıralı olmalıdır!\nBir aralığın bitiş fiyatı, sonraki aralığın başlangıç fiyatından küçük olmalıdır.');
            return;
        }
        // Aralık boşluğu kontrolü
        if (newRates[i].max !== Infinity && newRates[i].max + 0.01 < newRates[i + 1].min) {
            alert(`${newRates[i].max} TL ile ${newRates[i + 1].min} TL arasında boşluk var!\nAralıklar birbirini takip etmelidir.`);
            return;
        }
    }
    
    shippingRatesByMarketplace[currentMarketplace] = newRates;
    tempShippingRates = null;
    saveShippingRatesToLocalStorage();
    
    // Pazaryeri seçimini serbest bırak
    const marketplaceSelect = document.getElementById('marketplaceSelect');
    marketplaceSelect.disabled = false;
    marketplaceSelect.style.opacity = '1';
    marketplaceSelect.title = '';
    
    toggleShippingEdit();
    renderShippingRates(false);
}

function addNewRate() {
    const currentMarketplace = document.getElementById('marketplaceSelect').value;
    
    // Mevcut input değerlerini geçici olarak sakla
    const inputs = document.querySelectorAll('#shippingRatesTable input');
    const currentRates = [];
    
    for (let i = 0; i < inputs.length; i += 3) {
        currentRates.push({
            min: parseFloat(inputs[i].value),
            max: inputs[i+1].value.trim() === '' || inputs[i+1].value === '∞' ? 
                 Infinity : parseFloat(inputs[i+1].value),
            cost: parseFloat(inputs[i+2].value)
        });
    }

    // Geçici değerleri güncelle
    if (!shippingRatesByMarketplace[currentMarketplace]) {
        shippingRatesByMarketplace[currentMarketplace] = [];
    }
    shippingRatesByMarketplace[currentMarketplace] = currentRates;

    // Yeni oran için başlangıç değerini belirle
    let startingMin = 0;
    if (currentRates.length > 0) {
        const lastRate = currentRates[currentRates.length - 1];
        if (lastRate.max === Infinity) {
            startingMin = lastRate.min + 100;
        } else {
            startingMin = lastRate.max + 0.01;
        }
    }

    // Yeni oranı ekle
    shippingRatesByMarketplace[currentMarketplace].push({
        min: startingMin,
        max: Infinity,
        cost: 0
    });

    // Tabloyu güncelle
    renderShippingRates(true);
}

function renderShippingRates(isEditing) {
    const tbody = document.querySelector('#shippingRatesTable tbody');
    tbody.innerHTML = '';
    
    const currentMarketplace = document.getElementById('marketplaceSelect').value;
    const rates = shippingRatesByMarketplace[currentMarketplace] || [];
    
    rates.forEach((rate, index) => {
        const row = document.createElement('tr');
        if (isEditing) {
            // Input değerlerini koruyarak render et
            const maxValue = rate.max === Infinity ? '' : rate.max;
            row.innerHTML = `
                <td><input type="text" value="${rate.min}" data-index="${index}" data-type="min" placeholder="0"></td>
                <td><input type="text" value="${maxValue}" data-index="${index}" data-type="max" placeholder="Boş bırakın veya ∞"></td>
                <td><input type="text" value="${rate.cost}" data-index="${index}" data-type="cost" placeholder="0"></td>
                <td class="edit-column">
                    <button onclick="deleteRate(${index})" style="color: red; background: none; border: none; cursor: pointer;">❌</button>
                </td>
            `;
        } else {
            row.innerHTML = `
                <td>${rate.min}</td>
                <td>${rate.max === Infinity ? '∞' : rate.max}</td>
                <td>${rate.cost}</td>
                <td class="edit-column" style="display: none;">
                    <button onclick="deleteRate(${index})" style="display: none;">❌</button>
                </td>
            `;
        }
        tbody.appendChild(row);
    });

    // Edit column visibility
    const editColumns = document.querySelectorAll('.edit-column');
    editColumns.forEach(col => {
        col.style.display = isEditing ? '' : 'none';
    });

    // Controls visibility
    const controls = document.querySelector('.shipping-controls');
    if (controls) {
        controls.style.display = isEditing ? 'flex' : 'none';
    }
}

function deleteRate(index) {
    if (confirm('Bu kargo fiyat aralığını silmek istediğinize emin misiniz?')) {
        const currentMarketplace = document.getElementById('marketplaceSelect').value;
        if (shippingRatesByMarketplace[currentMarketplace]) {
            shippingRatesByMarketplace[currentMarketplace].splice(index, 1);
            renderShippingRates(true);
            saveShippingRatesToLocalStorage(); // Değişiklikleri kaydet
        }
    }
}

// LocalStorage işlemleri - yeni
function saveShippingRatesToLocalStorage() {
    const dataToSave = {};
    
    for (const [marketplace, rates] of Object.entries(shippingRatesByMarketplace)) {
        dataToSave[marketplace] = rates.map(rate => ({
            ...rate,
            max: rate.max === Infinity ? 'Infinity' : rate.max
        }));
    }
    
    localStorage.setItem('shippingRatesByMarketplace', JSON.stringify(dataToSave));
}

function loadShippingRatesFromLocalStorage() {
    const saved = localStorage.getItem('shippingRatesByMarketplace');
    if (saved) {
        const parsed = JSON.parse(saved);
        for (const [marketplace, rates] of Object.entries(parsed)) {
            shippingRatesByMarketplace[marketplace] = rates.map(rate => ({
                ...rate,
                max: rate.max === 'Infinity' ? Infinity : parseFloat(rate.max)
            }));
        }
    }
}

// Pazaryeri yönetimi için değişkenler - Varsayılan pazaryerleri tanımı
let marketplaces = ['Trendyol', 'Hepsiburada', 'N11'];

// LocalStorage'dan pazaryerlerini yükle
function loadMarketplaces() {
    const saved = localStorage.getItem('marketplaces');
    if (saved) {
        marketplaces = JSON.parse(saved);
    } else {
        // İlk kez yükleniyorsa varsayılan pazaryerlerini kaydet
        localStorage.setItem('marketplaces', JSON.stringify(marketplaces));
    }
    updateMarketplaceSelect();
}

// Pazaryeri seçeneklerini güncelle - Trendyol'u varsayılan seçili yap
function updateMarketplaceSelect() {
    const select = document.getElementById('marketplaceSelect');
    select.innerHTML = marketplaces.map(market => 
        `<option value="${market}" ${market === 'Trendyol' ? 'selected' : ''}>${market}</option>`
    ).join('');
}

// Modal göster
function showAddMarketplaceModal() {
    const modal = document.getElementById('addMarketplaceModal');
    modal.style.display = 'block';
    
    // Pazaryeri listesini güncelle
    updateMarketplaceList();
    
    // Modal kapatma için click event
    modal.querySelector('.close-modal').onclick = () => {
        modal.style.display = 'none';
    };
    
    // Modal dışına tıklandığında kapat
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    };
}

// Yeni pazaryeri ekle
const originalAddNewMarketplace = window.addNewMarketplace;
window.addNewMarketplace = function() {
    const input = document.getElementById('newMarketplaceName');
    const newMarketplace = input.value.trim();
    
    if (!newMarketplace) {
        alert('Lütfen bir pazaryeri adı girin!');
        return;
    }

    if (marketplaces.includes(newMarketplace)) {
        alert('Bu pazaryeri zaten mevcut!');
        return;
    }

    // Pazaryerini ekle
    marketplaces.push(newMarketplace);
    localStorage.setItem('marketplaces', JSON.stringify(marketplaces));

    // Hizmet ücreti ve kargo fiyatları için varsayılan değerleri ayarla
    serviceRatesByMarketplace[newMarketplace] = 0;
    shippingRatesByMarketplace[newMarketplace] = [
        { min: 0, max: Infinity, cost: 0 }
    ];

    // LocalStorage'a kaydet
    saveServiceRatesToLocalStorage();
    saveShippingRatesToLocalStorage();

    // UI'ı güncelle
    updateMarketplaceSelect();
    updateMarketplaceList();
    renderServiceRates(false);
    renderShippingRates(false);

    // Modal'ı kapat ve input'u temizle
    input.value = '';
    document.getElementById('addMarketplaceModal').style.display = 'none';
};

// Varsayılan pazaryerlerini tanımla
const defaultMarketplaces = ['Trendyol', 'Hepsiburada', 'N11'];

// Pazaryeri listesini güncelle
function updateMarketplaceList() {
    const list = document.getElementById('marketplaceList');
    list.innerHTML = '';
    
    marketplaces.forEach(marketplace => {
        const item = document.createElement('div');
        item.className = `marketplace-item ${defaultMarketplaces.includes(marketplace) ? 'default' : ''}`;
        
        const isDefault = defaultMarketplaces.includes(marketplace);
        
        item.innerHTML = `
            <span>${marketplace}</span>
            <div class="marketplace-actions">
                ${!isDefault ? `
                    <button class="edit-marketplace-btn" onclick="editMarketplace('${marketplace}')">
                        ✏️
                    </button>
                    <button class="delete-marketplace-btn" onclick="deleteMarketplace('${marketplace}')">
                        🗑️
                    </button>
                ` : '<span style="color: #666">(Varsayılan)</span>'}
            </div>
        `;
        
        list.appendChild(item);
    });
}

// Pazaryeri düzenleme işlevi - güncellendi
function editMarketplace(name) {
    const items = document.querySelectorAll('.marketplace-item');
    let item = null;
    
    // İlgili pazaryeri öğesini bul
    items.forEach(element => {
        if (element.querySelector('span').textContent === name) {
            item = element;
        }
    });

    if (!item) return;
    
    const currentName = name;
    
    item.className = 'marketplace-item editing';
    item.innerHTML = `
        <input type="text" value="${name}" class="edit-input">
        <div class="marketplace-actions">
            <button class="edit-marketplace-btn" onclick="saveEdit('${currentName}', this.parentElement.parentElement)">
                💾
            </button>
            <button class="delete-marketplace-btn" onclick="cancelEdit()">
                ❌
            </button>
        </div>
    `;
}

// Düzenleme kaydetme fonksiyonu - güncellendi
function saveEdit(oldName, itemElement) {
    const input = itemElement.querySelector('.edit-input');
    if (!input) return;
    
    const newName = input.value.trim();
    
    if (!newName) {
        alert('Pazaryeri adı boş olamaz!');
        return;
    }
    
    if (newName !== oldName && marketplaces.includes(newName)) {
        alert('Bu pazaryeri zaten mevcut!');
        return;
    }

    if (defaultMarketplaces.includes(oldName)) {
        alert('Varsayılan pazaryerleri düzenlenemez!');
        updateMarketplaceList();
        return;
    }
    
    const index = marketplaces.indexOf(oldName);
    if (index !== -1) {
        // Pazaryeri adını güncelle
        marketplaces[index] = newName;
        
        // Hizmet ücreti ve kargo fiyatlarını yeni ada taşı
        serviceRatesByMarketplace[newName] = serviceRatesByMarketplace[oldName];
        shippingRatesByMarketplace[newName] = shippingRatesByMarketplace[oldName];
        delete serviceRatesByMarketplace[oldName];
        delete shippingRatesByMarketplace[oldName];

        // LocalStorage'ı güncelle
        localStorage.setItem('marketplaces', JSON.stringify(marketplaces));
        saveServiceRatesToLocalStorage();
        saveShippingRatesToLocalStorage();
        
        // UI'ı güncelle
        updateMarketplaceSelect();
        updateMarketplaceList();
        renderServiceRates(false);
        renderShippingRates(false);
        
        // Eğer düzenlenen pazaryeri seçili ise, yeni adı seç
        const select = document.getElementById('marketplaceSelect');
        if (select.value === oldName) {
            select.value = newName;
        }
    }
}

// Düzenlemeyi iptal etme fonksiyonu - güncellendi
function cancelEdit() {
    updateMarketplaceList();
}

// Pazaryeri silme işlevi
const originalDeleteMarketplace = window.deleteMarketplace;
window.deleteMarketplace = function(name) {
    if (defaultMarketplaces.includes(name)) {
        alert('Varsayılan pazaryerleri silinemez!');
        return;
    }

    if (confirm(`${name} pazaryerini silmek istediğinize emin misiniz?`)) {
        // Pazaryerini diziden kaldır
        const index = marketplaces.indexOf(name);
        if (index !== -1) {
            marketplaces.splice(index, 1);
        }

        // Hizmet ücreti ve kargo fiyatlarını temizle
        delete serviceRatesByMarketplace[name];
        delete shippingRatesByMarketplace[name];

        // LocalStorage'ı güncelle
        localStorage.setItem('marketplaces', JSON.stringify(marketplaces));
        saveServiceRatesToLocalStorage();
        saveShippingRatesToLocalStorage();

        // UI'ı güncelle
        updateMarketplaceSelect();
        updateMarketplaceList();
        renderServiceRates(false);
        renderShippingRates(false);

        // Eğer silinen pazaryeri seçili ise, varsayılan pazaryerine geç
        const select = document.getElementById('marketplaceSelect');
        if (select.value === name) {
            select.value = defaultMarketplaces[0];
            // Otomatik hesaplamaları güncelle
            if (document.getElementById('autoCalculateShipping').checked) {
                const sellingPrice = parseLocalFloat(document.getElementById('sellingPrice').value);
                if (!isNaN(sellingPrice)) {
                    const shippingCost = calculateShippingCost(sellingPrice);
                    document.getElementById('shippingCost').value = formatCurrency(shippingCost);
                }
            }
            if (document.getElementById('autoCalculateService').checked) {
                document.getElementById('serviceCost').value = formatCurrency(serviceRatesByMarketplace[defaultMarketplaces[0]] || 0);
            }
        }
    }
};

// Event listener güncelleme
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    loadMarketplaces();
    loadServiceRatesFromLocalStorage();
    
    // İlk pazaryerinin hizmet maliyetini ayarla
    const initialMarketplace = document.getElementById('marketplaceSelect').value;
    const initialServiceRate = serviceRatesByMarketplace[initialMarketplace] || 0;
    document.getElementById('serviceCost').value = formatCurrency(initialServiceRate);
    
    // Sadece sayısal input'lar için validasyon
    const numericInputs = [
        'sellingPrice',
        'productCost',
        'shippingCost',
        'serviceCost',
        'commissionRate'
    ];
    
    numericInputs.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', validateNumericInput);

            // Enter tuşunu dinle
            input.addEventListener('keypress', function(event) {
                if (event.key === 'Enter') {
                    event.preventDefault(); // Formun submit olmasını engelle
                    calculateProfit(); // Hesapla fonksiyonunu tetikle
                }
            });

            // Fokus kaybedildiğinde formatı düzelt
            input.addEventListener('blur', function() {
                if (this.value) {
                    const num = parseLocalFloat(this.value);
                    this.value = formatCurrency(num);
                }
            });
        }
    });

    // Ürün Adı için Enter tuşunu dinle
    const productNameInput = document.getElementById('productName');
    if (productNameInput) {
        productNameInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Formun submit olmasını engelle
                calculateProfit(); // Hesapla fonksiyonunu tetikle
            }
        });
    }

    loadHTML2PDF();
    fetchExchangeRate();
    
    // USD input için validasyon
    const usdAmountInput = document.getElementById('usdAmount');
    if (usdAmountInput) {
        usdAmountInput.addEventListener('input', validateNumericInput);

        // Enter tuşunu dinle
        usdAmountInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); // Formun submit olmasını engelle
                convertCurrency(); // Çevirme işlemini tetikle
            }
        });

        // Fokus kaybedildiğinde formatı düzelt
        usdAmountInput.addEventListener('blur', function() {
            if (this.value) {
                const num = parseLocalFloat(this.value);
                this.value = formatCurrency(num);
            }
        });
    }

    // Satış fiyatı değiştiğinde kargo maliyetini otomatik hesapla
    const sellingPriceInput = document.getElementById('sellingPrice');
    const autoCalculateShipping = document.getElementById('autoCalculateShipping');
    const shippingCostInput = document.getElementById('shippingCost');

    sellingPriceInput.addEventListener('input', function() {
        if (autoCalculateShipping.checked) {
            const sellingPrice = parseLocalFloat(this.value);
            if (!isNaN(sellingPrice)) {
                const shippingCost = calculateShippingCost(sellingPrice);
                shippingCostInput.value = formatCurrency(shippingCost);
            }
        }
    });

    // Oto hesap checkbox'ı değiştiğinde
    autoCalculateShipping.addEventListener('change', function() {
        shippingCostInput.readOnly = this.checked;
        if (this.checked) {
            const sellingPrice = parseLocalFloat(sellingPriceInput.value);
            if (!isNaN(sellingPrice)) {
                const shippingCost = calculateShippingCost(sellingPrice);
                shippingCostInput.value = formatCurrency(shippingCost);
            }
        }
    });

    // Başlangıçta kargo input'unu readonly yap
    shippingCostInput.readOnly = autoCalculateShipping.checked;

    // Kayıtlı kargo fiyatlarını yükle
    loadShippingRatesFromLocalStorage();
    renderShippingRates(false);

    updateMarketplaceList();

    // Pazaryeri değiştiğinde kargo tablosunu ve maliyetini güncelle
    document.getElementById('marketplaceSelect').addEventListener('change', function() {
        renderShippingRates(false);
        
        // Eğer otomatik hesaplama açıksa kargo maliyetini güncelle
        const autoCalculateShipping = document.getElementById('autoCalculateShipping');
        if (autoCalculateShipping.checked) {
            const sellingPrice = parseLocalFloat(document.getElementById('sellingPrice').value);
            if (!isNaN(sellingPrice)) {
                const shippingCost = calculateShippingCost(sellingPrice);
                document.getElementById('shippingCost').value = formatCurrency(shippingCost);
            }
        }
    });

    addImportExportButtons();
    loadServiceRatesFromLocalStorage();
    renderServiceRates(false);
    
    // Otomatik hizmet ücreti hesaplama
    const serviceCostInput = document.getElementById('serviceCost');
    const autoCalculateService = document.getElementById('autoCalculateService');
    
    serviceCostInput.readOnly = autoCalculateService.checked;
    
    autoCalculateService.addEventListener('change', function() {
        serviceCostInput.readOnly = this.checked;
        if (this.checked) {
            const currentMarketplace = document.getElementById('marketplaceSelect').value;
            serviceCostInput.value = formatCurrency(serviceRatesByMarketplace[currentMarketplace] || 0);
        }
    });
    
    // Pazaryeri değiştiğinde hizmet ücretini güncelle
    document.getElementById('marketplaceSelect').addEventListener('change', function() {
        if (autoCalculateService.checked) {
            serviceCostInput.value = formatCurrency(serviceRatesByMarketplace[this.value] || 0);
        }
    });

    // Pazaryeri logo yönetimi için yeni fonksiyon
    function updateMarketplaceLogo(marketplace) {
        const logoImg = document.getElementById('marketplaceLogo');
        const logoContainer = document.querySelector('.marketplace-logo');
        
        // Logo yolunu düzelt
        const logoPath = `./images/${marketplace.toLowerCase().replace(/\s+/g, '')}.png`;
        console.log('Logo yolu:', logoPath); // Debug için yolu logla
        
        // Logo yükleme öncesi yükleniyor animasyonu
        logoContainer.classList.add('loading');
        
        // Yeni Image objesi ile test et
        const testImg = new Image();
        testImg.onload = function() {
            logoImg.src = this.src;
            logoContainer.classList.remove('loading');
            logoContainer.classList.remove('error');
            console.log('Logo başarıyla yüklendi');
        };
        
        testImg.onerror = function() {
            console.error('Logo yüklenemedi:', logoPath);
            logoImg.src = './images/default.png';
            logoContainer.classList.remove('loading');
            logoContainer.classList.add('error');
        };
        
        testImg.src = logoPath;
    }

    // Pazaryeri seçimi değiştiğinde logo güncelleme
    document.getElementById('marketplaceSelect').addEventListener('change', function() {
        updateMarketplaceLogo(this.value);
    });

    // Sayfa yüklendiğinde varsayılan pazaryeri için logo göster
    const defaultMarketplace = document.getElementById('marketplaceSelect').value;
    updateMarketplaceLogo(defaultMarketplace);
});

// Geçmişi temizleme fonksiyonu
function clearHistory() {
    if (confirm('Tüm hesaplama geçmişini silmek istediğinizden emin misiniz?')) {
        calculationHistory = [];
        updateHistory();
        saveToLocalStorage();
    }
}

// PDF indirme fonksiyonu
function exportToPDF() {
    try {
        const formatTurkish = (num) => num.replace('.', ',');
        const doc = document.createElement('div');
        doc.innerHTML = `
            <h2 style="text-align: center; margin-bottom: 10px; font-size: 14px;">Geçmiş</h2>
            <table border="1" style="border-collapse: collapse; width: 100%; font-size: 12px;">
                <style>
                    th, td { 
                        padding: 3px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        text-align: center !important;  /* Tüm hücreleri ortala */
                    }
                    th { 
                        font-weight: bold; 
                        background-color: #f2f2f2;
                        font-size: 11px;
                    }
                    td { 
                        max-width: 60px;
                        vertical-align: middle;  /* Dikey ortalama */
                    }
                    .text-column { 
                        text-align: center !important;  /* Metin sütunlarını da ortala */
                    }
                    .number-column { 
                        text-align: center !important;  /* Sayı sütunlarını da ortala */
                    }
                </style>
                <tr>
                    <th style="width: 12%;">Ürün Adı</th>
                    <th style="width: 9%;">Satış F.</th>
                    <th style="width: 9%;">Maliyet</th>
                    <th style="width: 6%;">Fatura</th>
                    <th style="width: 9%;">Kargo</th>
                    <th style="width: 9%;">Hizmet</th>
                    <th style="width: 6%;">Kom%</th>
                    <th style="width: 9%;">KomTL</th>
                    <th style="width: 11%;">V.Öncesi</th>
                    <th style="width: 11%;">V.Sonrası</th>
                    <th style="width: 9%;">Kâr%</th>
                </tr>
                ${calculationHistory.map(item => `
                    <tr>
                        <td class="text-column">${item.productName}</td>
                        <td class="number-column">${formatTurkish(item.sellingPrice)}₺</td>
                        <td class="number-column">${formatTurkish(item.productCost)}₺</td>
                        <td class="text-column">${item.hasInvoice}</td>
                        <td class="number-column">${formatTurkish(item.shippingCost)}₺</td>
                        <td class="number-column">${formatTurkish(item.serviceCost)}₺</td>
                        <td class="number-column">${formatTurkish(item.commissionRate)}</td>
                        <td class="number-column">${formatTurkish(item.commissionAmount)}₺</td>
                        <td class="number-column">${formatTurkish(item.netProfitBeforeTax)}₺</td>
                        <td class="number-column">${formatTurkish(item.netProfitAfterTax)}₺</td>
                        <td class="number-column">${formatTurkish(item.profitMargin)}</td>
                    </tr>
                `).join('')}
            </table>
        `;

        const opt = {
            margin: [5, 3, 5, 3], // [top, right, bottom, left] - marjinleri azalttık
            filename: 'hesaplama-gecmisi.pdf',
            html2canvas: { 
                scale: 2,
                letterRendering: true,
                useCORS: true,
                logging: false
            },
            jsPDF: { 
                unit: 'mm', 
                format: 'a4', // a3'ten a4'e değiştirdik
                orientation: 'landscape',
                compress: true,
                precision: 2
            }
        };

        html2pdf().set(opt).from(doc).save().catch(err => {
            console.error('PDF oluşturma hatası:', err);
            alert('PDF oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
        });
    } catch (error) {
        console.error('Genel hata:', error);
        alert('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.');
    }
}

// HTML2PDF kütüphanesini ekle
function loadHTML2PDF() {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    document.head.appendChild(script);
}

// Fonksiyonları global scope'a ekle
window.calculateProfit = calculateProfit;
window.updateHistory = updateHistory;
window.selectHistoryRow = selectHistoryRow;
window.clearHistory = clearHistory;
window.exportToPDF = exportToPDF;
window.toggleShippingEdit = toggleShippingEdit;
window.addNewRate = addNewRate;
window.deleteRate = deleteRate;
window.saveShippingRates = saveShippingRates;
window.showAddMarketplaceModal = showAddMarketplaceModal;
window.addNewMarketplace = addNewMarketplace;
window.editMarketplace = editMarketplace;
window.deleteMarketplace = deleteMarketplace;
window.saveEdit = saveEdit;
window.cancelEdit = cancelEdit;

function exportShippingRates(selectedMarketplaces = null) {
    try {
        let exportData = {};
        
        if (selectedMarketplaces) {
            // Sadece seçili pazaryerlerini dışa aktar
            selectedMarketplaces.forEach(marketplace => {
                if (shippingRatesByMarketplace[marketplace]) {
                    exportData[marketplace] = shippingRatesByMarketplace[marketplace].map(rate => ({
                        min: rate.min,
                        max: rate.max === Infinity ? "∞" : rate.max,
                        cost: rate.cost
                    }));
                }
            });
        } else {
            // Tüm pazaryerlerini dışa aktar
            for (const [marketplace, rates] of Object.entries(shippingRatesByMarketplace)) {
                exportData[marketplace] = rates.map(rate => ({
                    min: rate.min,
                    max: rate.max === Infinity ? "∞" : rate.max,
                    cost: rate.cost
                }));
            }
        }

        // JSON dosyasını oluştur ve indir
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = selectedMarketplaces ? 
            `kargo-fiyatlari-${selectedMarketplaces.join('-')}.json` : 
            'tum-kargo-fiyatlari.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Dışa aktarma hatası:', error);
        alert('Dışa aktarma sırasında bir hata oluştu.');
    }
}

function showExportDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'export-dialog';
    dialog.innerHTML = `
        <div class="export-dialog-content">
            <h3>Kargo Fiyatlarını Dışa Aktar</h3>
            <div class="marketplace-list">
                ${Object.keys(shippingRatesByMarketplace).map(marketplace => `
                    <div class="marketplace-checkbox">
                        <input type="checkbox" id="export-${marketplace}" value="${marketplace}">
                        <label for="export-${marketplace}">${marketplace}</label>
                    </div>
                `).join('')}
            </div>
            <div class="dialog-buttons">
                <button onclick="exportSelected()">Seçilenleri Aktar</button>
                <button onclick="exportShippingRates()">Tümünü Aktar</button>
                <button onclick="closeExportDialog()">İptal</button>
            </div>
        </div>
    `;
    document.body.appendChild(dialog);
}

function exportSelected() {
    const checkboxes = document.querySelectorAll('.marketplace-checkbox input:checked');
    const selectedMarketplaces = Array.from(checkboxes).map(cb => cb.value);
    
    if (selectedMarketplaces.length === 0) {
        alert('Lütfen en az bir pazaryeri seçin');
        return;
    }
    
    exportShippingRates(selectedMarketplaces);
    closeExportDialog();
}

function closeExportDialog() {
    const dialog = document.querySelector('.export-dialog');
    if (dialog) {
        dialog.remove();
    }
}

function importShippingRates() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const importData = JSON.parse(e.target.result);
                
                // Her pazaryeri için ayrı kontrol ve işlem
                for (const [marketplace, rates] of Object.entries(importData)) {
                    // Veri doğrulama
                    if (!Array.isArray(rates)) {
                        throw new Error(`${marketplace} için geçersiz veri formatı`);
                    }

                    // Verileri işle
                    const validRates = rates.map(rate => ({
                        min: parseFloat(rate.min),
                        max: rate.max === "∞" ? Infinity : parseFloat(rate.max),
                        cost: parseFloat(rate.cost)
                    }));

                    // Geçerlilik kontrolü
                    const isValid = validRates.every(rate => 
                        !isNaN(rate.min) && 
                        (rate.max === Infinity || !isNaN(rate.max)) && 
                        !isNaN(rate.cost)
                    );

                    if (!isValid) {
                        throw new Error(`${marketplace} için geçersiz değerler`);
                    }

                    // Pazaryeri kontrolü ve ekleme
                    if (!marketplaces.includes(marketplace)) {
                        if (confirm(`"${marketplace}" pazaryeri mevcut değil. Eklensin mi?`)) {
                            marketplaces.push(marketplace);
                            localStorage.setItem('marketplaces', JSON.stringify(marketplaces));
                            updateMarketplaceSelect();
                        }
                    }

                    // Kargo fiyatlarını güncelle
                    shippingRatesByMarketplace[marketplace] = validRates;
                }

                saveShippingRatesToLocalStorage();
                renderShippingRates(false);
                
                alert('Kargo fiyatları başarıyla içe aktarıldı.');
            } catch (error) {
                console.error('İçe aktarma hatası:', error);
                alert('Dosya içe aktarılırken bir hata oluştu: ' + error.message);
            }
        };

        reader.readAsText(file);
    };

    input.click();
}

// Düğmeleri güncelle
function addImportExportButtons() {
    const controls = document.querySelector('.shipping-controls');
    if (controls) {
        // Yeni bir container div oluştur
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'shipping-controls-container';
        
        // Mevcut düğmeleri için bir div
        const actionButtons = document.createElement('div');
        actionButtons.className = 'action-buttons-left';
        actionButtons.innerHTML = `
            <button type="button" class="add-rate-button" onclick="addNewRate()">Yeni Ekle</button>
            <button type="button" class="save-rates-button" onclick="saveShippingRates()">Kaydet</button>
        `;
        
        // Import/Export düğmeleri için bir div
        const importExportButtons = document.createElement('div');
        importExportButtons.className = 'action-buttons-right';
        importExportButtons.innerHTML = `
            <button type="button" class="export-rates-button" onclick="showExportDialog()">Dışa Aktar</button>
            <button type="button" class="import-rates-button" onclick="importShippingRates()">İçe Aktar</button>
        `;
        
        // Container'a düğmeleri ekle
        buttonsContainer.appendChild(actionButtons);
        buttonsContainer.appendChild(importExportButtons);
        
        // Mevcut controls div'ini temizle ve yeni container'ı ekle
        controls.innerHTML = '';
        controls.appendChild(buttonsContainer);
    }
}

// Stil eklemeleri
const style = document.createElement('style');
style.textContent = `
    .export-dialog {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
    }
    .export-dialog-content {
        background: white;
        padding: 20px;
        border-radius: 8px;
        min-width: 300px;
    }
    .marketplace-list {
        margin: 15px 0;
        max-height: 200px;
        overflow-y: auto;
    }
    .marketplace-checkbox {
        margin: 8px 0;
    }
    .dialog-buttons {
        display: flex;
        gap: 10px;
        justify-content: flex-end;
        margin-top: 15px;
    }
    .dialog-buttons button {
        background: #4800ff;
        color: white;
        border: none;
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
    }
    @media (prefers-color-scheme: dark) {
        .export-dialog-content {
            background: #2c3e50;
            color: white;
        }
    }
    .shipping-controls-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }
    
    .action-buttons-left {
        display: flex;
        gap: 10px;
    }
    
    .action-buttons-right {
        display: flex;
        gap: 10px;
    }
    
    .export-rates-button,
    .import-rates-button {
        background: #ff6000;
        color: white;
        border: none;
        padding: 8px 12px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    }
    
    .export-rates-button:hover,
    .import-rates-button:hover {
        background: #e65600;
    }
`;
document.head.appendChild(style);

// Global scope'a ekle
window.exportShippingRates = exportShippingRates;
window.importShippingRates = importShippingRates;
window.showExportDialog = showExportDialog;
window.exportSelected = exportSelected;
window.closeExportDialog = closeExportDialog;

// Hizmet ücreti düzenleme modu
function toggleServiceEdit() {
    const table = document.getElementById('serviceRatesTable');
    const editColumn = table.querySelectorAll('.edit-column');
    const controls = document.querySelector('.service-controls');
    const editButton = document.querySelector('.service-rates .edit-button');
    const marketplaceSelect = document.getElementById('marketplaceSelect');
    
    const isEditing = controls.style.display === 'none';
    
    if (isEditing) {
        // Düzenleme başlıyor
        marketplaceSelect.disabled = true;
        marketplaceSelect.style.opacity = '0.6';
    } else {
        // İptal ediliyor
        marketplaceSelect.disabled = false;
        marketplaceSelect.style.opacity = '1';
    }
    
    controls.style.display = isEditing ? 'flex' : 'none';
    editButton.querySelector('.edit-text').textContent = isEditing ? 'İptal' : 'Düzenle';
    editColumn.forEach(col => col.style.display = isEditing ? '' : 'none');
    
    renderServiceRates(isEditing);
}

// Hizmet ücretlerini göster
function renderServiceRates(isEditing) {
    const tbody = document.querySelector('#serviceRatesTable tbody');
    tbody.innerHTML = '';
    
    Object.entries(serviceRatesByMarketplace).forEach(([marketplace, rate]) => {
        const row = document.createElement('tr');
        if (isEditing) {
            row.innerHTML = `
                <td>${marketplace}</td>
                <td><input type="text" value="${rate}" class="service-rate-input" data-marketplace="${marketplace}"></td>
                <td class="edit-column">
                    <button onclick="resetServiceRate('${marketplace}')" style="color: red; background: none; border: none; cursor: pointer;">↺</button>
                </td>
            `;
        } else {
            row.innerHTML = `
                <td>${marketplace}</td>
                <td>${rate} ₺</td>
                <td class="edit-column" style="display: none;"></td>
            `;
        }
        tbody.appendChild(row);
    });
}

// Hizmet ücretlerini kaydet
function saveServiceRates() {
    const inputs = document.querySelectorAll('.service-rate-input');
    inputs.forEach(input => {
        const marketplace = input.dataset.marketplace;
        const rate = parseLocalFloat(input.value);
        
        if (isNaN(rate) || rate < 0) {
            alert('Lütfen geçerli bir hizmet ücreti girin!');
            return;
        }
        
        serviceRatesByMarketplace[marketplace] = rate;
    });
    
    saveServiceRatesToLocalStorage();
    toggleServiceEdit();
    
    // Eğer otomatik hesaplama açıksa hizmet maliyetini güncelle
    if (document.getElementById('autoCalculateService').checked) {
        const currentMarketplace = document.getElementById('marketplaceSelect').value;
        document.getElementById('serviceCost').value = formatCurrency(serviceRatesByMarketplace[currentMarketplace] || 0);
    }
}

// Varsayılan değere sıfırla
function resetServiceRate(marketplace) {
    const defaultRates = {
        'Trendyol': 8.4,
        'Hepsiburada': 14.4,
        'N11': 4.1
    };
    
    const input = document.querySelector(`.service-rate-input[data-marketplace="${marketplace}"]`);
    if (input && defaultRates[marketplace]) {
        input.value = defaultRates[marketplace];
    }
}

// LocalStorage işlemleri
function saveServiceRatesToLocalStorage() {
    localStorage.setItem('serviceRatesByMarketplace', JSON.stringify(serviceRatesByMarketplace));
}

function loadServiceRatesFromLocalStorage() {
    const saved = localStorage.getItem('serviceRatesByMarketplace');
    if (saved) {
        serviceRatesByMarketplace = JSON.parse(saved);
    }
}

// Global scope'a yeni fonksiyonları ekle
window.toggleServiceEdit = toggleServiceEdit;
window.saveServiceRates = saveServiceRates;
window.resetServiceRate = resetServiceRate;

// Sıfırlama modalını göster
function showResetConfirmation() {
    document.getElementById('resetModal').style.display = 'block';
    document.getElementById('resetCode').value = '';
    document.getElementById('resetCode').focus();
}

// Modalı kapat
function closeResetModal() {
    document.getElementById('resetModal').style.display = 'none';
}

// Verileri sıfırla
function resetData() {
    const resetCode = document.getElementById('resetCode').value;
    
    if (resetCode === '0000') {
        // LocalStorage'daki tüm verileri temizle
        localStorage.clear();
        
        // Değişkenleri sıfırla
        calculationHistory = [];
        selectedRowIndex = -1;
        serviceRatesByMarketplace = {
            'Trendyol': 8.4,
            'Hepsiburada': 14.4,
            'N11': 4.1
        };
        shippingRatesByMarketplace = {
            'Trendyol': [
                { min: 0, max: 149.99, cost: 44 },
                { min: 150, max: 249.99, cost: 75 },
                { min: 250, max: Infinity, cost: 85 }
            ],
            'Hepsiburada': [
                { min: 0, max: 149.99, cost: 42 },
                { min: 150, max: 299.99, cost: 60 },
                { min: 300, max: Infinity, cost: 74.40 }
            ],
            'N11': [
                { min: 0, max: 149.99, cost: 43 },
                { min: 150, max: 299.99, cost: 75 },
                { min: 300, max: Infinity, cost: 87.4 }
            ]
        };

        // UI'ı güncelle
        updateHistory();
        renderShippingRates(false);
        renderServiceRates(false);
        updateMarketplaceSelect();
        
        // Modalı kapat
        closeResetModal();
        
        // Kullanıcıyı bilgilendir
        alert('Tüm veriler başarıyla sıfırlandı!');
        
        // Sayfayı yenile
        window.location.reload();
    } else {
        alert('Hatalı şifre! Doğru şifre: 0000');
    }
}

// Event listener'ları ekle
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeResetModal();
    }
    if (event.key === 'Enter' && document.getElementById('resetModal').style.display === 'block') {
        resetData();
    }
});

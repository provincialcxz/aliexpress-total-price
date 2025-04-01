// Configuration of selectors
const config = {
    priceSelectors: [
        '[class*="Price__main"]',
        '[class*="ProductPrice__price"]',
        '.price, .item-price'
    ],
    deliverySelectors: [
        '[class*="DeliveryMethodItem__price"]',
        '[class*="Delivery__price"]',
        '.delivery-price, .shipping-cost'
    ],
    freeDeliveryText: {
        ru: 'Бесплатно',
        en: 'Free',
        es: 'Gratis',
        fr: 'Gratuit'
    }
};

// Searching for an element in the list of selectors
function findElement(selectors) {
    for (const selector of selectors) {
        const element = document.querySelector(selector);
        if (element) return element;
    }
    return null;
}

// Extracting the price from the text
function extractPrice(text) {
    if (!text) return 0;
    
    const cleaned = text.replace(/[^\d.]/g, '');
    return parseFloat(cleaned) || 0;
}

// Defining the language of the page
function getPageLanguage() {
    const htmlLang = document.documentElement.getAttribute('lang');
    if (htmlLang?.includes('ru')) return 'ru';
    if (htmlLang?.includes('en')) return 'en';
    
    const bodyText = document.body.textContent;
    if (/товар|доставка|руб/i.test(bodyText)) return 'ru';
    if (/product|shipping|usd/i.test(bodyText)) return 'en';
    
    return 'en';
}

// Displaying the final price
function displayTotalPrice() {
    const priceElement = findElement(config.priceSelectors);
    const deliveryElement = findElement(config.deliverySelectors);

    if (!priceElement || !deliveryElement) {
        console.debug('[Total Price Extension] Элементы не найдены');
        return;
    }

    const language = getPageLanguage();
    const price = extractPrice(priceElement.textContent);
    const deliveryText = deliveryElement.textContent.trim();
    
    const isFreeDelivery = Object.values(config.freeDeliveryText).some(
        text => deliveryText.includes(text)
    );

    if (isFreeDelivery) {
        document.querySelector('.total-price-extension')?.remove();
        return;
    }

    const deliveryPrice = extractPrice(deliveryText);
    const total = price + deliveryPrice;
    
    let totalElement = document.querySelector('.total-price-extension');
    let totalText;

    if (language === 'ru') {
        totalText = `С доставкой: ${total.toLocaleString('ru-RU')} ₽`;
    } else {
        const currencySymbol = deliveryText.match(/[\$\€\£]/)?.[0] || '';
        totalText = `Total with shipping: ${currencySymbol}${total.toFixed(2)}`;
    }

    if (totalElement) {
        totalElement.textContent = totalText;
    } else {
        totalElement = document.createElement('div');
        totalElement.className = 'total-price-extension';
        totalElement.textContent = totalText;
        totalElement.style.cssText = `
            margin-top: 10px;
            font-size: 18px;
            color: #d32f2f;
            font-weight: bold;
        `;
        priceElement.parentNode.appendChild(totalElement);
    }
}

// Debounce for optimization
function debounce(func, delay) {
    let timeout;
    return () => {
        clearTimeout(timeout);
        timeout = setTimeout(func, delay);
    };
}

// Observer for DOM changes
const observer = new MutationObserver(debounce(displayTotalPrice, 300));
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Starting at boot
document.addEventListener('DOMContentLoaded', displayTotalPrice);
displayTotalPrice();
import { getMenuDataStore } from "./getMenuDataStore.js";
import { globalData } from "./globalData.js";
import { words } from "./words.js";

// Массивы
const MENU_LIST_GLOBAL = [];
let CART_LIST_GLOBAL = [];
let ORDER_LIST_GLOBAL = [];
let ORDERS_HISTORY = [];

//Глобальные константы
const userLang = document.documentElement.lang;
const mainLang = globalData.mainLang;

//Глобальные константы DOM
const categoryListDiv = document.getElementById('categoryListDiv');
const menuListDiv = document.getElementById('menuListDiv');

const buttonCartOpenClouse = document.getElementById('buttonCartOpenClouse');
const cartLengthNumber = document.getElementById('cartLengthNumber');
const orderLengthNumberInNav = document.getElementById('orderLengthNumberInNav');
const buttonCartClouse = document.getElementById('buttonCartClouse');
const cartBoxDiv = document.getElementById('cartBoxDiv');
const cartListDiv = document.getElementById('cartListDiv');
const buttonSendOrder = document.getElementById('buttonSendOrder');
const cartListTotalCostNumber = document.getElementById('cartListTotalCostNumber');

const wrapperDiv = document.querySelector('.wrapper');
const dialogBoxDiv = document.getElementById('dialogBoxDiv');

const orderBoxTotalCostNumber = document.getElementById('orderBoxTotalCostNumber');
const orderListDiv = document.getElementById('orderListDiv');
const buttonShowOrderList = document.getElementById('buttonShowOrderList');
const buttonPayOrder = document.getElementById('buttonPayOrder');
buttonPayOrder.classList.add('display_none');
const historyOrdersButtonInOrderHead = document.getElementById('historyOrdersButtonInOrderHead');
const historyOdresLengthNumber2 = document.getElementById('historyOdresLengthNumber2');


const orderCheck = document.getElementById('orderCheck');
const orderCheckClouseButton = document.getElementById('orderCheckClouseButton');
const orderCheckTotalCostNumber = document.getElementById('orderCheckTotalCostNumber');
orderCheckTotalCostNumber.classList.add('display_none');
const buttonPayOrderInCheck = document.getElementById('buttonPayOrderInCheck');
// buttonPayOrderInCheck.classList.add('display_none');
const historyOrderLengthNumber = document.getElementById('historyOrderLengthNumber');
const orderCheckHistoryOrdersButton = document.getElementById('orderCheckHistoryOrdersButton');

const ordersHistoryBox = document.getElementById('ordersHistoryBox');
const ordersBoxClouseButton = document.getElementById('ordersBoxClouseButton');
const ordersHistoryListDiv = document.getElementById('ordersHistoryListDiv');


//Изменяемые переменные
let currentCategory;
let costAllCurrencieslist = [];
let tableNumber = null;
let orderNumber = null;

// Функция для заполнения страницы
function fillingPageContent() {
    for (let key in words[userLang]) {
        const value = words[userLang][key];

        if (key === "title") {
            document.title = value;
            continue;
        }

        const el = document.getElementById(key);
        if (!el) continue;

        if (el.tagName === "META") {
            // у мета-тега — в атрибут content
            el.setAttribute("content", value);
        } else {
            // для всех остальных — innerHTML
            el.innerHTML = value;
        }
    }
}
document.addEventListener("DOMContentLoaded", () => {
    fillingPageContent();
});

// Функция для анимации прокрутки элементов
function hintHorizontalScroll(distance = 500, duration = 1500, container) {
    if (!container) return;
    const items = container.children;
    // соберем ключфреймы заранее
    const keyframes = [
        { transform: 'translateX(0)' },
        { transform: `translateX(-${distance}px)` },
        { transform: 'translateX(0)' }
    ];
    Array.from(items).forEach(el => {
        el.animate(keyframes, {
            duration: duration * 2,
            easing: 'ease-out',
            fill: 'both'
        });
    });
}

// Функция для проверки сохранения
function checkSave(category) {
    if (localStorage.getItem(`${globalData.cafeName}_tableNumber`)) {
        tableNumber = localStorage.getItem(`${globalData.cafeName}_tableNumber`);
    }
    if (localStorage.getItem(`${globalData.cafeName}_userData`)) {
        const savedUserData = JSON.parse(localStorage.getItem(`${globalData.cafeName}_userData`));
        CART_LIST_GLOBAL = savedUserData.CART_LIST_GLOBAL;
        ORDER_LIST_GLOBAL = savedUserData.ORDER_LIST_GLOBAL;
        ORDERS_HISTORY = savedUserData.ORDERS_HISTORY;
        orderNumber = savedUserData.orderNumber;

        renderMenuCard(category);
        renderCartList();
        renderOrderList();
        renderOrdersHistoryList();
    } else {
        renderMenuCard(category);
    }
    setTimeout(() => {
        hintHorizontalScroll(500, 1200, categoryListDiv);
        hintHorizontalScroll(300, 1200, menuListDiv);
    }, 1000);

}


//Старт получение базы данных
getMenuDataStore(globalData.sheetId)
    .then(MENU_DATA_STORE => {
        MENU_DATA_STORE.forEach(menuItem => {
            MENU_LIST_GLOBAL.push(menuItem)
        });
        conversionCost();
        renderCategoryButtons();
        setTimeout(() => {
            document.querySelector('.loader').classList.add('loader_hide');
        }, 500);
    })
    .catch(error => {
        console.error('Ошибка при получении списка блюд:', error);
        // alert(words[lang].appError)
    });


//Функция рендера раздела категории
function renderCategoryButtons() {
    categoryListDiv.innerHTML = '';
    const addedCategories = new Set(); // Сет для категорий

    MENU_LIST_GLOBAL.forEach(MENU_ITEM => {
        // если блюдо доступно
        if (MENU_ITEM.inStore == 'yes') {
            // если блюдо по акции
            if (MENU_ITEM.discount == 'yes' && !addedCategories.has("discount")) {
                const categoryButton = document.createElement('button');
                categoryButton.innerHTML = words[userLang].categoryButtonDiscountText;
                categoryButton.addEventListener('click', () => {
                    categoryListDiv.querySelector('button.button_active').classList.remove('button_active');
                    categoryButton.classList.add('button_active');
                    renderMenuCard('discount');
                });
                categoryListDiv.prepend(categoryButton);
                addedCategories.add("discount");
            }
            // все остальные блюда, включая те что по акции
            const menuItemCategory = MENU_ITEM[`${userLang}Category`];
            if (!addedCategories.has(menuItemCategory)) {
                const categoryButton = document.createElement('button');
                categoryButton.innerHTML = menuItemCategory;
                categoryButton.addEventListener('click', () => {
                    categoryListDiv.querySelector('button.button_active').classList.remove('button_active');
                    categoryButton.classList.add('button_active');
                    currentCategory = menuItemCategory;
                    renderMenuCard(menuItemCategory);
                });
                categoryListDiv.appendChild(categoryButton);
                addedCategories.add(menuItemCategory);
            }
        }
    });
    // Когда все кнопки сформированы
    categoryListDiv.querySelector('button').classList.add('button_active');
    // если есть категория - предложение дня
    if (addedCategories.has("discount")) {
        checkSave("discount");
        // renderMenuCard("discount")
    } else {
        checkSave(categoryListDiv.querySelector('button').innerText);
    }
}

// Функция рендера главного меню
function renderMenuCard(category) {
    currentCategory = category;
    menuListDiv.classList.add('menu-list_loading');
    setTimeout(() => {
        menuListDiv.innerHTML = '';
        MENU_LIST_GLOBAL.forEach(MENU_ITEM => {
            const itemCategory = MENU_ITEM[`${userLang}Category`];
            if ((itemCategory == category && MENU_ITEM.inStore == 'yes') || (category == 'discount' && MENU_ITEM.discount == 'yes' && MENU_ITEM.inStore == 'yes')) {
                //создаем див для карточки
                const menuCardDiv = document.createElement('div');
                const cardId = MENU_ITEM.id;
                menuCardDiv.dataset.id = cardId;
                menuCardDiv.className = 'menu-card';
                //настройка мзображения
                if (MENU_ITEM.imgGif) {
                    menuCardDiv.classList.add('menu-card_img-gif');
                }
                const imgSrc = MENU_ITEM.img ? MENU_ITEM.img : './img/samlesImg.png';
                //HTML верхней части
                menuCardDiv.innerHTML = `
                <button class='menu-card__button_play'>
                    <i class="fa-solid fa-play"></i>
                    ${words[userLang].menuCardButtonPlay}
                </button>
                <img src="${imgSrc}" alt="">
                <div class="menu-card__info">
                    <div class="menu-card__description">
                        <h2>${MENU_ITEM[`${userLang}DishesName`]}</h2>
                        <p>
                            ${MENU_ITEM[`${userLang}DishesDescription`]}
                            <button class='decriptFullOpen'>Подробнее</button>
                        </p> 
                        
                        <div class='descript_full'>
                            <button class='decriptFullCancel'><i class="fa-solid fa-xmark"></i></button>
                            <h2>${MENU_ITEM[`${userLang}DishesName`]}</h2>
                            <p>${MENU_ITEM[`${userLang}DishesFullDescription`]}</p>
                        </div> 
                    </div>
                </div>
                `;
                //функция для открытия полного описания
                const decriptFullCancel = menuCardDiv.querySelector('.decriptFullCancel');
                const decriptFullOpen = menuCardDiv.querySelector('.decriptFullOpen');
                const decriptFullBox = menuCardDiv.querySelector('.descript_full');
                decriptFullCancel.addEventListener('click', () => {
                    decriptFullBox.classList.remove('_active');
                });
                decriptFullOpen.addEventListener('click', () => {
                    decriptFullBox.classList.add('_active');
                });
                //функция для активации Gif изображения
                const menuCardButtonPlay = menuCardDiv.querySelector('.menu-card__button_play');
                menuCardButtonPlay.addEventListener('click', () => {
                    menuCardDiv.querySelector('img').setAttribute('src', MENU_ITEM.imgGif);
                    menuCardButtonPlay.classList.add('display_none');
                    setTimeout(() => {
                        menuCardDiv.querySelector('img').setAttribute('src', imgSrc);
                        menuCardButtonPlay.classList.remove('display_none');
                    }, 3000);
                });

                //Создание порций
                const portionsContainerDiv = document.createElement('div');
                portionsContainerDiv.classList.add('menu-card__portions');
                const portionNames = [
                    MENU_ITEM.portionName1,
                    MENU_ITEM.portionName2,
                    MENU_ITEM.portionName3,
                    MENU_ITEM.portionName4,
                    MENU_ITEM.portionName5
                ];
                portionNames.forEach((portionName, index) => {
                    if (portionName) {
                        const portionNumber = index + 1;
                        const portionCostMain = parseInt(MENU_ITEM[`portionCost${portionNumber}`]);
                        let portionCostDiscount;
                        let costAllListObj;
                        let costAllListSpan;
                        let portionInfoHTML;
                        // Если карточка обычная
                        if (MENU_ITEM.discount == 'no') {
                            costAllListObj = createCostAll(portionCostMain, 'number');
                            costAllListSpan = createCostAll(portionCostMain, 'span');
                            portionInfoHTML = `
                            <p class="portion-item__text">
                                <span class="portion-item__name">${portionName}</span>
                                <span class="portion-item__cost">${costAllListSpan}</span>
                            </p>
                            `;
                        } else {// Если карточка по акции
                            portionCostDiscount = parseInt(MENU_ITEM[`portionCost${portionNumber}Discount`]);
                            costAllListObj = createCostAll(portionCostDiscount, 'number');
                            costAllListSpan = createCostAll(portionCostDiscount, 'span');
                            portionInfoHTML = `
                            <p class="portion-item__text">
                                <span class="portion-item__name">${portionName}</span>
                                <span class="portion-item__cost portion-item__cost_column">
                                    <span class='portion-item__cost_normal'>
                                        ${portionCostMain}${globalData.moreCurrencieslist[0].symbol}
                                    </span>
                                    <span class='portion-item__cost_new'>
                                        ${costAllListSpan}
                                    </span>
                                </span>
                            </p>
                            `;
                        };
                        // Создаем div для порции
                        const portionItemDiv = document.createElement('div');
                        portionItemDiv.className = 'portion-item';
                        const portionId = `${cardId}-${portionName}`;
                        portionItemDiv.dataset.id = portionId;
                        const portionAmount = CART_LIST_GLOBAL.find(CART_LIST_ITEM => CART_LIST_ITEM.portionId === portionId)?.amount || 0;
                        if (portionAmount != 0) {
                            menuCardDiv.classList.add('menu-card_active');
                        }
                        // Добавляем весь HTML
                        portionItemDiv.innerHTML = `
                        ${portionInfoHTML}
                        <div class="portion-item__buttons">
                            <button class="portion-minus"><i class="fa-solid fa-minus"></i></button>
                            <span class="portion-amount">${portionAmount}</span>
                            <button class="portion-plus"><i class="fa-solid fa-plus"></i></button>
                        </div>
                        `;
                        // Функционал для кнопок
                        const buttonMinus = portionItemDiv.querySelector('.portion-minus');
                        const buttonPlus = portionItemDiv.querySelector('.portion-plus');
                        const eventData = {
                            action: '',
                            buttonType: 'menu',
                            cardId,
                            portionId,
                            dishNameUserLang: `${MENU_ITEM[`${userLang}DishesName`]}`,
                            dishNameMainLang: `${MENU_ITEM[`${mainLang}DishesName`]}`,
                            category: `${MENU_ITEM[`${mainLang}Category`]}`,
                            portionName,
                            costAllListObj,
                            amountSpan: portionItemDiv.querySelector('.portion-amount'),
                            imgSrc,
                        }
                        buttonMinus.addEventListener('click', () => {
                            eventData.action = 'minus';
                            cartUpdate(eventData);
                        });
                        buttonPlus.addEventListener('click', () => {
                            eventData.action = 'plus';
                            cartUpdate(eventData);
                        });
                        // Добавляем добавляем линию сверху если порция не первая
                        if (index != 0) {
                            const hLine = document.createElement('hr');
                            hLine.className = 'portion-line';
                            portionsContainerDiv.appendChild(hLine);
                        }
                        // Добавляем порцию в контейнер поций
                        portionsContainerDiv.appendChild(portionItemDiv);
                    };
                });
                // Добовляем контейнер с порциями к карточки
                menuCardDiv.querySelector('.menu-card__info').appendChild(portionsContainerDiv);
                // Добовляем добавляем карточку в div
                menuListDiv.appendChild(menuCardDiv);
            };
        });
        menuListDiv.scrollLeft = 0;
        menuListDiv.classList.remove('menu-list_loading');
    }, 500);
}

// Функция для обновления корзины
function cartUpdate(eventData) {
    console.log(eventData);
    const cardInMenu = menuListDiv.querySelector(`[data-id="${eventData.cardId}"]`);
    const portionInCART_LIST_GLOBAL = CART_LIST_GLOBAL.find(CART_ITEM => CART_ITEM.portionId === eventData.portionId);
    let portionSpanInMenu;
    // Если нажали на кнопку в карзине
    if (eventData.buttonType == 'cart') {
        if (cardInMenu) {
            portionSpanInMenu = cardInMenu.querySelector(`[data-id="${eventData.portionId}"]`).querySelector('.portion-amount');
        }
    }
    // Если нажали на плюс
    if (eventData.action == 'plus') {
        // Если нажали на кнопку в меню
        if (eventData.buttonType == 'menu') {
            // Если такой порции ещё нет в карзине
            if (!portionInCART_LIST_GLOBAL) {
                // Создаем обект для массива корзина
                const cartNewItemInfo = {
                    cardId: eventData.cardId,
                    portionId: eventData.portionId,
                    dishNameUserLang: eventData.dishNameUserLang,
                    dishNameMainLang: eventData.dishNameMainLang,
                    category: eventData.category,
                    portionName: eventData.portionName,
                    costAllListObj: eventData.costAllListObj,
                    amount: 1,
                    imgSrc: eventData.imgSrc,
                };
                CART_LIST_GLOBAL.push(cartNewItemInfo);
                eventData.amountSpan.innerText = 1;
                if (cardInMenu) {
                    cardInMenu.classList.add('menu-card_active');
                }
            } else {// Если порция уже есть в карзине
                portionInCART_LIST_GLOBAL.amount += 1;
                eventData.amountSpan.innerText = portionInCART_LIST_GLOBAL.amount;
            }
        } else {// Если нажали на кнопку в корзине
            portionInCART_LIST_GLOBAL.amount += 1;
            eventData.amountSpan.innerText = portionInCART_LIST_GLOBAL.amount;
            if (portionSpanInMenu) {
                portionSpanInMenu.innerHTML = portionInCART_LIST_GLOBAL.amount;
            }
        }
    } else {// Если нажали на минус
        // Если порция есть в карзине
        if (portionInCART_LIST_GLOBAL) {
            portionInCART_LIST_GLOBAL.amount -= 1;
            eventData.amountSpan.innerText = portionInCART_LIST_GLOBAL.amount;
            if (portionSpanInMenu) {
                portionSpanInMenu.innerHTML = portionInCART_LIST_GLOBAL.amount;
            }
            // Если удалили последнию из этих порций
            if (portionInCART_LIST_GLOBAL.amount == 0) {
                CART_LIST_GLOBAL = CART_LIST_GLOBAL.filter(CART_ITEM => CART_ITEM.portionId !== eventData.portionId);
                // Если в карзине нет других порций этого блюда, удаляем класс у карточки
                if (!CART_LIST_GLOBAL.find(CART_ITEM => CART_ITEM.cardId === eventData.cardId)) {
                    if (cardInMenu) {
                        cardInMenu.classList.remove('menu-card_active');
                    }
                }
            }
        }

    }
    renderCartList();
}

// Функция для рендера корзины
function renderCartList() {
    cartListDiv.innerHTML = '';
    let amountPortionNumber = 0;
    CART_LIST_GLOBAL.forEach(CART_ITEM => {
        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.dataset.id = CART_ITEM.cardId;
        const portionAllCost = createCostAll(CART_ITEM.costAllListObj[0].costNumber, 'span', 1);
        const portionAllCostTotal = createCostAll(CART_ITEM.costAllListObj[0].costNumber, 'span', CART_ITEM.amount);
        amountPortionNumber += CART_ITEM.amount;
        cartItemDiv.innerHTML = `
            <div class="cart-item__head">
                <img src="${CART_ITEM.imgSrc}" alt="">
                <div class="cart-item__manager">
                    <div class="cart-item__buttons">
                        <button class="portion-minus"><i class="fa-solid fa-minus"></i></button>
                        <span class="portion-amount">${CART_ITEM.amount}</span>
                        <button class="portion-plus"><i class="fa-solid fa-plus"></i></button>
                    </div>
                    <span id="cartItemTotalCostNumber">${portionAllCostTotal}</span>
                </div>
            </div>
            <div class="cart-item__text">
                <h2>${CART_ITEM.dishNameUserLang}</h2>
                ${userLang !== mainLang ? `<h3>${CART_ITEM.dishNameMainLang}</h3>` : ''}
                <p>
                    <span class="catr-item__portion-name">${CART_ITEM.portionName}</span>
                    –
                    <span class="catr-item__portion-cost">${portionAllCost}</span>
                </p>
            </div>
        `;
        // Функционал для кнопок
        const buttonMinus = cartItemDiv.querySelector('.portion-minus');
        const buttonPlus = cartItemDiv.querySelector('.portion-plus');
        const eventData = {
            action: '',
            buttonType: 'cart',
            cardId: CART_ITEM.cardId,
            portionId: CART_ITEM.portionId,
            dishNameUserLang: CART_ITEM.dishNameUserLang,
            dishNameMainLang: CART_ITEM.dishNameMainLang,
            category: CART_ITEM.category,
            portionName: CART_ITEM.portionName,
            costAllListObj: CART_ITEM.costAllListObj,
            amountSpan: cartItemDiv.querySelector('.portion-amount'),
            imgSrc: CART_ITEM.imgSrc
        }
        buttonMinus.addEventListener('click', () => {
            eventData.action = 'minus';
            cartUpdate(eventData);
        });
        buttonPlus.addEventListener('click', () => {
            eventData.action = 'plus';
            cartUpdate(eventData);
        });
        cartListDiv.appendChild(cartItemDiv);
    });


    if (CART_LIST_GLOBAL.length > 0) {
        buttonCartOpenClouse.classList.add('cart_active');
        buttonSendOrder.classList.add('active');
        // Создаем обект в котором хранится обшая стоимость всех блюд в разных валютах
        const cartListTotalCostObj = aggregateCosts(CART_LIST_GLOBAL);
        // Создаем спан в котором хранится обшая стоимость всех блюд в разных валютах
        const cartListTotalCostSpan = createTotalCost(cartListTotalCostObj, 'span')
        cartListTotalCostNumber.innerHTML = cartListTotalCostSpan;
        // добовляем количество порций в маленький спан у кнопки
        cartLengthNumber.innerHTML = amountPortionNumber;
        cartLengthNumber.classList.add('active');

    } else {
        buttonCartOpenClouse.classList.remove('cart_active');
        buttonSendOrder.classList.remove('active');
        cartListTotalCostNumber.innerHTML = `0${globalData.currencySymbol}`;
        cartLengthNumber.classList.remove('active');
    }
    saveData();
}

//Создание валют и их стоимость
function conversionCost() {
    globalData.moreCurrencieslist.forEach(currencItem => {
        const currencItemInfo = {
            name: currencItem.name,
            symbol: currencItem.symbol,
            rate: parseInt(MENU_LIST_GLOBAL[0][`${currencItem.name}Rate`])
        };
        costAllCurrencieslist.push(currencItemInfo)
    })
}

//создание стоимости блюда в разных валютах (получает стоимость в главной валюте за одну порцию) для карточек главного меню 
function createCostAll(portionCostMain, type, quantity = 1) {
    if (type == 'number') {
        let costListAll = [];
        costAllCurrencieslist.forEach(currenciesCostItem => {
            const newCost = {
                name: currenciesCostItem.name,
                costNumber: Math.ceil(portionCostMain / currenciesCostItem.rate),
                symbol: currenciesCostItem.symbol,
            };
            costListAll.push(newCost);
        });
        return costListAll;
    } else if (type == 'span') {
        let costListAllSpan = ``;
        costAllCurrencieslist.forEach(currenciesCostItem => {
            if (currenciesCostItem.name == 'main') {
                costListAllSpan += `
          <span>${Math.ceil(portionCostMain / currenciesCostItem.rate) * quantity} ${currenciesCostItem.symbol}</span>
          `;
            } else {
                costListAllSpan += `
          <span>  |${Math.ceil(portionCostMain / currenciesCostItem.rate) * quantity} ${currenciesCostItem.symbol}</span>
          `;
            }

        });
        return costListAllSpan;
    }
}

//создание обекта обшая стоимость всех блюд в массиве в разных валютах
function aggregateCosts(list) {
    const totals = {};
    list.forEach(dish => {
        const portions = dish.amount; // количество порций для блюда
        // Для каждого объекта в costAllList данного блюда
        dish.costAllListObj.forEach(currency => {
            // Если для данной валюты ещё не заведён аккумулятор, инициализируем его
            if (!totals[currency.name]) {
                totals[currency.name] = {
                    name: currency.name,
                    costNumber: 0,
                    symbol: currency.symbol
                };
            }
            // Умножаем цену за порцию на количество порций и прибавляем к накопленному значению
            totals[currency.name].costNumber += currency.costNumber * portions;
        });
    });
    // Преобразуем объект в массив объектов и возвращаем его
    return Object.values(totals);
}

//создание спана или сообшения в котором указана обшая стоимоть всех блюд массиве для всех блюд
function createTotalCost(arroy, type, amount = 1) {
    if (type == 'span') {
        let totalCostAllListSpan = ``;
        arroy.forEach(costItem => {
            if (costItem.name == 'main') {
                totalCostAllListSpan += `
          <span>${costItem.costNumber * amount}${costItem.symbol}</span>
          `;
            } else {
                totalCostAllListSpan += `
          <span>| ${costItem.costNumber * amount}${costItem.symbol}</span>
          `;
            }
        })
        return totalCostAllListSpan
    } else if (type == 'message') {
        let totalMessage = ``;
        arroy.forEach(costItem => {
            if (costItem.name == 'main') {
                totalMessage += `${costItem.costNumber * amount}${costItem.symbol}`
            } else {
                totalMessage += ` | ${costItem.costNumber * amount}${costItem.symbol}`
            }

        })
        return totalMessage
    }
}

// Функция формирования сообшения для отправки заказа
function createMessageToTG(mesageType, payMethod = null) {
    let messageTitle = ``;
    let messageHead = ``;
    let messageBody = ``;
    let messageFooter = ``;
    const orderTime = createOrderTime('date');

    switch (mesageType) {
        case 'new order': {
            if (!orderNumber) {
                orderNumber = createOrderNumber();
            };
            messageTitle = words[mainLang].messageTitleNewOrder;
            messageHead = `
${words[mainLang].messageHeadUserLang} <b>${userLang}</b>${words[userLang].flag}
${words[mainLang].messageHeadUserTableNumber} <code><b>${tableNumber}</b></code>
${words[mainLang].messageHeadUserOrderNumber}
${orderNumber.toTG}            
            `;

            messageBody = `
${words[mainLang].messageBodyNewOrder}          
            `;

            let ordinalNumber = 0;
            CART_LIST_GLOBAL.forEach(CART_ITEM => {
                // добовляем время закзаза к обекту
                CART_ITEM.orderTime = orderTime;
                ordinalNumber++;
                const cartItemMessage = `
${ordinalNumber}. <b>${CART_ITEM.dishNameMainLang}</b> (${CART_ITEM.category})
    <u><b>${CART_ITEM.portionName}</b> × <b>${CART_ITEM.amount}</b></u> = ${createTotalCost(CART_ITEM.costAllListObj, 'message', CART_ITEM.amount)}
    ${userLang !== mainLang ? `${CART_ITEM.dishNameUserLang}${words[userLang].flag}` : ''}
                `;
                messageBody += cartItemMessage;
            });

            const cartTotalCostObj = aggregateCosts(CART_LIST_GLOBAL);
            const cartTotalCostMessage = createTotalCost(cartTotalCostObj, 'message');
            messageFooter = `
${words[mainLang].messageFooterTotalCost}  
<b>${cartTotalCostMessage}</b>
            `;

            const fullMessage = `
${messageTitle}
${messageHead}
${messageBody}
${messageFooter}
            `;

            sendMessageToTG(
                fullMessage,
                `${words[userLang].dialogBoxSendOk}`,
                `${words[userLang].dialogBoxSendError}`,
                'updateOrder'
            );
            break;
        }

        case 'add order': {
            messageTitle = words[mainLang].messageTitleAddOrder;
            messageHead = `
${words[mainLang].messageHeadUserLang} <b>${userLang}</b>${words[userLang].flag}
${words[mainLang].messageHeadUserTableNumber} <code><b>${tableNumber}</b></code>
${words[mainLang].messageHeadUserOrderNumber}
${orderNumber.toTG}         
            `;

            let temporaryFullOrder = [...ORDER_LIST_GLOBAL];
            messageBody = `
${words[mainLang].messageBodyAddOrderOldDishes}        
            `;

            let ordinalNumber = 0;
            ORDER_LIST_GLOBAL.forEach(ORDER_ITEM => {
                ordinalNumber++;
                const cartItemMessage = `
${ordinalNumber}. <b>${ORDER_ITEM.dishNameMainLang}</b> (${ORDER_ITEM.category})
    <u><b>${ORDER_ITEM.portionName}</b> × <b>${ORDER_ITEM.amount}</b></u> = ${createTotalCost(ORDER_ITEM.costAllListObj, 'message', ORDER_ITEM.amount)}
    ${userLang !== mainLang ? `${ORDER_ITEM.dishNameUserLang}${words[userLang].flag}` : ''}
                `;
                messageBody += cartItemMessage;
            });

            messageBody += `
${words[mainLang].messageBodyAddOrderNewDishes}            
            `;

            CART_LIST_GLOBAL.forEach(CART_ITEM => {
                // добовляем время закзаза к обекту
                CART_ITEM.orderTime = orderTime;
                ordinalNumber++;
                const cartItemMessage = `
${ordinalNumber}. <b>${CART_ITEM.dishNameMainLang}</b> (${CART_ITEM.category})
    <u><b>${CART_ITEM.portionName}</b> × <b>${CART_ITEM.amount}</b></u> = ${createTotalCost(CART_ITEM.costAllListObj, 'message', CART_ITEM.amount)}
    ${userLang !== mainLang ? `${CART_ITEM.dishNameUserLang}${words[userLang].flag}` : ''}
                `;
                messageBody += cartItemMessage;
                temporaryFullOrder.push(CART_ITEM);
            });

            const orderTotalCostObj = aggregateCosts(temporaryFullOrder);
            const orderTotalCostMessage = createTotalCost(orderTotalCostObj, 'message');
            messageFooter = `
${words[mainLang].messageFooterTotalCost} 
<b>${orderTotalCostMessage}</b>
            `;

            const fullMessage = `
${messageTitle}
${messageHead}
${messageBody}
${messageFooter}
            `;

            sendMessageToTG(
                fullMessage,
                `${words[userLang].dialogBoxSendOk}`,
                `${words[userLang].dialogBoxSendError}`,
                'updateOrder',
                temporaryFullOrder
            );
            break;
        }

        case 'pay': {
            messageTitle = words[mainLang].messageTitlePay;
            messageHead = `
${words[mainLang].messageHeadUserLang} <b>${userLang}</b>${words[userLang].flag}
${words[mainLang].messageHeadUserTableNumber} <b>${tableNumber}</b>
${words[mainLang].messageHeadpayMethod} <b>${payMethod}</b>
${words[mainLang].messageHeadUserOrderNumber}
${orderNumber.toTG}           
            `;

            messageBody = `
${words[mainLang].messageBodyNewOrder}         
            `;

            let ordinalNumber = 0;
            ORDER_LIST_GLOBAL.forEach(ORDER_ITEM => {
                ordinalNumber++;
                const itemTotalCost = `${createTotalCost(ORDER_ITEM.costAllListObj, 'message', ORDER_ITEM.amount)}`
                const cartItemMessage = `
${ordinalNumber}. <b>${ORDER_ITEM.dishNameMainLang}</b> (${ORDER_ITEM.category})
    <u><b>${ORDER_ITEM.portionName}</b> × <b>${ORDER_ITEM.amount}</b></u> = ${itemTotalCost}
       ${userLang !== mainLang ? `${ORDER_ITEM.dishNameUserLang}${words[userLang].flag}` : ''}
                `;
                messageBody += cartItemMessage;
                ORDER_ITEM.itemTotalCost = `${itemTotalCost}`;
            });

            const orderTotalCostObj = aggregateCosts(ORDER_LIST_GLOBAL);
            const orderTotalCostMessage = createTotalCost(orderTotalCostObj, 'message');
            messageFooter = `
${words[mainLang].messageFooterTotalCostFinal}   <b>${orderTotalCostMessage}</b>
            `;

            const fullMessage = `
${messageTitle}
${messageHead}
${messageBody}
${messageFooter}
            `;

            sendMessageToTG(
                fullMessage,
                `${words[userLang].dialogBoxSendRequest}`,
                `${words[userLang].dialogBoxSendError}`,
                'pay'
            );
            break;
        }

        default:
            break;
    }
}

// Функция отправки сообшения в TG
function sendMessageToTG(
    messageText,
    okText,
    errorText,
    messageType,
    newFullOrder = CART_LIST_GLOBAL
) {
    dialogBoxAppears('load', `${words[userLang].dialogBoxLoadSendText}`);
    setTimeout(() => {
        fetch('https://send-messege-to-tg.interactivemenuqr.workers.dev', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chatId: globalData.chatIdTG,
                messageText: messageText,
            }),
        })
            .then(res => res.json())
            .then(data => {
                if (data.status === 'ok') {
                    dialogBoxAppears('info', okText,);
                    if (messageType == 'updateOrder') {
                        ORDER_LIST_GLOBAL = newFullOrder;
                        CART_LIST_GLOBAL = [];
                        renderMenuCard(currentCategory);
                        renderCartList();
                        renderOrderList();
                    } else if (messageType == 'pay') {
                        dialogBoxAppears('finalMessage', `${words[userLang].dialogBoxfinalMessage}`);
                    }
                } else {
                    console.log(data);

                    dialogBoxAppears('info', errorText,);
                }
            })
            .catch(error => {
                dialogBoxAppears('info', errorText,);
            });
    }, 1000);
}

// Функция для формирования диологового окна
function dialogBoxAppears(type, text = '', paymentMethod = null) {
    dialogBoxDiv.innerHTML = '';
    // Общая стоимсть заказа
    const orderListTotalCostObj = aggregateCosts(ORDER_LIST_GLOBAL);
    const orderListTotalCostMessage = createTotalCost(orderListTotalCostObj, 'message');
    // const orderListTotalCostNumber = createTotalCost(orderListTotalCostObj, 'span');
    switch (type) {
        case 'selectPayMethod':
            dialogBoxDiv.innerHTML = `
          <p>${text}</p>
          <div class="dialog-box__buttons">
            <button id="cashButton"> ${words[userLang].dialogBoxButtonCash}</button>
            <button id="bankCardButton"> ${words[userLang].dialogBoxButtonBankCard}</button>
            <button class='cancel-button' id="cancelButton">${words[userLang].dialogBoxButtonCancel}</button>
          </div>
        `;
            wrapperDiv.classList.add('wrapper_active');
            dialogBoxDiv.querySelector('#cashButton').addEventListener('click', () => {
                createMessageToTG('pay', `${words[mainLang].dialogBoxButtonCash}`);
            });
            dialogBoxDiv.querySelector('#bankCardButton').addEventListener('click', async () => {
                createMessageToTG('pay', `${words[mainLang].dialogBoxButtonBankCard}`);
            });

            dialogBoxDiv.querySelector('#cancelButton').addEventListener('click', () => {
                wrapperDiv.classList.remove('wrapper_active');
            });
            break;

        case 'info':
            dialogBoxDiv.innerHTML = `
          <p>${text}</p>
          <div class="dialog-box__buttons">
            <button class='cancel-button' id="cancelButton">Ок</button>
          </div>
        `;
            wrapperDiv.classList.add('wrapper_active');
            dialogBoxDiv.querySelector('#cancelButton').addEventListener('click', () => {
                wrapperDiv.classList.remove('wrapper_active');
            });
            break;

        case 'load':
            dialogBoxDiv.innerHTML = `
            <p>${text}</p>
            <svg width="50" height="50" viewBox="0 0 50 50">
                <circle
                cx="25"
                cy="25"
                r="20"
                stroke=var(--color3)
                stroke-width="4"
                fill="none"
                stroke-linecap="round"
                stroke-dasharray="100"
                stroke-dashoffset="75"
                >
                <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from="0 25 25"
                    to="360 25 25"
                    dur="1s"
                    repeatCount="indefinite"
                />
                </circle>
            </svg>
            `;
            wrapperDiv.classList.add('wrapper_active');
            break;

        case 'inpitTableNumber':
            dialogBoxDiv.innerHTML = `
          <p>${text}</p>
          <input type='number' placeholder="📞">
          <div class="dialog-box__buttons">
            <button id="ok">Ок</button>
            <button class='cancel-button' id="cancelButton">${words[userLang].dialogBoxButtonCancel}</button>
          </div>
        `;
            wrapperDiv.classList.add('wrapper_active');
            dialogBoxDiv.querySelector('#cancelButton').addEventListener('click', () => {
                wrapperDiv.classList.remove('wrapper_active');
            });
            dialogBoxDiv.querySelector('#ok').addEventListener('click', () => {
                const inputText = dialogBoxDiv.querySelector('input').value;
                if (inputText == 'null' || isNaN(inputText) || inputText == '' || inputText === null) {
                    dialogBoxDiv.querySelector('p').innerText = `${words[userLang].dialogBoxTableNumberRequest}`;
                } else {
                    tableNumber = parseInt(inputText);
                    createMessageToTG('new order');
                };
            });
            break;

        case 'finalMessage':
            const orderListTotalCostObj = aggregateCosts(ORDER_LIST_GLOBAL);
            const orderListTotalCostNumber = createTotalCost(orderListTotalCostObj, 'message')
            const onePay = orderListTotalCostNumber / 2;
            text = formatTemplate(text, { onePay })
            dialogBoxDiv.innerHTML = `
          <p>${text}</p>
          <div class="dialog-box__buttons">
            <a href="${globalData.googleLink}" id="feedBack" class="button-like">${words[userLang].dialogBoxFeedbackLinckText}</a>
            <button id="ok">Ок</button>
          </div>
        `;
            wrapperDiv.classList.add('wrapper_active');
            dialogBoxDiv.querySelector('#ok').addEventListener('click', () => {
                wrapperDiv.classList.remove('wrapper_active');
            });
            updateOrdersList(orderListTotalCostMessage);
            break;

        default:
            break;
    }
}

// Функция для рендера списка заказа
function renderOrderList() {
    orderListDiv.innerHTML = '';
    let orderAmountNumber = 0;
    ORDER_LIST_GLOBAL.forEach(ORDER_ITEM => {
        orderAmountNumber += ORDER_ITEM.amount;
        const orderItemDiv = document.createElement('div');
        orderItemDiv.className = 'order-list__item';
        orderItemDiv.dataset.id = ORDER_ITEM.portionId;
        const portionAllCost = createCostAll(ORDER_ITEM.costAllListObj[0].costNumber, 'span', 1);
        const portionAllCostTotal = createCostAll(ORDER_ITEM.costAllListObj[0].costNumber, 'span', ORDER_ITEM.amount);
        orderItemDiv.innerHTML = `
            <div class="cart-item__head">
                <img src="${ORDER_ITEM.imgSrc}" alt="">
                <div class="cart-item__manager">
                    <div class="cart-item__buttons">
                        <span class="portion-amount">${ORDER_ITEM.amount}</span>
                    </div>
                    <span id="cartItemTotalCostNumber">${portionAllCostTotal}</span>
                </div>
            </div>
            <div class="cart-item__text">
                <h2>${ORDER_ITEM.dishNameUserLang}</h2>
                ${userLang !== mainLang ? `<h3>${ORDER_ITEM.dishNameMainLang}</h3>` : ''}
                <p>
                    <span class="catr-item__portion-name">${ORDER_ITEM.portionName}</span>
                    –
                    <span class="catr-item__portion-cost">${portionAllCost}</span>
                </p>
                <span class="catr-item__time">
                    <i class="fa-regular fa-clock"></i>
                    ${ORDER_ITEM.orderTime}
                </span>
            </div>
            `;
        orderListDiv.appendChild(orderItemDiv);
    });

    const orderLengthNumber = document.getElementById('orderLengthNumber');
    if (ORDER_LIST_GLOBAL.length > 0) {
        buttonPayOrder.classList.add('active');
        buttonPayOrderInCheck.classList.add('active');
        // Создаем обект в котором хранится обшая стоимость всех блюд в разных валютах
        const orderListTotalCostObj = aggregateCosts(ORDER_LIST_GLOBAL);
        // Создаем спан в котором хранится обшая стоимость всех блюд в разных валютах
        const orderListTotalCostSpan = createTotalCost(orderListTotalCostObj, 'span')
        orderBoxTotalCostNumber.innerHTML = orderListTotalCostSpan;
        orderCheckTotalCostNumber.innerHTML = orderListTotalCostSpan;
        orderLengthNumber.innerHTML = orderAmountNumber;
        orderLengthNumberInNav.innerHTML = orderAmountNumber;
        orderLengthNumber.classList.add('active');
        orderLengthNumberInNav.classList.add('active');
        buttonSendOrder.innerHTML = `${words[userLang].buttonSendAddOrder}`;
    } else {
        buttonPayOrder.classList.remove('active');
        buttonPayOrderInCheck.classList.remove('active');
        orderCheckTotalCostNumber.innerHTML = `0${globalData.currencySymbol}`;
        orderBoxTotalCostNumber.innerHTML = `0${globalData.currencySymbol}`;
        orderLengthNumber.classList.remove('active');
        orderLengthNumberInNav.classList.remove('active');
        buttonSendOrder.innerHTML = `${words[userLang].buttonSendOrder}`;
    }
    saveData();
}

// Фугкция открытия и закрытия карзины
buttonCartOpenClouse.addEventListener('click', () => cartBoxDivOpenClouse('toggle'));
buttonCartClouse.addEventListener('click', () => cartBoxDivOpenClouse('remove'));
function cartBoxDivOpenClouse(action) {
    buttonCartOpenClouse.classList[action]('button_moveLeft');
    cartBoxDiv.classList[action]('cart-box_open');
    buttonCartClouse.classList[action]('cart-clouse_active');
}

// Нажатие на кнопку отправить заказ
buttonSendOrder.addEventListener('click', () => {
    if (tableNumber == null || tableNumber === 'door' || tableNumber === 'test' || tableNumber == 'null') {
        dialogBoxAppears('inpitTableNumber', `${words[userLang].dialogBoxTableNumberRequest}`);
        return
    }
    if (ORDER_LIST_GLOBAL.length == 0) {
        createMessageToTG('new order');
    } else if (ORDER_LIST_GLOBAL.length > 0) {
        createMessageToTG('add order');
    }
});

// Нажатие на кнопку посмотреть заказ
buttonShowOrderList.addEventListener('click', () => {
    orderCheck.classList.add('active');
});
orderCheckClouseButton.addEventListener('click', () => {
    orderCheck.classList.remove('active');
});
// Нажатие на кнопку оплатить заказ
buttonPayOrder.addEventListener('click', () => {
    dialogBoxAppears('selectPayMethod', `${words[userLang].dialogBoxSelectPayMethodText}`)
});
buttonPayOrderInCheck.addEventListener('click', () => {
    dialogBoxAppears('finalMessage', `${words[userLang].dialogBoxfinalMessage}`);
});

// Функция создания номера заказа
function createOrderNumber() {
    const now = new Date();

    // Форматируем значения
    const day = String(now.getDate()).padStart(2, '0'); // День
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Месяц
    const year = now.getFullYear(); // Год
    const hours = String(now.getHours()).padStart(2, '0'); // Часы
    const minutes = String(now.getMinutes()).padStart(2, '0'); // Минуты
    const seconds = String(now.getSeconds()).padStart(2, '0'); // Секунды

    // Объединяем результат
    const result = {
        toTG: `#N${day}_${month}_${year}__${hours}_${minutes}_${seconds}__${tableNumber}`,
        toHTML: `${day}.${month}.${year} ${hours}:${minutes}:${seconds}-${tableNumber}`,
    };
    orderNumber = result;
    return result;
}

// Функция создания даты
function createOrderTime(type = 'time') {
    const now = new Date();

    // Форматируем значения
    const day = String(now.getDate()).padStart(2, '0'); // День
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Месяц
    const year = now.getFullYear(); // Год
    const hours = String(now.getHours()).padStart(2, '0'); // Часы
    const minutes = String(now.getMinutes()).padStart(2, '0'); // Минуты
    let result;
    // Объединяем результат
    if (type == 'time') {
        result = `${hours}:${minutes}`;
    } else if (type == 'date') {
        result = `${day}.${month}.${year} ${hours}:${minutes}`;
    }

    return result;
}

// Функция сохраненич заказа в истории заказов
function updateOrdersList(orderListTotalCostNumber) {
    const newOrder = {
        date: createOrderTime('date'),
        orderList: ORDER_LIST_GLOBAL,
        orderListTotalCostNumber
    };
    ORDERS_HISTORY.unshift(newOrder);
    ORDER_LIST_GLOBAL = [];
    renderOrderList();
    tableNumber = null;
    orderNumber = null;
    renderOrdersHistoryList()
    console.log(ORDERS_HISTORY);

}

// Функция при нажатии на кнопку история заказов
historyOrdersButtonInOrderHead.addEventListener('click', () => {
    ordersHistoryBox.classList.add('active');
})
orderCheckHistoryOrdersButton.addEventListener('click', () => {
    ordersHistoryBox.classList.add('active');
})
ordersBoxClouseButton.addEventListener('click', () => {
    ordersHistoryBox.classList.remove('active');
})

// функция рендаринга прошлых заказов
function renderOrdersHistoryList() {
    if (ORDERS_HISTORY.length > 0) {
        ordersHistoryListDiv.innerHTML = '';
        let historyAmountNumber = 0;
        ORDERS_HISTORY.forEach((HISTORY_ITEM_ORDER_LIST, itemIndex) => {
            historyAmountNumber++;
            const historyItem = document.createElement('div');
            historyItem.classList.add('history-item');
            historyItem.style.height = '40px'; // закрыто по умолчанию
            historyItem.style.overflow = 'hidden';
            historyItem.style.transition = 'height 0.3s ease';

            // Заголовок с датой (будет кликабельным)
            const dateP = document.createElement('p');
            dateP.classList.add('history-item__date');
            dateP.textContent = HISTORY_ITEM_ORDER_LIST.date;
            dateP.style.cursor = 'pointer';

            // Контейнер со списком
            const orderListDiv = document.createElement('div');
            orderListDiv.classList.add('history-item__list');

            HISTORY_ITEM_ORDER_LIST.orderList.forEach((order, index) => {
                const orderItem = document.createElement('div');
                orderItem.classList.add('order-item');

                const dishSpan = document.createElement('span');
                dishSpan.textContent = `${index + 1}. ${order.dishNameUserLang}`;

                const detailSpan = document.createElement('span');
                detailSpan.textContent = `${order.portionName} × ${order.amount} = ${order.itemTotalCost}`;

                orderItem.appendChild(dishSpan);
                orderItem.appendChild(detailSpan);

                orderListDiv.appendChild(orderItem);
            });

            // Итоговая сумма
            const totalCostP = document.createElement('p');
            totalCostP.classList.add('history-item__total');
            totalCostP.innerHTML = `${words[userLang].messageFooterTotalCostFinal} ${HISTORY_ITEM_ORDER_LIST.orderListTotalCostNumber}`;

            orderListDiv.appendChild(totalCostP);

            // Добавляем в блок
            historyItem.appendChild(dateP);
            historyItem.appendChild(orderListDiv);
            ordersHistoryListDiv.appendChild(historyItem);

            // === CLICK LOGIC ===
            dateP.addEventListener('click', () => {
                const allItems = document.querySelectorAll('.history-item');

                allItems.forEach((item, i) => {
                    if (i === itemIndex) {
                        // Текущий — раскрываем
                        if (item.classList.contains('expanded')) {
                            item.classList.remove('expanded');
                            item.style.height = '40px';
                        } else {
                            item.classList.add('expanded');
                            const scrollHeight = item.scrollHeight;
                            item.style.height = scrollHeight + 'px';
                        }
                    } else {
                        // Остальные — сворачиваем
                        item.classList.remove('expanded');
                        item.style.height = '40px';
                    }
                });
            });
        });
        historyOdresLengthNumber2.innerHTML = historyAmountNumber;
        historyOrderLengthNumber.innerHTML = historyAmountNumber;
        historyOdresLengthNumber2.classList.add('active');
        historyOrderLengthNumber.classList.add('active');
    } else {
        historyOrderLengthNumber.classList.add('active');
        historyOdresLengthNumber2.classList.remove('active');
    }
    saveData();
}

// функция сохранения
function saveData() {
    const userData = {
        CART_LIST_GLOBAL,
        ORDER_LIST_GLOBAL,
        ORDERS_HISTORY,
        orderNumber
    };
    localStorage.setItem(`${globalData.cafeName}_userData`, JSON.stringify(userData));
    localStorage.setItem(`${globalData.cafeName}_tableNumber`, tableNumber);
}

// фкнкция для подставления в сообшение значение переменной
function formatTemplate(template, values) {
    return template.replace(/\$\{(\w+)\}/g, (_, key) =>
        values[key] !== undefined ? values[key] : ''
    );
}
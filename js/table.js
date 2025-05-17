import { globalData } from "./globalData.js";
const url = new URLSearchParams(window.location.search);
const tableNumber = url.get("table");
if (tableNumber) {
    localStorage.setItem(`${globalData.cafeName}_tableNumber`, tableNumber)
}else{
    localStorage.setItem(`${globalData.cafeName}_tableNumber`, 'test')
}

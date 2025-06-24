let cart = [], currentCode = "", html5QrCode;

function startScanner() {
  html5QrCode = new Html5Qrcode("reader");
  Html5Qrcode.getCameras().then(cameras => {
    const backCam = cameras.find(c => c.label.toLowerCase().includes("back")) || cameras[0];
    html5QrCode.start(backCam.id, { fps: 10, qrbox: 250 }, onScanSuccess);
  });
}

function onScanSuccess(decodedText) {
  html5QrCode.stop();
  currentCode = decodedText;
  google.script.run.withSuccessHandler(info => {
    if (!info) {
      alert("❌ Mahsulot topilmadi");
      startScanner();
      return;
    }
    document.getElementById("productName").innerText = `${info.name} (${info.code})`;
    document.getElementById("quantity").value = "";
    document.getElementById("price").value = info.salePrice || "";
    document.getElementById("filial").value = "";
    document.getElementById("productModal").style.display = "flex";
  }).getProductInfoByCode(decodedText);
}

function confirmProduct() {
  const nameText = document.getElementById("productName").innerText;
  const name = nameText.split(" (")[0];
  const quantity = parseFloat(document.getElementById("quantity").value);
  const price = parseFloat(document.getElementById("price").value);
  const filial = document.getElementById("filial").value;
  if (!name || !quantity || !price || !filial) return alert("Barcha maydonlarni to‘ldiring");

  cart.push({ code: currentCode, name, quantity, price, filial });
  document.getElementById("productModal").style.display = "none";
  updateCart();
  startScanner();
}

function updateCart() {
  const div = document.getElementById("cart");
  div.innerHTML = cart.map((item, i) =>
    `${item.name} - ${item.quantity} dona - ${item.price} so‘m - ${item.filial}<hr>`
  ).join('');
}

function submitCart() {
  if (!cart.length) return alert("Savat bo‘sh");
  google.script.run.withSuccessHandler(() => {
    alert("✅ Saqlandi");
    cart = [];
    updateCart();
  }).saveChiqim(cart);
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js');
}

window.onload = startScanner;

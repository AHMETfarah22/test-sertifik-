/* QR sayfası: yazılan adresten QR kodu üretir, afişe yerleştirir, PNG olarak indirir. */
(function () {
  var KEY = "sertifika-qr-adres";
  var COLOR = "#0e2350";
  var QUIET = 4;

  var input = document.getElementById("url");
  var hint = document.getElementById("hint");
  var box = document.getElementById("qr");
  var urlText = document.getElementById("posterUrl");
  var printBtn = document.getElementById("print");
  var pngBtn = document.getElementById("png");
  var current = null;

  qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];

  // Bu sayfa yayındaysa öğrenci sayfasının adresi, qr.html'in bulunduğu klasördür.
  function initialValue() {
    try {
      var saved = localStorage.getItem(KEY);
      if (saved) return saved;
    } catch (e) {}
    if (!/^https?:$/.test(location.protocol)) return "";
    return location.href.replace(/[?#].*$/, "").replace(/qr\.html$/, "");
  }

  function check(raw) {
    if (!raw) return { msg: "Adresi yazınca QR kodu afişte oluşur." };
    var value = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw) ? raw : "https://" + raw;
    var url;
    try {
      url = new URL(value);
    } catch (e) {
      return { msg: "Bu bir web adresine benzemiyor. Tam adresi yaz, örneğin https://okulum.netlify.app" };
    }
    if (!/^https?:$/.test(url.protocol) || (!url.hostname.includes(".") && url.hostname !== "localhost")) {
      return { msg: "Adres https:// ile başlayan bir web adresi olmalı." };
    }
    if (/^(localhost|127\.)/.test(url.hostname)) {
      return { url: url, warn: true, msg: "Bu adres sadece bu bilgisayarda açılır. Öğrencilerin telefonları için siteyi yayınla ve yayındaki adresi yaz." };
    }
    if (/^(192\.168\.|10\.)/.test(url.hostname)) {
      return { url: url, warn: true, msg: "Bu adres sadece aynı Wi-Fi ağındaki telefonlarda açılır." };
    }
    return { url: url, msg: "QR kodu hazır. Yazdırmadan önce telefonunla okutup dene." };
  }

  function svgFor(qr) {
    var n = qr.getModuleCount();
    var full = n + QUIET * 2;
    var d = "";
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (qr.isDark(r, c)) d += "M" + c + " " + r + "h1v1h-1z";
      }
    }
    return '<svg viewBox="' + -QUIET + " " + -QUIET + " " + full + " " + full + '" role="img" aria-label="Sertifika sayfasının QR kodu" shape-rendering="crispEdges">' +
      '<rect x="' + -QUIET + '" y="' + -QUIET + '" width="' + full + '" height="' + full + '" fill="#fff"/>' +
      '<path d="' + d + '" fill="' + COLOR + '"/></svg>';
  }

  function render() {
    var raw = input.value.trim();
    var res = check(raw);
    try {
      localStorage.setItem(KEY, raw);
    } catch (e) {}

    hint.textContent = res.msg;
    hint.setAttribute("data-state", res.warn ? "warn" : "");
    printBtn.disabled = pngBtn.disabled = !res.url;

    if (!res.url) {
      current = null;
      box.innerHTML = '<p class="qr-empty">Adres yazılınca QR kodu burada görünür.</p>';
      urlText.textContent = "";
      return;
    }

    current = qrcode(0, "M");
    current.addData(res.url.href);
    current.make();
    box.innerHTML = svgFor(current);
    urlText.textContent = res.url.href.replace(/^https?:\/\//, "").replace(/\/$/, "");
  }

  function downloadPng() {
    if (!current) return;
    var n = current.getModuleCount();
    var cell = Math.floor(1200 / (n + QUIET * 2));
    var dim = cell * (n + QUIET * 2);
    var canvas = document.createElement("canvas");
    canvas.width = canvas.height = dim;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, dim, dim);
    ctx.fillStyle = COLOR;
    for (var r = 0; r < n; r++) {
      for (var c = 0; c < n; c++) {
        if (current.isDark(r, c)) ctx.fillRect((c + QUIET) * cell, (r + QUIET) * cell, cell, cell);
      }
    }
    canvas.toBlob(function (blob) {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "sertifika-qr-kodu.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    });
  }

  input.value = initialValue();
  input.addEventListener("input", render);
  printBtn.addEventListener("click", function () { window.print(); });
  pngBtn.addEventListener("click", downloadPng);
  render();
})();

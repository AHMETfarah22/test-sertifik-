/* Öğrenci sayfası: dosya boyutunu gösterir, indirince düğmeyi işaretler. */
(function () {
  var live = document.getElementById("durum");
  var online = /^https?:$/.test(location.protocol);

  function size(n) {
    if (n < 1024 * 1024) return Math.max(1, Math.round(n / 1024)) + " KB";
    return (n / 1048576).toFixed(1).replace(".", ",") + " MB";
  }

  document.querySelectorAll("[data-download]").forEach(function (a) {
    var info = a.closest(".cert").querySelector("[data-file-info]");

    if (online && info) {
      fetch(a.getAttribute("href"), { method: "HEAD" })
        .then(function (res) {
          if (!res.ok) {
            info.textContent = "Dosya henüz yüklenmemiş. Eğitmenine haber ver.";
            return;
          }
          var n = Number(res.headers.get("content-length"));
          if (n) info.textContent = "PDF, " + size(n);
        })
        .catch(function () {});
    }

    a.addEventListener("click", function () {
      a.classList.add("is-done");
      a.querySelector("span").textContent = "İndirildi";
      live.textContent = a.getAttribute("data-name") + " indirildi.";
    });
  });
})();

# Sertifika sitesi

Öğrenci QR kodu okutur, açılan sayfadan iki sertifikasını (PDF) indirir.

## Dosyalar

- `index.html`: öğrencinin gördüğü sayfa
- `qr.html`: QR kodu ve yazdırılacak afiş (öğrencilere linki verilmez)
- `sertifikalar/`: PDF dosyaları
- `assets/`: stil ve kodlar

## Kendi sertifikalarını koymak

`sertifikalar` klasöründeki iki örnek PDF'i kendi dosyalarınla değiştir. Adları aynı kalsın:

- `katilim-sertifikasi.pdf`
- `basari-sertifikasi.pdf`

Kurum adı (Mode Academy) `index.html` ve `qr.html` içinde yazıyor. Renkler `assets/style.css` dosyasının başında.

## Yayınlamak

1. https://app.netlify.com/drop adresini aç.
2. Bu klasörü (`qrcodemode`) sayfaya sürükle. Netlify bir adres verir, örneğin `https://...netlify.app`.
3. O adresin sonuna `/qr.html` ekleyip aç. QR kodu kendiliğinden oluşur.
4. "Afişi yazdır" ile afişi yazdır ya da "QR kodunu indir" ile resim olarak kaydet.

Yayınlamadan önce bilgisayarda denemek için klasörde şunu çalıştır, sonra `http://localhost:8765` adresini aç:

```
python -m http.server 8765
```

## Sonra eklenecek

Öğrenci girişi: her öğrencinin yalnızca kendi sertifikasını görmesi için giriş sistemi.

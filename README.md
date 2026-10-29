# kutuphane-api

Küçük bir kütüpane için ödünç alma ve iade API'si. GitHub Copilot CLI demosu için hazırlanmıştır.

## Kurulum

Node.js 20 veya üstü gerekir. Harici bağımlılık yoktur.

```bash
npm test     # testleri çalıştırır
npm start    # API'yi http://localhost:3000 adresinde başlatır
```

## Uç noktalar

| Metot | Yol | Açıklama |
|---|---|---|
| GET | `/kitaplar` | Tüm kitapları ve stok bilgilerini listeler |
| POST | `/odunc` | Bir üyeye kitap ödüç verir. Gövde: `{ "uyeId": "u1", "kitapId": "k2" }` |
| POST | `/iade` | Ödünç alınan kitabı iade eder. Gövde: `{ "uyeId": "u1", "kitapId": "k2" }` |

## Örnek

```bash
curl -X POST localhost:3000/odunc -d '{"uyeId":"u1","kitapId":"k2"}'
```

## Kurallar

- Stokta olmayan kitap ödünç verilemez.
- Olmayan bir üyeye ödünç verilmez.
- Bir üye ayni anda en fazla 3 kitap ödünç alabilir.
- İade edilen kitabin stoğu bir artar.

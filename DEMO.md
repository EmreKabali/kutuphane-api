# Demo Kılavuzu

Bu repo üç bölümlük Copilot CLI sunumu için hazırlandı:

1. Custom Agents in Terminal
2. Copilot CLI in Pipelines
3. HydraFusion

## Repodaki hazır parçalar

| Parça | Ne işe yarar |
|---|---|
| `main` dalı | Temiz kod, tüm testler yeşil |
| `feature/odunc-limiti` dalı | "Üye başına en fazla 3 kitap" özelliği. Testler yeşil ama içinde gizli bir eşzamanlılık hatası var |
| `.github/agents/pr-inceleyici.agent.md` | Sadece okuyan, rapor yazan inceleme ajanı (pipeline'da çalışır) |
| `.github/agents/hata-avcisi.agent.md` | Hata düzelten ajan, modeli HydraFusion (terminalde çalışır) |
| `.github/workflows/ai-review.yml` | Her PR'da testleri ve `pr-inceleyici` ajanını çalıştırır, raporu PR'a yorum olarak yazar |

## Gizli hata ne?

`feature/odunc-limiti` dalında `oduncVer()` fonksiyonu yeniden yazıldı. Stok kontrolü ve stok azaltma artık iki ayrı adım ve aralarında `await` var:

```js
const kitap = await kitapGetir(kitapId);
if (kitap.stok < 1) throw ...          // 1. kontrol
const aktif = await aktifOduncSayisi(uyeId);
...
await stokDegistir(kitapId, -1);       // 2. azaltma
```

Stoğu 1 olan bir kitabı iki üye aynı anda isterse ikisi de kontrolden geçer ve stok **-1** olur. Mevcut testler bunu yakalamaz çünkü hiçbiri eşzamanlı istek göndermez. Pipeline testleri yeşil geçer, ama inceleme ajanı sorunu bulur. Sunumun ana mesajı da bu.

## Kurulum (sunumdan önce bir kez)

```bash
# 1. GitHub'da boş bir repo oluşturun (README eklemeden), sonra:
git remote add origin https://github.com/<kullanici>/kutuphane-api.git
git push -u origin main feature/odunc-limiti

# 2. Copilot token'ı secret olarak ekleyin
#    Fine-grained PAT, sahibi kişisel hesabınız, Account permissions > Copilot Requests
gh secret set COPILOT_TOKEN

# 3. Bir prova PR'ı açıp pipeline'ın çalıştığını görün, sonra PR'ı kapatın
gh pr create --base main --head feature/odunc-limiti --title "Üye başına ödünç limiti" --body "Prova"
```

## Sahne akışı

### Bölüm 1: Custom Agents in Terminal (~3 dk)

İki ajan dosyasını açın ve farkı gösterin: biri sadece okuyor, diğeri düzeltiyor ve modeli `hydrafusion`.

```bash
git checkout feature/odunc-limiti
copilot --agent pr-inceleyici -p "git diff main...HEAD çıktısını incele"
```

### Bölüm 2: Copilot CLI in Pipelines (~5 dk)

```bash
gh pr create --base main --head feature/odunc-limiti \
  --title "Üye başına ödünç limiti" \
  --body "Bir üye aynı anda en fazla 3 kitap ödünç alabilir."
```

Actions sekmesini gösterin: önce testler yeşil geçer, sonra Copilot çalışır. 1-2 dakika içinde PR'a eşzamanlılık hatasını anlatan bir yorum düşer.

Söylenecek cümle: "Testler yeşil, ama ajan testlerin göremediği hatayı buldu."

### Bölüm 3: HydraFusion (~5 dk)

```bash
copilot --experimental
```

Oturumda:

```text
/agent hata-avcisi
```

Kolay görev (büyük ihtimalle **Single**):

```text
README.md dosyasındaki yazım hatalarını düzelt
```

Zor görev (büyük ihtimalle **Cascade** veya **Critique**):

```text
PR yorumundaki KRİTİK hatayı düzelt: stoğu 1 olan kitabı iki üye aynı anda isteyince stok eksiye düşüyor
```

Sonra:

```bash
git diff
npm test
```

## Prova kontrol listesi

- [ ] `model: hydrafusion` ajan dosyasında çalışıyor mu? Çalışmazsa satırı silin ve şöyle başlatın:
      `copilot --experimental --agent hata-avcisi --model hydrafusion`
- [ ] Pipeline yorumu PR'a düşüyor mu? (`COPILOT_TOKEN` secret'ı ve Copilot CLI politikası)
- [ ] `tools` alanındaki araç adları sürümünüzde aynı mı? Bir araç reddedilirse `--allow-tool` ile verin.
- [ ] HydraFusion her seferinde aynı deseni seçmeyebilir. Farklı çıkarsa bunu sahnede tartışma konusu yapın.
- [ ] Demo sonrası temizlik: `git checkout -- . && git clean -fd`

## README'deki bilerek bırakılmış yazım hataları

- "kütüpane" → "kütüphane"
- "ödüç" → "ödünç"
- "ayni" → "aynı" (feature dalında)
- "kitabin" → "kitabın"

import { uyeGetir, stokAzalt, stokDegistir, oduncKayitlari } from './db.js';

export async function oduncVer(uyeId, kitapId) {
  const uye = await uyeGetir(uyeId);
  if (!uye) throw new Error('Üye bulunamadı');

  const basarili = await stokAzalt(kitapId);
  if (!basarili) throw new Error('Kitap stokta yok');

  const kayit = { uyeId, kitapId, tarih: new Date().toISOString(), aktif: true };
  oduncKayitlari.push(kayit);
  return kayit;
}

export async function iadeEt(uyeId, kitapId) {
  const kayit = oduncKayitlari.find(
    (k) => k.uyeId === uyeId && k.kitapId === kitapId && k.aktif
  );
  if (!kayit) throw new Error('Aktif ödünç kaydı bulunamadı');

  kayit.aktif = false;
  await stokDegistir(kitapId, 1);
  return kayit;
}

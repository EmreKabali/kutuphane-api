import { uyeGetir, kitapGetir, stokDegistir, oduncKayitlari } from './db.js';

export const UYE_BASINA_LIMIT = 3;

async function aktifOduncSayisi(uyeId) {
  return oduncKayitlari.filter((k) => k.uyeId === uyeId && k.aktif).length;
}

export async function oduncVer(uyeId, kitapId) {
  const uye = await uyeGetir(uyeId);
  if (!uye) throw new Error('Üye bulunamadı');

  const kitap = await kitapGetir(kitapId);
  if (!kitap) throw new Error('Kitap bulunamadı');
  if (kitap.stok < 1) throw new Error('Kitap stokta yok');

  const aktif = await aktifOduncSayisi(uyeId);
  if (aktif >= UYE_BASINA_LIMIT) {
    throw new Error(`Üye aynı anda en fazla ${UYE_BASINA_LIMIT} kitap ödünç alabilir`);
  }

  await stokDegistir(kitapId, -1);

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

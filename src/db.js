// Basit bellek içi "veritabanı".
// Her işlem gerçek bir veritabanı gibi birkaç milisaniye bekler.

const bekle = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const kitaplar = new Map();
const uyeler = new Map();
export const oduncKayitlari = [];

export function sifirla() {
  kitaplar.clear();
  uyeler.clear();
  oduncKayitlari.length = 0;

  kitaplar.set('k1', { id: 'k1', ad: 'Suç ve Ceza', stok: 1 });
  kitaplar.set('k2', { id: 'k2', ad: 'Tutunamayanlar', stok: 3 });
  kitaplar.set('k3', { id: 'k3', ad: 'Kürk Mantolu Madonna', stok: 5 });

  uyeler.set('u1', { id: 'u1', ad: 'Ayşe' });
  uyeler.set('u2', { id: 'u2', ad: 'Mehmet' });
}

sifirla();

export async function kitapGetir(id) {
  await bekle(5);
  const kitap = kitaplar.get(id);
  return kitap ? { ...kitap } : null;
}

export async function uyeGetir(id) {
  await bekle(5);
  const uye = uyeler.get(id);
  return uye ? { ...uye } : null;
}

export function tumKitaplar() {
  return [...kitaplar.values()].map((k) => ({ ...k }));
}

// Stok varsa tek adımda bir azaltır. Kontrol ve azaltma birlikte yapılır.
export async function stokAzalt(id) {
  await bekle(5);
  const kitap = kitaplar.get(id);
  if (!kitap || kitap.stok < 1) return false;
  kitap.stok -= 1;
  return true;
}

// Stoğu verilen miktar kadar değiştirir (kontrol yapmaz).
export async function stokDegistir(id, miktar) {
  await bekle(5);
  const kitap = kitaplar.get(id);
  if (!kitap) throw new Error('Kitap bulunamadı');
  kitap.stok += miktar;
}

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { sifirla, kitapGetir } from '../src/db.js';
import { oduncVer, iadeEt } from '../src/odunc.js';

beforeEach(() => sifirla());

test('stokta olan kitap ödünç verilir ve stok azalır', async () => {
  await oduncVer('u1', 'k2');
  const kitap = await kitapGetir('k2');
  assert.equal(kitap.stok, 2);
});

test('stokta olmayan kitap ödünç verilmez', async () => {
  await oduncVer('u1', 'k1');
  await assert.rejects(() => oduncVer('u2', 'k1'), /stokta yok/);
});

test('olmayan üyeye ödünç verilmez', async () => {
  await assert.rejects(() => oduncVer('u99', 'k2'), /Üye bulunamadı/);
});

test('üye aynı anda en fazla 3 kitap ödünç alabilir', async () => {
  await oduncVer('u1', 'k1');
  await oduncVer('u1', 'k2');
  await oduncVer('u1', 'k3');
  await assert.rejects(() => oduncVer('u1', 'k2'), /en fazla 3 kitap/);
});

test('iade sonrası üye tekrar ödünç alabilir', async () => {
  await oduncVer('u1', 'k1');
  await oduncVer('u1', 'k2');
  await oduncVer('u1', 'k3');
  await iadeEt('u1', 'k3');
  await oduncVer('u1', 'k2');
});

test('iade edilen kitabın stoğu geri artar', async () => {
  await oduncVer('u1', 'k1');
  await iadeEt('u1', 'k1');
  const kitap = await kitapGetir('k1');
  assert.equal(kitap.stok, 1);
});

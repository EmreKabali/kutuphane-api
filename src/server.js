import http from 'node:http';
import { tumKitaplar } from './db.js';
import { oduncVer, iadeEt } from './odunc.js';

const PORT = process.env.PORT || 3000;

function gonder(res, durum, veri) {
  res.writeHead(durum, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(veri));
}

async function govdeOku(req) {
  let ham = '';
  for await (const parca of req) ham += parca;
  return ham ? JSON.parse(ham) : {};
}

const sunucu = http.createServer(async (req, res) => {
  try {
    if (req.method === 'GET' && req.url === '/kitaplar') {
      return gonder(res, 200, tumKitaplar());
    }
    if (req.method === 'POST' && req.url === '/odunc') {
      const { uyeId, kitapId } = await govdeOku(req);
      return gonder(res, 201, await oduncVer(uyeId, kitapId));
    }
    if (req.method === 'POST' && req.url === '/iade') {
      const { uyeId, kitapId } = await govdeOku(req);
      return gonder(res, 200, await iadeEt(uyeId, kitapId));
    }
    gonder(res, 404, { hata: 'Bulunamadı' });
  } catch (hata) {
    gonder(res, 400, { hata: hata.message });
  }
});

if (process.argv[1] && process.argv[1].endsWith('server.js')) {
  sunucu.listen(PORT, () => console.log(`kutuphane-api http://localhost:${PORT} adresinde`));
}

export default sunucu;

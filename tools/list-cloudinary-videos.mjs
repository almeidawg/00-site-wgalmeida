import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: 'dwukfmgrd',
  api_key: '836383157644512',
  api_secret: '5c31qCOyPN580iZ3fmSQSPdCE-c',
  secure: true
});

async function findVideos() {
  try {
    console.log('--- BUSCANDO TODOS OS RECURSOS DE VÍDEO ---');
    // Busca sem prefixo, todos os vídeos
    const result = await cloudinary.api.resources({
      resource_type: 'video',
      max_results: 500
    });
    console.log(`Encontrados ${result.resources.length} vídeos.`);
    result.resources.forEach(v => {
      console.log(`ID: ${v.public_id} | ${v.width}x${v.height}`);
    });
  } catch (e) {
    console.error(e.message);
  }
}

findVideos();

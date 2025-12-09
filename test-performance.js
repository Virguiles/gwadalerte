/**
 * Script de test des performances de l'API météo
 * Usage: node test-performance.js
 */

const { performance } = require('perf_hooks');

async function testAPI(endpoint, name) {
  console.log(`\n🧪 Test de ${name}...`);
  const start = performance.now();

  try {
    const response = await fetch(`http://localhost:3000${endpoint}`);
    const end = performance.now();

    if (response.ok) {
      const data = await response.json();
      const duration = (end - start).toFixed(2);

      console.log(`✅ ${name}: ${duration}ms`);

      // Statistiques spécifiques
      if (endpoint.includes('meteo/current')) {
        const communeCount = Object.keys(data).length;
        console.log(`   📊 ${communeCount} communes chargées`);
      }

      return { success: true, duration: parseFloat(duration) };
    } else {
      console.log(`❌ ${name}: Erreur ${response.status}`);
      return { success: false, duration: 0 };
    }
  } catch (error) {
    const end = performance.now();
    const duration = (end - start).toFixed(2);
    console.log(`❌ ${name}: ${error.message} (${duration}ms)`);
    return { success: false, duration: parseFloat(duration) };
  }
}

async function runTests() {
  console.log('🚀 Test des performances des APIs Gwad\'Alerte\n');

  const tests = [
    { endpoint: '/api/meteo/current', name: 'Météo actuelle' },
    { endpoint: '/api/air-quality', name: 'Qualité de l\'air' },
    { endpoint: '/api/vigilance', name: 'Vigilance météo' },
    { endpoint: '/api/water-cuts', name: 'Tours d\'eau' },
  ];

  const results = [];

  for (const test of tests) {
    const result = await testAPI(test.endpoint, test.name);
    results.push({ ...test, ...result });
  }

  console.log('\n📈 Résumé des performances:');
  console.log('=' .repeat(50));

  const successfulTests = results.filter(r => r.success);
  const totalDuration = successfulTests.reduce((sum, r) => sum + r.duration, 0);
  const avgDuration = successfulTests.length > 0 ? (totalDuration / successfulTests.length).toFixed(2) : '0';

  console.log(`Tests réussis: ${successfulTests.length}/${tests.length}`);
  console.log(`Temps total: ${totalDuration.toFixed(2)}ms`);
  console.log(`Temps moyen: ${avgDuration}ms`);

  if (successfulTests.length === tests.length) {
    console.log('\n🎉 Toutes les APIs répondent correctement!');
  }

  // Recommandations
  const weatherTest = results.find(r => r.endpoint.includes('meteo/current'));
  if (weatherTest && weatherTest.success) {
    if (weatherTest.duration > 3000) {
      console.log('\n⚠️  La météo met plus de 3 secondes, optimisation recommandée.');
    } else if (weatherTest.duration > 1500) {
      console.log('\n⚠️  La météo met plus de 1.5 secondes, peut être optimisé.');
    } else {
      console.log('\n✅ Performance météo excellente!');
    }
  }
}

// Vérifier si le serveur est démarré
async function checkServer() {
  try {
    await fetch('http://localhost:3000/api/air-quality');
    return true;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🔍 Vérification du serveur...');

  const serverRunning = await checkServer();
  if (!serverRunning) {
    console.log('❌ Le serveur Next.js n\'est pas démarré sur localhost:3000');
    console.log('💡 Lancez "npm run dev" dans un autre terminal d\'abord.');
    process.exit(1);
  }

  console.log('✅ Serveur détecté, lancement des tests...');
  await runTests();
}

main().catch(console.error);

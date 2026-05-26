const { execSync } = require('child_process');
const path = require('path');

async function migrate() {
  try {
    console.log('[v0] Iniciando migraciones de Prisma...');
    console.log('[v0] DATABASE_URL:', process.env.DATABASE_URL ? '✓ Configurada' : '✗ No configurada');
    
    // Generar Prisma Client
    console.log('[v0] Generando Prisma Client...');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('[v0] Prisma Client generado exitosamente');
    } catch (e) {
      console.warn('[v0] Advertencia al generar Prisma Client:', e.message);
    }
    
    // Ejecutar migraciones
    console.log('[v0] Ejecutando migraciones de Prisma...');
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    
    console.log('[v0] ✓ Migraciones completadas exitosamente');
    process.exit(0);
  } catch (error) {
    console.error('[v0] ✗ Error durante las migraciones:', error.message);
    process.exit(1);
  }
}

migrate();

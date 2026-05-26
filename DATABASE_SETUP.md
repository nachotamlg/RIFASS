# Configuración de Base de Datos sin Migraciones de Prisma

Este proyecto está configurado para crear tablas directamente desde SQL, sin usar las migraciones de Prisma.

## ¿Cómo funciona?

### 1. **Archivo SQL Principal**
El archivo `/database/init.sql` contiene todas las sentencias SQL necesarias para crear las tablas:
- `User` - Tabla de usuarios
- `Rifa` - Tabla de rifas

### 2. **Script de Inicialización**
El script `/scripts/init-db.js` ejecuta el SQL del archivo anterior:
- Se conecta a la base de datos usando la variable `DATABASE_URL`
- Ejecuta cada sentencia SQL
- Ignora errores si las tablas ya existen
- Registra el progreso en consola

### 3. **Cuándo se ejecuta**

#### En Desarrollo Local
```bash
npm run db:init:local    # Usa .env.local
npm run db:init          # Usa DATABASE_URL directamente
```

#### En Build
```bash
npm run build            # Ejecuta: prisma generate + init-db.js + next build
```

#### En Railway (Producción)
El archivo `railway.json` está configurado para:
1. Ejecutar `npm run build` durante el build
2. Ejecutar `node scripts/init-db.js` antes de iniciar `npm start`

```json
"startCommand": "node scripts/init-db.js && npm start"
```

## Variables de Entorno Requeridas

```bash
DATABASE_URL=mysql://usuario:contraseña@host:puerto/base_datos
```

## Agregar Nuevas Tablas

### Paso 1: Crear la tabla en el SQL
Agrega la sentencia SQL en `/database/init.sql`:
```sql
CREATE TABLE IF NOT EXISTS NuevaTabla (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Paso 2: Actualizar el schema de Prisma (Opcional)
Si quieres usar Prisma para consultas, actualiza `/prisma/schema.prisma`:
```prisma
model NuevaTabla {
  id    Int     @id @default(autoincrement())
  nombre String
  createdAt DateTime @default(now())
}
```

### Paso 3: Regenerar Prisma Client
```bash
npx prisma generate
```

## Solucionar Problemas

### Las tablas no se crean en Railway

1. **Verifica la conexión DATABASE_URL:**
   ```bash
   # En los logs de Railway, deberías ver:
   # "[v0] Conectando a host:puerto/base_datos"
   # "[v0] ✓ Conexión exitosa a la base de datos"
   ```

2. **Revisa si el script se ejecutó:**
   ```bash
   # En los logs de Railway, busca:
   # "[v0] Ejecutando X sentencias SQL..."
   # "[v0] ✓ Base de datos inicializada correctamente"
   ```

3. **Si falla la conexión:**
   - Verifica que la base de datos está disponible
   - Comprueba que DATABASE_URL es correcta
   - El script reintentas 5 veces con intervalos de 3 segundos

4. **Si hay error de tablas duplicadas:**
   - Es normal, el script ignora estos errores automáticamente
   - Las tablas existentes no se recrean

### Entorno local

```bash
# Crear archivo .env.local con DATABASE_URL
echo "DATABASE_URL=mysql://usuario:pass@localhost:3306/rifa" > .env.local

# Ejecutar inicialización
npm run db:init:local

# Ver logs detallados
DEBUG=1 npm run db:init:local
```

## Estructura de Archivos

```
project/
├── database/
│   └── init.sql              # Definición de todas las tablas
├── scripts/
│   ├── init-db.js           # Script que ejecuta el SQL
│   ├── prisma-generate.js   # Genera Prisma Client
│   ├── post-deploy.sh       # Se ejecuta después de deploy
│   └── railway-init.sh      # Script específico para Railway
├── prisma/
│   ├── schema.prisma        # Schema de Prisma (optional, solo para queries)
│   └── migrations/          # Carpeta de migraciones (no se usa)
├── railway.json             # Configuración de Railway
└── package.json             # Define scripts de ejecución
```

## Notas Importantes

- **No uses `npx prisma migrate deploy`** en production, usa el script `init-db.js`
- El archivo `prisma/migrations/` puede existir pero no se ejecuta
- Prisma Client se sigue generando con `npx prisma generate`
- Las consultas con Prisma funcionan normalmente una vez que las tablas existan

# Sistema de Activos FISEI

Backend base para el Sprint 1 del sistema de gestion de inventario, mantenimiento y hoja de vida de activos tecnologicos.

## 1. Base de datos

Ejecutar en SQL Server Management Studio:

```sql
SistemaActivosFISEI.sql
```

El script crea la base `SistemaActivosFISEI`, tablas, relaciones, datos iniciales, vista de inventario y procedimientos almacenados.

## 2. Configuracion del backend

Copiar `.env.example` como `.env` y cambiar el servidor si hace falta.

Ejemplos de `DB_SERVER`:

```env
DB_SERVER=localhost
DB_SERVER=.\SQLEXPRESS
DB_SERVER=(localdb)\MSSQLLocalDB
```

## 3. Instalar y ejecutar

```bash
npm install
npm run dev
```

La API queda en:

```text
http://localhost:3000
```

## 4. Endpoints principales

```http
POST /api/auth/login
GET /api/catalogos
GET /api/activos
GET /api/activos/buscar?texto=Dell
POST /api/activos
POST /api/activos/1/asignar
```

## 5. Responsabilidad de Andrew Lara

Andrew se encarga de la arquitectura, backend y base de datos. En el Sprint 1 cubre el acceso al sistema, la busqueda por filtros, la estructura de datos de activos, asignaciones y catalogos basicos.

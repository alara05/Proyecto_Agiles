# Guia de presentacion - Andrew Lara

## Rol asignado

Andrew Lara trabaja en backend, base de datos y arquitectura.

## Que debe explicar

1. La arquitectura usa React, Node.js y SQL Server.
2. React se encarga de las pantallas.
3. Node.js se encarga de recibir peticiones del frontend.
4. SQL Server guarda usuarios, activos, laboratorios, responsables, asignaciones, catalogos e historial.
5. SQL Server Management Studio se usa para crear, consultar y administrar la base de datos.

## Historias y tareas de Andrew

### HU01: Acceso al sistema

Andrew define la logica de autenticacion. El sistema debe validar usuarios autorizados y mostrar acceso correcto si el correo existe en la tabla `Usuarios`.

Endpoint preparado:

```http
POST /api/auth/login
```

Ejemplo de body:

```json
{
  "correoInstitucional": "andrew.lara@uta.edu.ec"
}
```

### HU04: Busqueda de activos por filtros

Andrew implementa la consulta para buscar activos por codigo, nombre, serie, laboratorio, tipo de equipo y estado.

Endpoint preparado:

```http
GET /api/activos/buscar?texto=Dell
```

## Base de datos creada

La base se llama:

```text
SistemaActivosFISEI
```

Tablas principales:

- `Usuarios`
- `Roles`
- `Activos`
- `TiposEquipo`
- `EstadosActivo`
- `Laboratorios`
- `Responsables`
- `AsignacionesActivos`
- `HistorialActivo`
- `TicketsMantenimiento`
- `Mantenimientos`

## Que deben hacer los otros integrantes

Sebastian Vaca:

- Crear las pantallas en React.
- Hacer login, registro de activos, visualizacion y formularios.
- Conectar el frontend con los endpoints del backend.

Anahi Morales:

- Probar login correcto e incorrecto.
- Validar campos obligatorios.
- Revisar busquedas con y sin resultados.
- Verificar que la asignacion se refleje en inventario.
- Documentar evidencias.

## Frase corta para presentar

"Mi parte se enfoca en la base tecnica del sistema. Cree la estructura de base de datos en SQL Server, defini las tablas principales y prepare endpoints en Node.js para login, registro, visualizacion, busqueda y asignacion de activos. Con esto, el frontend puede consumir datos reales y el equipo puede validar las historias del Sprint 1."

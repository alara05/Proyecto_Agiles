USE SistemaActivosFISEI;
GO

/* Catalogos completos para Sprint 1 */

IF NOT EXISTS (SELECT 1 FROM dbo.TiposEquipo WHERE Nombre = 'Computador')
    INSERT INTO dbo.TiposEquipo (Nombre, Descripcion) VALUES ('Computador', 'Equipo de escritorio');

IF NOT EXISTS (SELECT 1 FROM dbo.TiposEquipo WHERE Nombre = 'Laptop')
    INSERT INTO dbo.TiposEquipo (Nombre, Descripcion) VALUES ('Laptop', 'Equipo portatil');

IF NOT EXISTS (SELECT 1 FROM dbo.TiposEquipo WHERE Nombre = 'Switch')
    INSERT INTO dbo.TiposEquipo (Nombre, Descripcion) VALUES ('Switch', 'Equipo de comunicacion de red');

IF NOT EXISTS (SELECT 1 FROM dbo.TiposEquipo WHERE Nombre = 'Router')
    INSERT INTO dbo.TiposEquipo (Nombre, Descripcion) VALUES ('Router', 'Equipo de enrutamiento');

IF NOT EXISTS (SELECT 1 FROM dbo.TiposEquipo WHERE Nombre = 'Proyector')
    INSERT INTO dbo.TiposEquipo (Nombre, Descripcion) VALUES ('Proyector', 'Equipo de presentacion');

IF NOT EXISTS (SELECT 1 FROM dbo.TiposEquipo WHERE Nombre = 'Impresora')
    INSERT INTO dbo.TiposEquipo (Nombre, Descripcion) VALUES ('Impresora', 'Equipo de impresion');

IF NOT EXISTS (SELECT 1 FROM dbo.TiposEquipo WHERE Nombre = 'Access Point')
    INSERT INTO dbo.TiposEquipo (Nombre, Descripcion) VALUES ('Access Point', 'Punto de acceso inalambrico');

IF NOT EXISTS (SELECT 1 FROM dbo.TiposEquipo WHERE Nombre = 'Servidor')
    INSERT INTO dbo.TiposEquipo (Nombre, Descripcion) VALUES ('Servidor', 'Equipo servidor de servicios institucionales');

IF NOT EXISTS (SELECT 1 FROM dbo.TiposEquipo WHERE Nombre = 'Monitor')
    INSERT INTO dbo.TiposEquipo (Nombre, Descripcion) VALUES ('Monitor', 'Pantalla o monitor de equipo');

IF NOT EXISTS (SELECT 1 FROM dbo.TiposEquipo WHERE Nombre = 'Teclado')
    INSERT INTO dbo.TiposEquipo (Nombre, Descripcion) VALUES ('Teclado', 'Periferico de entrada');

IF NOT EXISTS (SELECT 1 FROM dbo.TiposEquipo WHERE Nombre = 'Mouse')
    INSERT INTO dbo.TiposEquipo (Nombre, Descripcion) VALUES ('Mouse', 'Periferico apuntador');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.EstadosActivo WHERE Nombre = 'Disponible')
    INSERT INTO dbo.EstadosActivo (Nombre, Descripcion) VALUES ('Disponible', 'Activo registrado y disponible');

IF NOT EXISTS (SELECT 1 FROM dbo.EstadosActivo WHERE Nombre = 'Asignado')
    INSERT INTO dbo.EstadosActivo (Nombre, Descripcion) VALUES ('Asignado', 'Activo ubicado en laboratorio y con responsable');

IF NOT EXISTS (SELECT 1 FROM dbo.EstadosActivo WHERE Nombre = 'En mantenimiento')
    INSERT INTO dbo.EstadosActivo (Nombre, Descripcion) VALUES ('En mantenimiento', 'Activo con revision o mantenimiento pendiente');

IF NOT EXISTS (SELECT 1 FROM dbo.EstadosActivo WHERE Nombre = 'Dado de baja')
    INSERT INTO dbo.EstadosActivo (Nombre, Descripcion) VALUES ('Dado de baja', 'Activo retirado de uso sin eliminar historial');

IF NOT EXISTS (SELECT 1 FROM dbo.EstadosActivo WHERE Nombre = 'Dañado')
    INSERT INTO dbo.EstadosActivo (Nombre, Descripcion) VALUES ('Dañado', 'Activo con falla reportada');

IF NOT EXISTS (SELECT 1 FROM dbo.EstadosActivo WHERE Nombre = 'Reservado')
    INSERT INTO dbo.EstadosActivo (Nombre, Descripcion) VALUES ('Reservado', 'Activo separado para uso posterior');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Laboratorios WHERE Nombre = 'Laboratorio de Redes')
    INSERT INTO dbo.Laboratorios (Codigo, Nombre, Ubicacion) VALUES ('LAB-REDES', 'Laboratorio de Redes', 'FISEI');

IF NOT EXISTS (SELECT 1 FROM dbo.Laboratorios WHERE Nombre = 'Laboratorio 1')
    INSERT INTO dbo.Laboratorios (Codigo, Nombre, Ubicacion) VALUES ('LAB-01', 'Laboratorio 1', 'FISEI');

IF NOT EXISTS (SELECT 1 FROM dbo.Laboratorios WHERE Nombre = 'Laboratorio 2')
    INSERT INTO dbo.Laboratorios (Codigo, Nombre, Ubicacion) VALUES ('LAB-02', 'Laboratorio 2', 'FISEI');

IF NOT EXISTS (SELECT 1 FROM dbo.Laboratorios WHERE Nombre = 'Laboratorio 3')
    INSERT INTO dbo.Laboratorios (Codigo, Nombre, Ubicacion) VALUES ('LAB-03', 'Laboratorio 3', 'FISEI');

IF NOT EXISTS (SELECT 1 FROM dbo.Laboratorios WHERE Nombre = 'Laboratorio de Software')
    INSERT INTO dbo.Laboratorios (Codigo, Nombre, Ubicacion) VALUES ('LAB-SW', 'Laboratorio de Software', 'FISEI');

IF NOT EXISTS (SELECT 1 FROM dbo.Laboratorios WHERE Nombre = 'Centro de Cómputo')
    INSERT INTO dbo.Laboratorios (Codigo, Nombre, Ubicacion) VALUES ('CENT-COMP', 'Centro de Cómputo', 'FISEI');

IF NOT EXISTS (SELECT 1 FROM dbo.Laboratorios WHERE Nombre = 'Bodega')
    INSERT INTO dbo.Laboratorios (Codigo, Nombre, Ubicacion) VALUES ('BODEGA', 'Bodega', 'FISEI');

IF NOT EXISTS (SELECT 1 FROM dbo.Laboratorios WHERE Nombre = 'Administración')
    INSERT INTO dbo.Laboratorios (Codigo, Nombre, Ubicacion) VALUES ('ADMIN', 'Administración', 'FISEI');
GO

IF NOT EXISTS (SELECT 1 FROM dbo.Responsables WHERE Nombres = 'Administrador de redes')
    INSERT INTO dbo.Responsables (Nombres, Apellidos, Correo, Cargo) VALUES ('Administrador de redes', '', 'redes.fisei@uta.edu.ec', 'Administrador de redes');

IF NOT EXISTS (SELECT 1 FROM dbo.Responsables WHERE Nombres = 'Docente responsable')
    INSERT INTO dbo.Responsables (Nombres, Apellidos, Correo, Cargo) VALUES ('Docente responsable', '', NULL, 'Docente responsable');

IF NOT EXISTS (SELECT 1 FROM dbo.Responsables WHERE Nombres = 'Técnico de laboratorio')
    INSERT INTO dbo.Responsables (Nombres, Apellidos, Correo, Cargo) VALUES ('Técnico de laboratorio', '', NULL, 'Técnico de laboratorio');

IF NOT EXISTS (SELECT 1 FROM dbo.Responsables WHERE Nombres = 'Coordinador de laboratorio')
    INSERT INTO dbo.Responsables (Nombres, Apellidos, Correo, Cargo) VALUES ('Coordinador de laboratorio', '', NULL, 'Coordinador de laboratorio');
GO

SELECT 'Tipos de equipo' AS Catalogo, COUNT(*) AS Total FROM dbo.TiposEquipo
UNION ALL
SELECT 'Estados de activo', COUNT(*) FROM dbo.EstadosActivo
UNION ALL
SELECT 'Laboratorios', COUNT(*) FROM dbo.Laboratorios
UNION ALL
SELECT 'Responsables', COUNT(*) FROM dbo.Responsables;
GO

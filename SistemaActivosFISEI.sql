/*
    Sistema de gestion de inventario, mantenimiento y hoja de vida
    de activos tecnologicos para laboratorios FISEI.

    Ejecutar en SQL Server Management Studio.
    Este script crea la base de datos, tablas, relaciones, datos iniciales,
    vistas y procedimientos basicos para el Sprint 1.
*/

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

IF DB_ID('SistemaActivosFISEI') IS NULL
BEGIN
    CREATE DATABASE SistemaActivosFISEI;
END
GO

USE SistemaActivosFISEI;
GO

/* Limpieza para recompilar el script durante pruebas */
IF OBJECT_ID('dbo.usp_BuscarActivos', 'P') IS NOT NULL DROP PROCEDURE dbo.usp_BuscarActivos;
IF OBJECT_ID('dbo.usp_RegistrarActivo', 'P') IS NOT NULL DROP PROCEDURE dbo.usp_RegistrarActivo;
IF OBJECT_ID('dbo.usp_AsignarActivo', 'P') IS NOT NULL DROP PROCEDURE dbo.usp_AsignarActivo;
IF OBJECT_ID('dbo.vw_InventarioActivos', 'V') IS NOT NULL DROP VIEW dbo.vw_InventarioActivos;
GO

DROP TABLE IF EXISTS dbo.MantenimientoRecursos;
DROP TABLE IF EXISTS dbo.MantenimientoActividades;
DROP TABLE IF EXISTS dbo.Mantenimientos;
DROP TABLE IF EXISTS dbo.TicketsMantenimiento;
DROP TABLE IF EXISTS dbo.HistorialActivo;
DROP TABLE IF EXISTS dbo.AsignacionesActivos;
DROP TABLE IF EXISTS dbo.Activos;
DROP TABLE IF EXISTS dbo.RecursosCatalogo;
DROP TABLE IF EXISTS dbo.ActividadesCatalogo;
DROP TABLE IF EXISTS dbo.DiagnosticosCatalogo;
DROP TABLE IF EXISTS dbo.TiposMantenimiento;
DROP TABLE IF EXISTS dbo.EstadosMantenimiento;
DROP TABLE IF EXISTS dbo.EstadosTicket;
DROP TABLE IF EXISTS dbo.EstadosActivo;
DROP TABLE IF EXISTS dbo.TiposEquipo;
DROP TABLE IF EXISTS dbo.Laboratorios;
DROP TABLE IF EXISTS dbo.Responsables;
DROP TABLE IF EXISTS dbo.Usuarios;
DROP TABLE IF EXISTS dbo.Roles;
GO

CREATE TABLE dbo.Roles (
    RolId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE,
    Activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE dbo.Usuarios (
    UsuarioId INT IDENTITY(1,1) PRIMARY KEY,
    RolId INT NOT NULL,
    Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
    CorreoInstitucional VARCHAR(150) NOT NULL UNIQUE,
    PasswordHash VARCHAR(255) NULL,
    UsaMicrosoft BIT NOT NULL DEFAULT 0,
    Activo BIT NOT NULL DEFAULT 1,
    FechaRegistro DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    CONSTRAINT FK_Usuarios_Roles FOREIGN KEY (RolId) REFERENCES dbo.Roles(RolId)
);

CREATE TABLE dbo.Responsables (
    ResponsableId INT IDENTITY(1,1) PRIMARY KEY,
    Nombres VARCHAR(100) NOT NULL,
    Apellidos VARCHAR(100) NOT NULL,
    Correo VARCHAR(150) NULL,
    Cargo VARCHAR(100) NULL,
    Activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE dbo.Laboratorios (
    LaboratorioId INT IDENTITY(1,1) PRIMARY KEY,
    Codigo VARCHAR(20) NOT NULL UNIQUE,
    Nombre VARCHAR(100) NOT NULL,
    Ubicacion VARCHAR(150) NULL,
    Activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE dbo.TiposEquipo (
    TipoEquipoId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(80) NOT NULL UNIQUE,
    Descripcion VARCHAR(250) NULL,
    Activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE dbo.EstadosActivo (
    EstadoActivoId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE,
    Descripcion VARCHAR(250) NULL,
    Activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE dbo.EstadosTicket (
    EstadoTicketId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE,
    Activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE dbo.EstadosMantenimiento (
    EstadoMantenimientoId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(50) NOT NULL UNIQUE,
    Activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE dbo.TiposMantenimiento (
    TipoMantenimientoId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(80) NOT NULL UNIQUE,
    Descripcion VARCHAR(250) NULL,
    Activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE dbo.DiagnosticosCatalogo (
    DiagnosticoId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(120) NOT NULL UNIQUE,
    Descripcion VARCHAR(250) NULL,
    Activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE dbo.ActividadesCatalogo (
    ActividadId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(120) NOT NULL UNIQUE,
    Descripcion VARCHAR(250) NULL,
    Activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE dbo.RecursosCatalogo (
    RecursoId INT IDENTITY(1,1) PRIMARY KEY,
    Nombre VARCHAR(120) NOT NULL UNIQUE,
    UnidadMedida VARCHAR(30) NULL,
    Activo BIT NOT NULL DEFAULT 1
);

CREATE TABLE dbo.Activos (
    ActivoId INT IDENTITY(1,1) PRIMARY KEY,
    CodigoInventario VARCHAR(40) NOT NULL UNIQUE,
    Nombre VARCHAR(120) NOT NULL,
    TipoEquipoId INT NOT NULL,
    Marca VARCHAR(80) NULL,
    Modelo VARCHAR(80) NULL,
    NumeroSerie VARCHAR(100) NULL,
    Caracteristicas VARCHAR(500) NULL,
    FechaCompra DATE NULL,
    FechaRegistro DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    EstadoActivoId INT NOT NULL,
    LaboratorioActualId INT NULL,
    ResponsableActualId INT NULL,
    Observacion VARCHAR(500) NULL,
    CONSTRAINT FK_Activos_TiposEquipo FOREIGN KEY (TipoEquipoId) REFERENCES dbo.TiposEquipo(TipoEquipoId),
    CONSTRAINT FK_Activos_EstadosActivo FOREIGN KEY (EstadoActivoId) REFERENCES dbo.EstadosActivo(EstadoActivoId),
    CONSTRAINT FK_Activos_LaboratorioActual FOREIGN KEY (LaboratorioActualId) REFERENCES dbo.Laboratorios(LaboratorioId),
    CONSTRAINT FK_Activos_ResponsableActual FOREIGN KEY (ResponsableActualId) REFERENCES dbo.Responsables(ResponsableId)
);

CREATE TABLE dbo.AsignacionesActivos (
    AsignacionId INT IDENTITY(1,1) PRIMARY KEY,
    ActivoId INT NOT NULL,
    LaboratorioId INT NOT NULL,
    ResponsableId INT NOT NULL,
    FechaAsignacion DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FechaFin DATETIME2 NULL,
    Observacion VARCHAR(500) NULL,
    Activa BIT NOT NULL DEFAULT 1,
    CONSTRAINT FK_Asignaciones_Activos FOREIGN KEY (ActivoId) REFERENCES dbo.Activos(ActivoId),
    CONSTRAINT FK_Asignaciones_Laboratorios FOREIGN KEY (LaboratorioId) REFERENCES dbo.Laboratorios(LaboratorioId),
    CONSTRAINT FK_Asignaciones_Responsables FOREIGN KEY (ResponsableId) REFERENCES dbo.Responsables(ResponsableId)
);

CREATE TABLE dbo.HistorialActivo (
    HistorialId INT IDENTITY(1,1) PRIMARY KEY,
    ActivoId INT NOT NULL,
    TipoEvento VARCHAR(80) NOT NULL,
    Descripcion VARCHAR(500) NOT NULL,
    FechaEvento DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    UsuarioId INT NULL,
    CONSTRAINT FK_Historial_Activos FOREIGN KEY (ActivoId) REFERENCES dbo.Activos(ActivoId),
    CONSTRAINT FK_Historial_Usuarios FOREIGN KEY (UsuarioId) REFERENCES dbo.Usuarios(UsuarioId)
);

CREATE TABLE dbo.TicketsMantenimiento (
    TicketId INT IDENTITY(1,1) PRIMARY KEY,
    ActivoId INT NOT NULL,
    EstadoTicketId INT NOT NULL,
    Titulo VARCHAR(150) NOT NULL,
    Descripcion VARCHAR(500) NOT NULL,
    FechaApertura DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FechaCierre DATETIME2 NULL,
    UsuarioReportaId INT NULL,
    CONSTRAINT FK_Tickets_Activos FOREIGN KEY (ActivoId) REFERENCES dbo.Activos(ActivoId),
    CONSTRAINT FK_Tickets_EstadosTicket FOREIGN KEY (EstadoTicketId) REFERENCES dbo.EstadosTicket(EstadoTicketId),
    CONSTRAINT FK_Tickets_Usuarios FOREIGN KEY (UsuarioReportaId) REFERENCES dbo.Usuarios(UsuarioId)
);

CREATE TABLE dbo.Mantenimientos (
    MantenimientoId INT IDENTITY(1,1) PRIMARY KEY,
    TicketId INT NOT NULL,
    TipoMantenimientoId INT NOT NULL,
    EstadoMantenimientoId INT NOT NULL,
    DiagnosticoId INT NULL,
    FechaInicio DATETIME2 NOT NULL DEFAULT SYSDATETIME(),
    FechaFin DATETIME2 NULL,
    Observacion VARCHAR(500) NULL,
    CONSTRAINT FK_Mantenimientos_Tickets FOREIGN KEY (TicketId) REFERENCES dbo.TicketsMantenimiento(TicketId),
    CONSTRAINT FK_Mantenimientos_Tipos FOREIGN KEY (TipoMantenimientoId) REFERENCES dbo.TiposMantenimiento(TipoMantenimientoId),
    CONSTRAINT FK_Mantenimientos_Estados FOREIGN KEY (EstadoMantenimientoId) REFERENCES dbo.EstadosMantenimiento(EstadoMantenimientoId),
    CONSTRAINT FK_Mantenimientos_Diagnosticos FOREIGN KEY (DiagnosticoId) REFERENCES dbo.DiagnosticosCatalogo(DiagnosticoId)
);

CREATE TABLE dbo.MantenimientoActividades (
    MantenimientoActividadId INT IDENTITY(1,1) PRIMARY KEY,
    MantenimientoId INT NOT NULL,
    ActividadId INT NOT NULL,
    Observacion VARCHAR(300) NULL,
    CONSTRAINT FK_MantActividades_Mantenimientos FOREIGN KEY (MantenimientoId) REFERENCES dbo.Mantenimientos(MantenimientoId),
    CONSTRAINT FK_MantActividades_Actividades FOREIGN KEY (ActividadId) REFERENCES dbo.ActividadesCatalogo(ActividadId)
);

CREATE TABLE dbo.MantenimientoRecursos (
    MantenimientoRecursoId INT IDENTITY(1,1) PRIMARY KEY,
    MantenimientoId INT NOT NULL,
    RecursoId INT NOT NULL,
    Cantidad DECIMAL(10,2) NOT NULL DEFAULT 1,
    CONSTRAINT FK_MantRecursos_Mantenimientos FOREIGN KEY (MantenimientoId) REFERENCES dbo.Mantenimientos(MantenimientoId),
    CONSTRAINT FK_MantRecursos_Recursos FOREIGN KEY (RecursoId) REFERENCES dbo.RecursosCatalogo(RecursoId)
);
GO

CREATE INDEX IX_Activos_Nombre ON dbo.Activos(Nombre);
CREATE INDEX IX_Activos_Estado ON dbo.Activos(EstadoActivoId);
CREATE INDEX IX_Activos_TipoEquipo ON dbo.Activos(TipoEquipoId);
CREATE INDEX IX_Activos_LaboratorioActual ON dbo.Activos(LaboratorioActualId);
CREATE UNIQUE INDEX UX_Activos_NumeroSerie
    ON dbo.Activos(NumeroSerie)
    WHERE NumeroSerie IS NOT NULL;
CREATE INDEX IX_Asignaciones_Activo ON dbo.AsignacionesActivos(ActivoId);
GO

INSERT INTO dbo.Roles (Nombre) VALUES
('Administrador'),
('Tecnico'),
('Consulta');

INSERT INTO dbo.Usuarios (RolId, Nombres, Apellidos, CorreoInstitucional, PasswordHash, UsaMicrosoft) VALUES
(1, 'Andrew', 'Lara', 'andrew.lara@uta.edu.ec', 'CAMBIAR_POR_HASH_REAL', 1),
(2, 'Sebastian', 'Vaca', 'sebastian.vaca@uta.edu.ec', 'CAMBIAR_POR_HASH_REAL', 1),
(3, 'Anahi', 'Morales', 'anahi.morales@uta.edu.ec', 'CAMBIAR_POR_HASH_REAL', 1);

INSERT INTO dbo.Responsables (Nombres, Apellidos, Correo, Cargo) VALUES
('Administrador', 'Redes FISEI', 'redes.fisei@uta.edu.ec', 'Administrador de redes'),
('Docente', 'Laboratorio', 'docente.lab@uta.edu.ec', 'Responsable de laboratorio');

INSERT INTO dbo.Laboratorios (Codigo, Nombre, Ubicacion) VALUES
('LAB-REDES', 'Laboratorio de Redes', 'FISEI'),
('LAB-SW', 'Laboratorio de Software', 'FISEI'),
('LAB-ELEC', 'Laboratorio de Electronica', 'FISEI');

INSERT INTO dbo.TiposEquipo (Nombre, Descripcion) VALUES
('Computador', 'Equipo de escritorio o portatil'),
('Switch', 'Equipo de comunicacion de red'),
('Router', 'Equipo de enrutamiento'),
('Proyector', 'Equipo de presentacion'),
('Impresora', 'Equipo de impresion');

INSERT INTO dbo.EstadosActivo (Nombre, Descripcion) VALUES
('Disponible', 'Activo registrado y disponible'),
('Asignado', 'Activo ubicado en laboratorio y con responsable'),
('En mantenimiento', 'Activo con revision o mantenimiento pendiente'),
('Dado de baja', 'Activo retirado de uso sin eliminar historial');

INSERT INTO dbo.EstadosTicket (Nombre) VALUES
('Abierto'),
('Cerrado');

INSERT INTO dbo.EstadosMantenimiento (Nombre) VALUES
('Pendiente'),
('En proceso'),
('Terminado');

INSERT INTO dbo.TiposMantenimiento (Nombre, Descripcion) VALUES
('Preventivo', 'Mantenimiento planificado para evitar fallas'),
('Correctivo', 'Mantenimiento para corregir una falla'),
('Adaptativo', 'Ajuste o mejora por nuevos requerimientos');

INSERT INTO dbo.DiagnosticosCatalogo (Nombre, Descripcion) VALUES
('Falla de hardware', 'Revision de componentes fisicos'),
('Falla de software', 'Revision de sistema operativo o aplicaciones'),
('Falla de conectividad', 'Revision de red o acceso a internet');

INSERT INTO dbo.ActividadesCatalogo (Nombre, Descripcion) VALUES
('Limpieza fisica', 'Limpieza externa e interna del equipo'),
('Instalacion de software', 'Instalacion o actualizacion de programas'),
('Revision de conectividad', 'Verificacion de red, cableado y configuracion');

INSERT INTO dbo.RecursosCatalogo (Nombre, UnidadMedida) VALUES
('Pasta termica', 'unidad'),
('Cable UTP', 'metro'),
('Disco SSD', 'unidad');
GO

CREATE VIEW dbo.vw_InventarioActivos
AS
SELECT
    a.ActivoId,
    a.CodigoInventario,
    a.Nombre,
    te.Nombre AS TipoEquipo,
    a.Marca,
    a.Modelo,
    a.NumeroSerie,
    a.FechaCompra,
    ea.Nombre AS Estado,
    l.Codigo AS CodigoLaboratorio,
    l.Nombre AS Laboratorio,
    CONCAT(r.Nombres, ' ', r.Apellidos) AS Responsable,
    a.FechaRegistro,
    a.Observacion
FROM dbo.Activos a
INNER JOIN dbo.TiposEquipo te ON te.TipoEquipoId = a.TipoEquipoId
INNER JOIN dbo.EstadosActivo ea ON ea.EstadoActivoId = a.EstadoActivoId
LEFT JOIN dbo.Laboratorios l ON l.LaboratorioId = a.LaboratorioActualId
LEFT JOIN dbo.Responsables r ON r.ResponsableId = a.ResponsableActualId;
GO

CREATE PROCEDURE dbo.usp_RegistrarActivo
    @CodigoInventario VARCHAR(40),
    @Nombre VARCHAR(120),
    @TipoEquipoId INT,
    @Marca VARCHAR(80) = NULL,
    @Modelo VARCHAR(80) = NULL,
    @NumeroSerie VARCHAR(100) = NULL,
    @Caracteristicas VARCHAR(500) = NULL,
    @FechaCompra DATE = NULL,
    @EstadoActivoId INT,
    @LaboratorioActualId INT = NULL,
    @ResponsableActualId INT = NULL,
    @Observacion VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (SELECT 1 FROM dbo.Activos WHERE CodigoInventario = @CodigoInventario)
    BEGIN
        THROW 50001, 'El codigo de inventario ya existe.', 1;
    END;

    INSERT INTO dbo.Activos (
        CodigoInventario, Nombre, TipoEquipoId, Marca, Modelo, NumeroSerie,
        Caracteristicas, FechaCompra, EstadoActivoId, LaboratorioActualId,
        ResponsableActualId, Observacion
    )
    VALUES (
        @CodigoInventario, @Nombre, @TipoEquipoId, @Marca, @Modelo, @NumeroSerie,
        @Caracteristicas, @FechaCompra, @EstadoActivoId, @LaboratorioActualId,
        @ResponsableActualId, @Observacion
    );

    DECLARE @ActivoId INT = SCOPE_IDENTITY();

    INSERT INTO dbo.HistorialActivo (ActivoId, TipoEvento, Descripcion)
    VALUES (@ActivoId, 'Registro', 'Activo tecnologico registrado en el inventario.');

    SELECT @ActivoId AS ActivoId;
END;
GO

CREATE PROCEDURE dbo.usp_AsignarActivo
    @ActivoId INT,
    @LaboratorioId INT,
    @ResponsableId INT,
    @Observacion VARCHAR(500) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    IF NOT EXISTS (SELECT 1 FROM dbo.Activos WHERE ActivoId = @ActivoId)
    BEGIN
        THROW 50002, 'El activo no existe.', 1;
    END;

    UPDATE dbo.AsignacionesActivos
    SET Activa = 0,
        FechaFin = SYSDATETIME()
    WHERE ActivoId = @ActivoId
      AND Activa = 1;

    INSERT INTO dbo.AsignacionesActivos (ActivoId, LaboratorioId, ResponsableId, Observacion)
    VALUES (@ActivoId, @LaboratorioId, @ResponsableId, @Observacion);

    UPDATE dbo.Activos
    SET LaboratorioActualId = @LaboratorioId,
        ResponsableActualId = @ResponsableId,
        EstadoActivoId = (SELECT EstadoActivoId FROM dbo.EstadosActivo WHERE Nombre = 'Asignado')
    WHERE ActivoId = @ActivoId;

    INSERT INTO dbo.HistorialActivo (ActivoId, TipoEvento, Descripcion)
    VALUES (@ActivoId, 'Asignacion', 'Activo asignado a laboratorio y responsable.');
END;
GO

CREATE PROCEDURE dbo.usp_BuscarActivos
    @Texto VARCHAR(120) = NULL,
    @TipoEquipoId INT = NULL,
    @LaboratorioId INT = NULL,
    @EstadoActivoId INT = NULL
AS
BEGIN
    SET NOCOUNT ON;

    SELECT *
    FROM dbo.vw_InventarioActivos
    WHERE (@Texto IS NULL OR
           CodigoInventario LIKE '%' + @Texto + '%' OR
           Nombre LIKE '%' + @Texto + '%' OR
           NumeroSerie LIKE '%' + @Texto + '%')
      AND (@TipoEquipoId IS NULL OR TipoEquipo = (SELECT Nombre FROM dbo.TiposEquipo WHERE TipoEquipoId = @TipoEquipoId))
      AND (@LaboratorioId IS NULL OR CodigoLaboratorio = (SELECT Codigo FROM dbo.Laboratorios WHERE LaboratorioId = @LaboratorioId))
      AND (@EstadoActivoId IS NULL OR Estado = (SELECT Nombre FROM dbo.EstadosActivo WHERE EstadoActivoId = @EstadoActivoId))
    ORDER BY FechaRegistro DESC;
END;
GO

/* Datos de ejemplo para validar visualizacion y filtros */
EXEC dbo.usp_RegistrarActivo
    @CodigoInventario = 'FISEI-PC-001',
    @Nombre = 'Computador Dell Optiplex',
    @TipoEquipoId = 1,
    @Marca = 'Dell',
    @Modelo = 'Optiplex',
    @NumeroSerie = 'SN-PC-001',
    @Caracteristicas = 'Core i5, 8GB RAM, SSD 256GB',
    @FechaCompra = '2025-03-10',
    @EstadoActivoId = 1,
    @Observacion = 'Equipo inicial de prueba';

EXEC dbo.usp_RegistrarActivo
    @CodigoInventario = 'FISEI-SW-001',
    @Nombre = 'Switch Cisco 24 Puertos',
    @TipoEquipoId = 2,
    @Marca = 'Cisco',
    @Modelo = 'Catalyst',
    @NumeroSerie = 'SN-SW-001',
    @Caracteristicas = '24 puertos Gigabit',
    @FechaCompra = '2024-08-15',
    @EstadoActivoId = 1,
    @Observacion = 'Equipo de red';

EXEC dbo.usp_AsignarActivo
    @ActivoId = 1,
    @LaboratorioId = 1,
    @ResponsableId = 1,
    @Observacion = 'Asignado para pruebas de Sprint 1';
GO

/* Consultas rapidas para revisar en SSMS */
SELECT * FROM dbo.vw_InventarioActivos;
EXEC dbo.usp_BuscarActivos @Texto = 'Dell';
EXEC dbo.usp_BuscarActivos @LaboratorioId = 1;
GO

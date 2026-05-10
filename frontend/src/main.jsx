import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Boxes,
  Building2,
  ClipboardList,
  Filter,
  LogIn,
  Plus,
  RefreshCw,
  Search,
  UserCheck
} from 'lucide-react';
import './styles.css';

const emptyActivo = {
  codigoInventario: '',
  nombre: '',
  tipoEquipoId: '',
  marca: '',
  modelo: '',
  numeroSerie: '',
  caracteristicas: '',
  fechaCompra: '',
  estadoActivoId: 1,
  laboratorioActualId: '',
  responsableActualId: '',
  observacion: ''
};

function App() {
  const [usuario, setUsuario] = useState(null);
  const [correo, setCorreo] = useState('andrew.lara@uta.edu.ec');
  const [catalogos, setCatalogos] = useState({
    tiposEquipo: [],
    estadosActivo: [],
    laboratorios: [],
    responsables: []
  });
  const [activos, setActivos] = useState([]);
  const [filtros, setFiltros] = useState({
    texto: '',
    tipoEquipoId: '',
    laboratorioId: '',
    estadoActivoId: ''
  });
  const [nuevoActivo, setNuevoActivo] = useState(emptyActivo);
  const [asignacion, setAsignacion] = useState({
    activoId: '',
    laboratorioId: '',
    responsableId: '',
    observacion: ''
  });
  const [mensaje, setMensaje] = useState('');

  const resumen = useMemo(() => {
    const asignados = activos.filter((activo) => activo.Estado === 'Asignado').length;
    const disponibles = activos.filter((activo) => activo.Estado === 'Disponible').length;
    return { total: activos.length, asignados, disponibles };
  }, [activos]);

  async function cargarCatalogos() {
    const response = await fetch('/api/catalogos');
    setCatalogos(await response.json());
  }

  async function cargarActivos() {
    const response = await fetch('/api/activos');
    setActivos(await response.json());
  }

  async function iniciarSesion(event) {
    event.preventDefault();
    setMensaje('');

    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ correoInstitucional: correo })
    });
    const data = await response.json();

    if (!response.ok) {
      setMensaje(data.mensaje || 'No se pudo iniciar sesion.');
      return;
    }

    setUsuario(data.usuario);
    setMensaje(data.mensaje);
  }

  async function buscarActivos(event) {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const response = await fetch(`/api/activos/buscar?${params.toString()}`);
    setActivos(await response.json());
  }

  async function registrarActivo(event) {
    event.preventDefault();
    setMensaje('');

    const payload = normalizarNumeros(nuevoActivo);
    const response = await fetch('/api/activos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await response.json();
    setMensaje(data.mensaje);

    if (response.ok) {
      setNuevoActivo(emptyActivo);
      await cargarActivos();
    }
  }

  async function asignarActivo(event) {
    event.preventDefault();
    setMensaje('');

    const response = await fetch(`/api/activos/${asignacion.activoId}/asignar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(normalizarNumeros(asignacion))
    });
    const data = await response.json();
    setMensaje(data.mensaje);

    if (response.ok) {
      setAsignacion({ activoId: '', laboratorioId: '', responsableId: '', observacion: '' });
      await cargarActivos();
    }
  }

  useEffect(() => {
    cargarCatalogos().catch(() => setMensaje('No se pudieron cargar catalogos.'));
    cargarActivos().catch(() => setMensaje('No se pudieron cargar activos.'));
  }, []);

  if (!usuario) {
    return (
      <main className="login">
        <section className="login-panel">
          <div className="brand-mark">FISEI</div>
          <h1>Sistema de activos tecnologicos</h1>
          <p>Inventario, laboratorios y asignaciones del Sprint 1.</p>
          <form onSubmit={iniciarSesion} className="stack">
            <label>
              Correo institucional
              <input value={correo} onChange={(event) => setCorreo(event.target.value)} />
            </label>
            <button type="submit">
              <LogIn size={18} />
              Ingresar
            </button>
          </form>
          {mensaje && <span className="message">{mensaje}</span>}
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">FISEI</div>
        <nav>
          <a href="#inventario"><Boxes size={18} /> Inventario</a>
          <a href="#registro"><Plus size={18} /> Registro</a>
          <a href="#asignacion"><Building2 size={18} /> Asignacion</a>
        </nav>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <h1>Inventario de activos</h1>
            <p>{usuario.Nombres} {usuario.Apellidos} · {usuario.Rol}</p>
          </div>
          <button type="button" className="ghost" onClick={cargarActivos}>
            <RefreshCw size={18} />
            Actualizar
          </button>
        </header>

        <section className="metrics">
          <Metric icon={<ClipboardList />} label="Activos" value={resumen.total} />
          <Metric icon={<UserCheck />} label="Asignados" value={resumen.asignados} />
          <Metric icon={<Boxes />} label="Disponibles" value={resumen.disponibles} />
        </section>

        {mensaje && <div className="notice">{mensaje}</div>}

        <section id="inventario" className="panel">
          <div className="panel-heading">
            <h2>Busqueda por filtros</h2>
            <Filter size={20} />
          </div>
          <form className="filters" onSubmit={buscarActivos}>
            <input
              placeholder="Codigo, nombre o serie"
              value={filtros.texto}
              onChange={(event) => setFiltros({ ...filtros, texto: event.target.value })}
            />
            <Select
              value={filtros.tipoEquipoId}
              onChange={(value) => setFiltros({ ...filtros, tipoEquipoId: value })}
              items={catalogos.tiposEquipo}
              idKey="TipoEquipoId"
              labelKey="Nombre"
              placeholder="Tipo"
            />
            <Select
              value={filtros.laboratorioId}
              onChange={(value) => setFiltros({ ...filtros, laboratorioId: value })}
              items={catalogos.laboratorios}
              idKey="LaboratorioId"
              labelKey="Nombre"
              placeholder="Laboratorio"
            />
            <Select
              value={filtros.estadoActivoId}
              onChange={(value) => setFiltros({ ...filtros, estadoActivoId: value })}
              items={catalogos.estadosActivo}
              idKey="EstadoActivoId"
              labelKey="Nombre"
              placeholder="Estado"
            />
            <button type="submit"><Search size={18} /> Buscar</button>
          </form>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Nombre</th>
                  <th>Tipo</th>
                  <th>Laboratorio</th>
                  <th>Responsable</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {activos.map((activo) => (
                  <tr key={activo.ActivoId}>
                    <td>{activo.CodigoInventario}</td>
                    <td>{activo.Nombre}</td>
                    <td>{activo.TipoEquipo}</td>
                    <td>{activo.Laboratorio || 'Sin asignar'}</td>
                    <td>{activo.Responsable?.trim() || 'Sin responsable'}</td>
                    <td><span className="status">{activo.Estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section id="registro" className="panel">
          <div className="panel-heading">
            <h2>Registro de activo</h2>
            <Plus size={20} />
          </div>
          <form className="grid-form" onSubmit={registrarActivo}>
            <Input label="Codigo" value={nuevoActivo.codigoInventario} onChange={(value) => setNuevoActivo({ ...nuevoActivo, codigoInventario: value })} />
            <Input label="Nombre" value={nuevoActivo.nombre} onChange={(value) => setNuevoActivo({ ...nuevoActivo, nombre: value })} />
            <SelectField label="Tipo" value={nuevoActivo.tipoEquipoId} onChange={(value) => setNuevoActivo({ ...nuevoActivo, tipoEquipoId: value })} items={catalogos.tiposEquipo} idKey="TipoEquipoId" labelKey="Nombre" />
            <SelectField label="Estado" value={nuevoActivo.estadoActivoId} onChange={(value) => setNuevoActivo({ ...nuevoActivo, estadoActivoId: value })} items={catalogos.estadosActivo} idKey="EstadoActivoId" labelKey="Nombre" />
            <Input label="Marca" value={nuevoActivo.marca} onChange={(value) => setNuevoActivo({ ...nuevoActivo, marca: value })} />
            <Input label="Modelo" value={nuevoActivo.modelo} onChange={(value) => setNuevoActivo({ ...nuevoActivo, modelo: value })} />
            <Input label="Serie" value={nuevoActivo.numeroSerie} onChange={(value) => setNuevoActivo({ ...nuevoActivo, numeroSerie: value })} />
            <Input label="Fecha compra" type="date" value={nuevoActivo.fechaCompra} onChange={(value) => setNuevoActivo({ ...nuevoActivo, fechaCompra: value })} />
            <button type="submit"><Plus size={18} /> Guardar activo</button>
          </form>
        </section>

        <section id="asignacion" className="panel">
          <div className="panel-heading">
            <h2>Asignacion a laboratorio</h2>
            <Building2 size={20} />
          </div>
          <form className="grid-form" onSubmit={asignarActivo}>
            <SelectField label="Activo" value={asignacion.activoId} onChange={(value) => setAsignacion({ ...asignacion, activoId: value })} items={activos} idKey="ActivoId" labelKey="Nombre" />
            <SelectField label="Laboratorio" value={asignacion.laboratorioId} onChange={(value) => setAsignacion({ ...asignacion, laboratorioId: value })} items={catalogos.laboratorios} idKey="LaboratorioId" labelKey="Nombre" />
            <SelectField label="Responsable" value={asignacion.responsableId} onChange={(value) => setAsignacion({ ...asignacion, responsableId: value })} items={catalogos.responsables} idKey="ResponsableId" labelKey="Nombres" />
            <Input label="Observacion" value={asignacion.observacion} onChange={(value) => setAsignacion({ ...asignacion, observacion: value })} />
            <button type="submit"><UserCheck size={18} /> Asignar</button>
          </form>
        </section>
      </section>
    </main>
  );
}

function Metric({ icon, label, value }) {
  return (
    <article className="metric">
      {icon}
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Input({ label, value, onChange, type = 'text' }) {
  return (
    <label>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Select({ value, onChange, items, idKey, labelKey, placeholder }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{placeholder}</option>
      {items.map((item) => (
        <option key={item[idKey]} value={item[idKey]}>
          {item[labelKey]} {item.Apellidos || ''}
        </option>
      ))}
    </select>
  );
}

function SelectField(props) {
  return (
    <label>
      {props.label}
      <Select {...props} placeholder="Seleccione" />
    </label>
  );
}

function normalizarNumeros(data) {
  const copy = { ...data };
  ['tipoEquipoId', 'estadoActivoId', 'laboratorioActualId', 'responsableActualId', 'activoId', 'laboratorioId', 'responsableId'].forEach((key) => {
    if (copy[key] === '') copy[key] = null;
    if (copy[key]) copy[key] = Number(copy[key]);
  });
  return copy;
}

createRoot(document.getElementById('root')).render(<App />);

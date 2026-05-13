import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { PublicClientApplication } from '@azure/msal-browser';
import {
  BarChart3,
  Boxes,
  Building2,
  FileText,
  LogIn,
  PackagePlus,
  PieChart,
  Search,
  UserCheck,
  Wrench
} from 'lucide-react';
import utaLogo from './assets/uta-logo.png';
import fiseiLogo from './assets/fisei-logo.png';
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

const microsoftClientId = import.meta.env.VITE_MS_CLIENT_ID;
const microsoftAuthority = import.meta.env.VITE_MS_AUTHORITY || 'https://login.microsoftonline.com/consumers';

const msalInstance = microsoftClientId
  ? new PublicClientApplication({
    auth: {
      clientId: microsoftClientId,
      authority: microsoftAuthority,
      redirectUri: window.location.origin
    },
    cache: {
      cacheLocation: 'sessionStorage'
    }
  })
  : null;

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
  const [vista, setVista] = useState('dashboard');

  const resumen = useMemo(() => {
    const asignados = activos.filter((activo) => activo.Estado === 'Asignado').length;
    const disponibles = activos.filter((activo) => activo.Estado === 'Disponible').length;
    const mantenimiento = activos.filter((activo) => activo.Estado === 'En mantenimiento').length;
    const baja = activos.filter((activo) => activo.Estado === 'Dado de baja').length;
    return { total: activos.length, asignados, disponibles, mantenimiento, baja };
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

  async function iniciarSesionMicrosoft() {
    setMensaje('');

    if (!msalInstance) {
      setMensaje('Falta configurar VITE_MS_CLIENT_ID en el archivo .env.');
      return;
    }

    try {
      await msalInstance.initialize();
      const microsoftResponse = await msalInstance.loginPopup({
        scopes: ['openid', 'profile', 'email'],
        prompt: 'select_account'
      });

      const response = await fetch('/api/auth/microsoft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: microsoftResponse.idToken })
      });
      const data = await response.json();

      if (!response.ok) {
        setMensaje(data.mensaje || 'No se pudo validar la cuenta Microsoft.');
        return;
      }

      setUsuario(data.usuario);
      setMensaje(data.mensaje);
    } catch (error) {
      setMensaje('Inicio con Microsoft cancelado o no autorizado.');
    }
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

  useEffect(() => {
    if (!mensaje) return undefined;

    const timer = window.setTimeout(() => {
      setMensaje('');
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [mensaje]);

  if (!usuario) {
    return (
      <main className="login">
        <section className="login-card">
          <div className="login-left">
            <LogoPair />
            <div>
              <h1>UNIVERSIDAD TECNICA DE AMBATO</h1>
              <p>Facultad de Ingenieria en Sistemas, Electronica e Industrial</p>
            </div>
            <div className="feature-box">
              <h2>Sistema de Inventario y Mantenimiento</h2>
              <ul>
                <li>Gestion de activos tecnologicos</li>
                <li>Control de laboratorios</li>
                <li>Tickets de mantenimiento</li>
                <li>Reportes y hoja de vida del activo</li>
              </ul>
            </div>
          </div>
          <form onSubmit={iniciarSesion} className="login-right">
            <span className="pill">Acceso institucional</span>
            <h2>Inicio de sesion</h2>
            <p>Ingrese sus credenciales para acceder al sistema de administracion de redes y mantenimiento de equipos tecnologicos de la FISEI.</p>
            <label>
              Correo institucional
              <input value={correo} onChange={(event) => setCorreo(event.target.value)} placeholder="usuario@uta.edu.ec" />
            </label>
            <label>
              Contrasena
              <input type="password" placeholder="Ingrese su contrasena" />
            </label>
            <div className="login-options">
              <label className="check"><input type="checkbox" /> Recordar sesion</label>
              <a href="#recuperar">Olvido su contrasena?</a>
            </div>
            <button type="submit"><LogIn size={18} /> Ingresar al sistema</button>
            <button className="outline-button" type="button" onClick={iniciarSesionMicrosoft}>Acceder con Microsoft</button>
            <small>Administracion de Redes - FISEI</small>
            {mensaje && <span className="message">{mensaje}</span>}
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <LogoPair />
        <h2>Sistema de Inventario y Mantenimiento</h2>
        <p>Administracion de Redes - FISEI</p>
        <nav>
          <NavButton active={vista === 'dashboard'} icon={<BarChart3 size={16} />} onClick={() => setVista('dashboard')}>Dashboard</NavButton>
          <NavButton active={vista === 'activos'} icon={<Boxes size={16} />} onClick={() => setVista('activos')}>Activos tecnologicos</NavButton>
          <NavButton active={vista === 'registro'} icon={<Building2 size={16} />} onClick={() => setVista('registro')}>Laboratorios</NavButton>
          <NavButton icon={<FileText size={16} />} onClick={() => setVista('activos')}>Tickets</NavButton>
          <NavButton icon={<Wrench size={16} />} onClick={() => setVista('dashboard')}>Mantenimientos</NavButton>
          <NavButton active={vista === 'catalogos'} icon={<PackagePlus size={16} />} onClick={() => setVista('catalogos')}>Catalogos</NavButton>
          <NavButton icon={<Search size={16} />} onClick={() => setVista('dashboard')}>Reportes</NavButton>
          <NavButton icon={<UserCheck size={16} />} onClick={() => setVista('activos')}>Hoja de vida del activo</NavButton>
        </nav>
        <span>Universidad Tecnica de Ambato<br />FISEI</span>
      </aside>

      <section className="content">
        <InstitutionHeader />
        <UserBadge usuario={usuario} />

        {mensaje && <div className="notice">{mensaje}</div>}

        {vista === 'dashboard' && (
          <section className="screen">
            <PageTitle
              title="Dashboard de Mantenimiento e Inventario"
              subtitle="Resumen general de activos, laboratorios, tickets y mantenimientos."
            />
            <section className="metrics">
              <Metric label="Activos registrados" value={resumen.total} help="Equipos tecnologicos inventariados" />
              <Metric label="Activos asignados" value={resumen.asignados} help="Ubicados en laboratorios" />
              <Metric label="En mantenimiento" value={resumen.mantenimiento} help="Con revision tecnica activa" />
              <Metric label="Equipos dados de baja" value={resumen.baja} help="Activos conservados en historial" />
            </section>
            <section className="dashboard-grid">
              <article className="panel chart-card">
                <h2>Mantenimientos por laboratorio</h2>
                <div className="bars">
                  <span style={{ height: '70%' }}>Lab 1</span>
                  <span style={{ height: '50%' }}>Lab 2</span>
                  <span style={{ height: '88%' }}>Lab 3</span>
                  <span style={{ height: '38%' }}>Lab 4</span>
                  <span style={{ height: '58%' }}>Redes</span>
                </div>
              </article>
              <article className="panel chart-card">
                <h2>Tipos de mantenimiento</h2>
                <div className="pie-row">
                  <PieChart size={112} strokeWidth={8} />
                  <ul className="legend">
                    <li>Preventivo</li>
                    <li>Correctivo</li>
                    <li>Adaptativo</li>
                  </ul>
                </div>
              </article>
              <article className="panel">
                <h2>Ultimos mantenimientos</h2>
                <MiniTable />
              </article>
              <article className="panel">
                <h2>Estados de tickets</h2>
                <Progress label="Pendiente" value="60%" />
                <Progress label="En proceso" value="30%" />
                <Progress label="Terminado" value="10%" />
              </article>
            </section>
          </section>
        )}

        {vista === 'activos' && (
          <section className="screen">
            <PageTitle
              title="Visualizacion de Activos Tecnologicos"
              subtitle="Consulta general del inventario, ubicacion, responsable y estado de cada equipo."
            />
            <section className="metrics">
              <Metric label="Total de activos" value={resumen.total} help="Registrados en inventario" />
              <Metric label="Activos asignados" value={resumen.asignados} help="Ubicados en laboratorios" />
              <Metric label="Disponibles" value={resumen.disponibles} help="Listos para asignacion" />
              <Metric label="En mantenimiento" value={resumen.mantenimiento} help="Con revision tecnica activa" />
            </section>
            <section className="panel">
              <h2>Filtros de busqueda</h2>
          <form className="filters" onSubmit={buscarActivos}>
            <label>
              Buscar por codigo, nombre o serie
            <input
              placeholder="PC-LAB"
              value={filtros.texto}
              onChange={(event) => setFiltros({ ...filtros, texto: event.target.value })}
            />
            </label>
            <label>
              Laboratorio
              <Select
                value={filtros.laboratorioId}
                onChange={(value) => setFiltros({ ...filtros, laboratorioId: value })}
                items={catalogos.laboratorios}
                idKey="LaboratorioId"
                labelKey="Nombre"
                placeholder="Todos"
              />
            </label>
            <label>
              Tipo de equipo
            <Select
              value={filtros.tipoEquipoId}
              onChange={(value) => setFiltros({ ...filtros, tipoEquipoId: value })}
              items={catalogos.tiposEquipo}
              idKey="TipoEquipoId"
              labelKey="Nombre"
              placeholder="Todos"
            />
            </label>
            <label>
              Estado
            <Select
              value={filtros.estadoActivoId}
              onChange={(value) => setFiltros({ ...filtros, estadoActivoId: value })}
              items={catalogos.estadosActivo}
              idKey="EstadoActivoId"
              labelKey="Nombre"
              placeholder="Todos"
            />
            </label>
            <button type="submit">Buscar</button>
          </form>
            </section>

          <section className="panel">
            <div className="list-heading">
              <h2>Listado de activos registrados</h2>
              <div>
                <button className="outline-button" type="button">Exportar</button>
                <button type="button" onClick={() => setVista('registro')}>Nuevo activo</button>
              </div>
            </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Codigo</th>
                  <th>Activo</th>
                  <th>Tipo</th>
                  <th>Laboratorio</th>
                  <th>Responsable</th>
                  <th>Fecha compra</th>
                  <th>Estado</th>
                  <th>Acciones</th>
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
                    <td>{formatDate(activo.FechaCompra)}</td>
                    <td><span className={`status ${statusClass(activo.Estado)}`}>{activo.Estado}</span></td>
                    <td><a className="action-link" href="#ver">Ver<br />Editar</a></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
          </section>
        )}

        {vista === 'registro' && (
          <section className="screen">
            <PageTitle
              title="Registro de Activo Tecnologico"
              subtitle="Formulario para registrar equipos tecnologicos, ubicacion, responsable y caracteristicas tecnicas."
            />
        <section className="panel">
          <h2>Datos generales del activo</h2>
          <form className="grid-form" onSubmit={registrarActivo}>
            <Input label="Codigo" value={nuevoActivo.codigoInventario} onChange={(value) => setNuevoActivo({ ...nuevoActivo, codigoInventario: value })} />
            <Input label="Nombre del activo" value={nuevoActivo.nombre} onChange={(value) => setNuevoActivo({ ...nuevoActivo, nombre: value })} />
            <SelectField label="Tipo" value={nuevoActivo.tipoEquipoId} onChange={(value) => setNuevoActivo({ ...nuevoActivo, tipoEquipoId: value })} items={catalogos.tiposEquipo} idKey="TipoEquipoId" labelKey="Nombre" />
            <Input label="Marca" value={nuevoActivo.marca} onChange={(value) => setNuevoActivo({ ...nuevoActivo, marca: value })} />
            <Input label="Modelo" value={nuevoActivo.modelo} onChange={(value) => setNuevoActivo({ ...nuevoActivo, modelo: value })} />
            <Input label="Numero de serie" value={nuevoActivo.numeroSerie} onChange={(value) => setNuevoActivo({ ...nuevoActivo, numeroSerie: value })} />
            <Input label="Fecha compra" type="date" value={nuevoActivo.fechaCompra} onChange={(value) => setNuevoActivo({ ...nuevoActivo, fechaCompra: value })} />
            <SelectField label="Estado del activo" value={nuevoActivo.estadoActivoId} onChange={(value) => setNuevoActivo({ ...nuevoActivo, estadoActivoId: value })} items={catalogos.estadosActivo} idKey="EstadoActivoId" labelKey="Nombre" />
            <SelectField label="Laboratorio asignado" value={nuevoActivo.laboratorioActualId} onChange={(value) => setNuevoActivo({ ...nuevoActivo, laboratorioActualId: value })} items={catalogos.laboratorios} idKey="LaboratorioId" labelKey="Nombre" />
            <SelectField label="Responsable" value={nuevoActivo.responsableActualId} onChange={(value) => setNuevoActivo({ ...nuevoActivo, responsableActualId: value })} items={catalogos.responsables} idKey="ResponsableId" labelKey="Nombres" />
            <Input label="Ubicacion especifica" value={nuevoActivo.observacion} onChange={(value) => setNuevoActivo({ ...nuevoActivo, observacion: value })} />
            <label className="wide">
              Caracteristicas tecnicas
              <textarea value={nuevoActivo.caracteristicas} onChange={(event) => setNuevoActivo({ ...nuevoActivo, caracteristicas: event.target.value })} />
            </label>
            <button type="submit"><PackagePlus size={18} /> Guardar activo</button>
          </form>
        </section>
        <section className="panel compact-panel">
          <h2>Asignacion a laboratorio</h2>
          <form className="grid-form" onSubmit={asignarActivo}>
            <SelectField label="Activo" value={asignacion.activoId} onChange={(value) => setAsignacion({ ...asignacion, activoId: value })} items={activos} idKey="ActivoId" labelKey="Nombre" />
            <SelectField label="Laboratorio" value={asignacion.laboratorioId} onChange={(value) => setAsignacion({ ...asignacion, laboratorioId: value })} items={catalogos.laboratorios} idKey="LaboratorioId" labelKey="Nombre" />
            <SelectField label="Responsable" value={asignacion.responsableId} onChange={(value) => setAsignacion({ ...asignacion, responsableId: value })} items={catalogos.responsables} idKey="ResponsableId" labelKey="Nombres" />
            <Input label="Observacion" value={asignacion.observacion} onChange={(value) => setAsignacion({ ...asignacion, observacion: value })} />
            <button type="submit"><UserCheck size={18} /> Asignar</button>
          </form>
        </section>
          </section>
        )}

        {vista === 'catalogos' && (
          <section className="screen">
            <PageTitle
              title="Gestion de Catalogos Basicos"
              subtitle="Valores reutilizables para mantener consistencia en formularios de activos, laboratorios y estados."
            />
            <section className="catalog-grid">
              <CatalogCard
                title="Tipos de equipo"
                description="Clasificacion tecnica de los activos registrados."
                items={catalogos.tiposEquipo}
                idKey="TipoEquipoId"
                render={(item) => item.Nombre}
              />
              <CatalogCard
                title="Estados de activo"
                description="Estados permitidos para controlar el ciclo de vida del equipo."
                items={catalogos.estadosActivo}
                idKey="EstadoActivoId"
                render={(item) => item.Nombre}
              />
              <CatalogCard
                title="Laboratorios"
                description="Ubicaciones fisicas disponibles para asignar activos."
                items={catalogos.laboratorios}
                idKey="LaboratorioId"
                render={(item) => `${item.Codigo} - ${item.Nombre}`}
              />
              <CatalogCard
                title="Responsables"
                description="Personas o areas encargadas de los activos tecnologicos."
                items={catalogos.responsables}
                idKey="ResponsableId"
                render={(item) => `${item.Nombres} ${item.Apellidos || ''}`.trim()}
              />
            </section>
          </section>
        )}
      </section>
    </main>
  );
}

function LogoPair() {
  return (
    <div className="logos">
      <img src={utaLogo} alt="Logo UTA" />
      <img src={fiseiLogo} alt="Logo FISEI" />
    </div>
  );
}

function InstitutionHeader() {
  return (
    <header className="institution-header">
      <div>
        <strong>UNIVERSIDAD TECNICA DE AMBATO</strong>
        <span>Facultad de Ingenieria en Sistemas, Electronica e Industrial</span>
      </div>
    </header>
  );
}

function NavButton({ active = false, icon, children, onClick }) {
  return (
    <button className={active ? 'active' : ''} onClick={onClick} type="button">
      {icon}
      {children}
    </button>
  );
}

function UserBadge({ usuario }) {
  return <div className="user-badge"><strong>{usuario.Nombres} {usuario.Apellidos}</strong><span>Administrador de redes</span></div>;
}

function PageTitle({ title, subtitle }) {
  return (
    <header className="page-title">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
}

function Metric({ label, value, help }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong><small>{help}</small></article>;
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

function MiniTable() {
  return (
    <table className="mini-table">
      <tbody>
        <tr><td>PC-LAB01-014</td><td>Laboratorio 1</td><td><span className="badge blue">En proceso</span></td></tr>
        <tr><td>SW-RED-003</td><td>Redes</td><td><span className="badge yellow">Pendiente</span></td></tr>
      </tbody>
    </table>
  );
}

function Progress({ label, value }) {
  return <div className="progress"><span>{label}</span><div><i style={{ width: value }} /></div><b>{value}</b></div>;
}

function CatalogCard({ title, description, items, idKey, render }) {
  return (
    <article className="panel catalog-card">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <ul>
        {items.map((item) => (
          <li key={item[idKey]}>
            <span>{render(item)}</span>
            <small>Activo</small>
          </li>
        ))}
      </ul>
    </article>
  );
}

function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('es-EC').format(new Date(value));
}

function statusClass(status = '') {
  return status
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
}

createRoot(document.getElementById('root')).render(<App />);

import { useState } from 'react';
import { api } from './api/axios';
import { Search, UserCheck, CreditCard, X, CheckCircle } from 'lucide-react';

interface CuotaPendiente {
  id: number;
  mes: number;
  anio: number;
  monto: number;
  saldoPendiente: number;
  estado: string;
}

interface DetalleActividad {
  actividad: string;
  fechaIngreso: string;
  estado: string;
  deudaEnEstaActividad: number;
  cuotasPendientes: CuotaPendiente[];
}

// Definimos la respuesta completa
interface EstadoCuenta {
  cliente: { nombre: string; apellido: string; dni: string };
  resumenFinanciero: { totalDeudaClub: number; totalPagadoHistorico: number };
  detalle: DetalleActividad[];
}

function App() {
  const [idBusqueda, setIdBusqueda] = useState('');
  const [datos, setDatos] = useState<EstadoCuenta | null>(null);
  const [error, setError] = useState('');

  // ESTADOS PARA EL PAGO
  const [cuotaAPagar, setCuotaAPagar] = useState<CuotaPendiente | null>(null);
  const [montoPagar, setMontoPagar] = useState<string>('');
  const [medioPago, setMedioPago] = useState('efectivo');
  const [procesando, setProcesando] = useState(false);
  const [soloDeudas, setSoloDeudas] = useState(false);

  const buscarSocio = async () => {
    try {
      setError('');
      //setDatos(null); 
      const res = await api.get<EstadoCuenta>(`/personas/${idBusqueda}/estado-cuenta`);
      setDatos(res.data);
    } catch (err) {
      console.error(err);
      setError('Socio no encontrado');
      setDatos(null);
    }
  };

  const abrirModalPago = (cuota: CuotaPendiente) => {
    setCuotaAPagar(cuota);
    setMontoPagar(cuota.saldoPendiente.toString()); // Por defecto sugerimos pagar todo
    setMedioPago('efectivo');
  };

  const confirmarPago = async () => {
    if (!cuotaAPagar) return;
    setProcesando(true);
    try {
      await api.post('/pagos', {
        cuotaId: cuotaAPagar.id,
        monto: Number(montoPagar),
        medioPago: medioPago,
        observacion: 'Pago desde Web'
      });
      
      // ¡Éxito! Cerramos modal y REFRESCAMOS los datos
      setCuotaAPagar(null);
      await buscarSocio(); 
      alert("¡Pago registrado con éxito!");
      
    } catch (err) {
      alert("Error al procesar el pago");
      console.error(err);
    } finally {
      setProcesando(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif', position: 'relative' }}>
      <h1>🏊‍♂️ Gestión Club Echesortu</h1>
      
      {/* BUSCADOR */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
        <input 
          type="number" 
          placeholder="ID Socio (ej: 1)" 
          value={idBusqueda}
          onChange={(e) => setIdBusqueda(e.target.value)}
          style={{ padding: '10px', flex: 1, fontSize: '16px' }}
        />
        <button onClick={buscarSocio} style={{ padding: '10px 20px', cursor: 'pointer', display: 'flex', gap: '5px', alignItems: 'center' }}>
          <Search size={18} /> Buscar
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* RESULTADOS */}
      {datos && (
        <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '20px', background: '#fff', color: '#333' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>
            <UserCheck size={32} color="#2563eb" />
            <div>
              <h2 style={{ margin: 0 }}>{datos.cliente.nombre} {datos.cliente.apellido}</h2>
              <small>DNI: {datos.cliente.dni}</small>
            </div>
          </div>

          {/* TARJETAS DE SALDO */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <div style={{ background: '#fee2e2', padding: '15px', borderRadius: '8px', color: '#991b1b' }}>
              <h3>💰 Deuda Total</h3>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>
                ${datos.resumenFinanciero.totalDeudaClub}
              </p>
            </div>
            <div style={{ background: '#dcfce7', padding: '15px', borderRadius: '8px', color: '#166534' }}>
              <h3>✅ Pagado Histórico</h3>
              <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>
                ${datos.resumenFinanciero.totalPagadoHistorico}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={soloDeudas} 
                onChange={(e) => setSoloDeudas(e.target.checked)} 
              />
              Mostrar solo lo que debe
            </label>
          </div>
          
          <h3>Detalle de Deudas:</h3>
          {datos.detalle.map((act, i) => (
            <div key={i} style={{ marginBottom: '1.5rem' }}>
              <strong style={{ fontSize: '1.1rem' }}>{act.actividad}</strong>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {act.cuotasPendientes.map((c, j) => {
                  // 1. Detectamos si es Saldo a Favor (negativo) o Deuda (positivo)
                  const esSaldoAFavor = c.saldoPendiente < 0;
                  const estaSaldada = c.saldoPendiente <= 0; // 0 o negativo cuenta como "pagado" para el botón

                  // 2. Si activamos el filtro "Solo Deudas", ocultamos los que no deben nada
                  // (Nota: Si tiene saldo a favor, técnicamente NO debe, así que lo ocultamos también si quieres)
                  if (soloDeudas && estaSaldada) {
                    return null;
                  }

                  return (
                    <li key={j} style={{ 
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px', borderBottom: '1px solid #eee', marginTop: '5px',
                      backgroundColor: esSaldoAFavor ? '#f0fdf4' : 'transparent' // Un fondito verde suave si hay crédito
                    }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        {/* Ícono según estado */}
                        {estaSaldada ? <CheckCircle size={20} color="green" /> : <X size={20} color="red" />}
                        
                        <span>
                          Cuota <b>{c.mes}/{c.anio}</b>
                          <span style={{ marginLeft: '10px' }}>
                            {esSaldoAFavor ? (
                              // CASO A FAVOR (VERDE)
                              <b style={{ color: '#16a34a' }}>
                                Saldo a favor: ${Math.abs(c.saldoPendiente)}
                              </b>
                            ) : (
                              // CASO DEUDA (ROJO)
                              <>
                                Debe: <b style={{ color: c.saldoPendiente > 0 ? '#dc2626' : 'black' }}>
                                  ${c.saldoPendiente}
                                </b>
                              </>
                            )}
                          </span>
                        </span>
                      </div>
                      
                      {/* BOTÓN DE PAGO: Solo aparece si hay deuda REAL (mayor a 0) */}
                      {!estaSaldada && (
                        <button 
                          onClick={() => abrirModalPago(c)}
                          style={{ 
                            background: '#2563eb', color: 'white', border: 'none', padding: '8px 15px', 
                            borderRadius: '5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'
                          }}
                        >
                          <CreditCard size={16} /> Pagar
                        </button>
                      )}

                      {/* Si está saldada o a favor, mostramos un texto lindo */}
                      {estaSaldada && <span style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '0.9rem' }}>¡Pagada! 🎉</span>}
                    </li>
                  );
                })}
                {act.cuotasPendientes.length === 0 && <li style={{color: 'green'}}>¡Todo al día! 🎉</li>}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* --- MODAL DE PAGO --- */}
      {cuotaAPagar && (
      <div 
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center',
          zIndex: 1000
        }}
        onClick={() => setCuotaAPagar(null)}
        >
        <div
          style={{ background: 'white', padding: '2rem', borderRadius: '10px', width: '400px', color: 'black' 
          }}
          onClick={(e) => e.stopPropagation()}
          >
          
          {/* ENCABEZADO CON CRUZ DE CIERRE */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '1.5rem',
            borderBottom: '1px solid #eee',
            paddingBottom: '10px'
          }}>
            <h2 style={{ margin: 0 }}>
              Pagar Cuota {cuotaAPagar.mes}/{cuotaAPagar.anio}
            </h2>
            
            <button 
              onClick={() => setCuotaAPagar(null)} 
              style={{ 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '5px',
                borderRadius: '50%',
              }}
              // Efecto hover simple (opcional)
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X size={28} />
            </button>
          </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Monto a Pagar:</label>
              <input 
                type="number" 
                value={montoPagar} 
                onChange={e => setMontoPagar(e.target.value)}
                style={{ width: '100%', padding: '10px', fontSize: '18px' }}
              />
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Medio de Pago:</label>
              <select 
                value={medioPago} 
                onChange={e => setMedioPago(e.target.value)}
                style={{ width: '100%', padding: '10px' }}
              >
                <option value="efectivo">Efectivo 💵</option>
                <option value="transferencia">Transferencia 🏦</option>
                <option value="mercadopago">Mercado Pago 📲</option>
              </select>
            </div>

            <button 
              onClick={confirmarPago} 
              disabled={procesando}
              style={{ 
                width: '100%', padding: '15px', background: '#16a34a', color: 'white', 
                border: 'none', borderRadius: '5px', fontSize: '16px', fontWeight: 'bold', cursor: 'pointer',
                opacity: procesando ? 0.7 : 1
              }}
            >
              {procesando ? 'Procesando...' : 'Confirmar Pago'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default App;
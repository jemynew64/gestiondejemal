import { useState, useEffect } from "react";
import FormularioTransaccion from "./components/FormularioTransaccion"; // Importa el componente
import BalanceContable from "./components/BalanceContable"; // Asegúrate de importar el componente
import ResumenFiscal from "./components/ResumenFiscal"; // Asegúrate de que la ruta sea correcta

function App() {
  const [transacciones, setTransacciones] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [cuentas, setCuentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [clientesProveedores, setClientesProveedores] = useState([]);

  const [vistaActiva, setVistaActiva] = useState("balanceResumen"); // "balanceResumen" o "transaccionesMovimientos"

  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState(null);
  const [nuevoMovimiento, setNuevoMovimiento] = useState({
    cuenta_descripcion_id: "",
    debe: "",
    haber: "",
  });

  const IGV_RATE = 0.18; // Tasa del IGV

  const mostrarBalanceResumen = () => {
    setVistaActiva("balanceResumen");
  };

  const mostrarTransaccionesMovimientos = () => {
    setVistaActiva("transaccionesMovimientos");
  };

  // Cargar datos desde json-server
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transRes, movRes, cuentasRes, clientesProveedoresRes] =
          await Promise.all([
            fetch("http://localhost:3001/transacciones"),
            fetch("http://localhost:3001/movimientos"),
            fetch("http://localhost:3001/cuenta_descripcion"),
            fetch("http://localhost:3001/clientes_proveedores"), // Carga clientes_proveedores
          ]);

        const transData = await transRes.json();
        const movData = await movRes.json();
        const cuentasData = await cuentasRes.json();
        const clientesProveedoresData = await clientesProveedoresRes.json();

        setTransacciones(transData);
        setMovimientos(movData);
        setCuentas(cuentasData);
        setClientesProveedores(clientesProveedoresData); // Guarda en el estado

        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar movimientos según la transacción seleccionada
  const movimientosRelacionados = transaccionSeleccionada
    ? movimientos.filter((m) => m.transaccion_id === transaccionSeleccionada.id)
    : [];

  // Función para eliminar un movimiento
  const eliminarMovimiento = async (id) => {
    try {
      const res = await fetch(`http://localhost:3001/movimientos/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setMovimientos(movimientos.filter((m) => m.id !== id)); // Actualizar estado para eliminar el movimiento de la UI
      } else {
        console.error("Error al eliminar movimiento");
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  // Generar movimientos automáticos según el tipo de transacción
  // Agregar lógica para pagos y cobros
  const generarMovimientosAutomaticos = async (valorDebe, tipoOperacion) => {
    if (!transaccionSeleccionada) {
      alert("Selecciona una transacción primero.");
      return;
    }

    const igv = valorDebe * IGV_RATE; // Cálculo del IGV
    let movimientosAutomaticos = [];

    if (tipoOperacion === "compra") {
      // Compra de libros
      movimientosAutomaticos = [
        {
          transaccion_id: transaccionSeleccionada.id,
          cuenta_descripcion_id: 4, // Compras (60)
          debe: valorDebe,
          haber: null,
        },
        {
          transaccion_id: transaccionSeleccionada.id,
          cuenta_descripcion_id: 2, // IGV (40)
          debe: igv,
          haber: null,
        },
        {
          transaccion_id: transaccionSeleccionada.id,
          cuenta_descripcion_id: 6, // Cuentas por pagar (42)
          debe: null,
          haber: valorDebe + igv, // Total (base + IGV)
        },
      ];
    } else if (tipoOperacion === "venta") {
      // Venta de libros
      movimientosAutomaticos = [
        {
          transaccion_id: transaccionSeleccionada.id,
          cuenta_descripcion_id: 1, // Cuentas por cobrar (12)
          debe: valorDebe + igv,
          haber: null,
        },
        {
          transaccion_id: transaccionSeleccionada.id,
          cuenta_descripcion_id: 2, // IGV (40)
          debe: null,
          haber: igv,
        },
        {
          transaccion_id: transaccionSeleccionada.id,
          cuenta_descripcion_id: 3, // Ventas (70)
          debe: null,
          haber: valorDebe,
        },
      ];
    } else if (tipoOperacion === "pago_compra") {
      // Pago de compra
      movimientosAutomaticos = [
        {
          transaccion_id: transaccionSeleccionada.id,
          cuenta_descripcion_id: 6, // Cuentas por pagar (42)
          debe: valorDebe + igv, // Total a pagar (base + IGV)
          haber: null,
        },
        {
          transaccion_id: transaccionSeleccionada.id,
          cuenta_descripcion_id: 5, // Efectivo o Cuenta Corriente (10)
          debe: null,
          haber: valorDebe + igv, // Pago total
        },
      ];
    } else if (tipoOperacion === "cobro_venta") {
      // Cobro de venta
      movimientosAutomaticos = [
        {
          transaccion_id: transaccionSeleccionada.id,
          cuenta_descripcion_id: 5, // Cuentas por cobrar (12)
          debe: valorDebe + igv,
          haber: null, // Cobro total (base + IGV)
        },
        {
          transaccion_id: transaccionSeleccionada.id,
          cuenta_descripcion_id: 1, // Efectivo o Cuenta Corriente (10)
          debe: null, // Cobro recibido
          haber: valorDebe + igv,
        },
      ];
    }

    try {
      // Esperar y enviar los movimientos solo después de que la transacción esté configurada
      for (let movimiento of movimientosAutomaticos) {
        console.log("Creando movimiento:", movimiento);

        const res = await fetch("http://localhost:3001/movimientos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(movimiento),
        });

        if (res.ok) {
          const movimientoCreado = await res.json();
          setMovimientos((prev) => [...prev, movimientoCreado]);
        } else {
          console.error("Error al guardar movimiento:", movimiento);
        }
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  // Agregar un movimiento manual
  const agregarMovimiento = async () => {
    if (!transaccionSeleccionada) {
      alert("Selecciona una transacción primero.");
      return;
    }

    if (
      !nuevoMovimiento.cuenta_descripcion_id ||
      (!nuevoMovimiento.debe && !nuevoMovimiento.haber)
    ) {
      alert("Completa todos los campos del movimiento.");
      return;
    }

    const nuevo = {
      transaccion_id: transaccionSeleccionada.id,
      cuenta_descripcion_id: parseInt(nuevoMovimiento.cuenta_descripcion_id),
      debe: nuevoMovimiento.debe ? parseFloat(nuevoMovimiento.debe) : null,
      haber: nuevoMovimiento.haber ? parseFloat(nuevoMovimiento.haber) : null,
    };

    try {
      const res = await fetch("http://localhost:3001/movimientos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo),
      });

      if (res.ok) {
        const movimientoCreado = await res.json();
        setMovimientos([...movimientos, movimientoCreado]);
        setNuevoMovimiento({ cuenta_descripcion_id: "", debe: "", haber: "" });
      } else {
        console.error("Error al agregar movimiento.");
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  const handleCrearTransaccion = (transaccion) => {
    setTransacciones([...transacciones, transaccion]);
  };

  if (loading) {
    return <div className="p-4">Cargando datos...</div>;
  }

  return (
    <div className="p-6 max-w-screen-lg mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Gestión de Contabilidad
      </h1>

      {/* Botones de navegación */}
      <div className="mb-6 flex space-x-4">
        <button
          onClick={mostrarBalanceResumen}
          className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition duration-300"
        >
          Ver Balance y Resumen Fiscal
        </button>
        <button
          onClick={mostrarTransaccionesMovimientos}
          className="bg-green-500 text-white py-2 px-4 rounded-lg shadow hover:bg-green-600 transition duration-300"
        >
          Gestionar Transacciones y Movimientos
        </button>
      </div>

      {/* Mostrar contenido basado en la vista activa */}
      {vistaActiva === "balanceResumen" && (
        <div className="space-y-6">
          {/* Mostrar el Balance Contable y Resumen Fiscal */}
          <BalanceContable cuentas={cuentas} movimientos={movimientos} />
          <ResumenFiscal
            transacciones={transacciones}
            movimientos={movimientos}
            cuentas={cuentas}
          />
        </div>
      )}

      {vistaActiva === "transaccionesMovimientos" && (
        <div className="space-y-6">
          {/* Mostrar Nueva Transacción, Movimientos y Generación de movimientos */}
          <FormularioTransaccion onCrearTransaccion={handleCrearTransaccion} />

          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            Transacciones
          </h2>
          <ul className="space-y-2">
            {transacciones.map((t) => {
              const clienteProveedor = clientesProveedores.find(
                (cp) => cp.id === t.cliente_proveedor_id
              ); // Encuentra el cliente o proveedor

              return (
                <li
                  key={t.id}
                  onClick={() => setTransaccionSeleccionada(t)}
                  className={`p-3 border rounded-lg cursor-pointer transition-all duration-300 ${
                    transaccionSeleccionada?.id === t.id
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                  }`}
                >
                  {t.fecha} - {t.descripcion} -{" "}
                  {clienteProveedor ? clienteProveedor.nombre : "Sin asignar"}
                </li>
              );
            })}
          </ul>

          {transaccionSeleccionada && (
            <div className="space-y-6">
              {/* Movimientos relacionados con la transacción seleccionada */}
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                Movimientos para: {transaccionSeleccionada.descripcion}
              </h2>
              <table className="table-auto w-full border-collapse border border-gray-300 mb-4">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Cuenta</th>
                    <th className="border p-2">Descripción</th>
                    <th className="border p-2">Debe</th>
                    <th className="border p-2">Haber</th>
                    <th className="border p-2">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {movimientosRelacionados.map((m) => {
                    const cuenta = cuentas.find(
                      (c) => c.id === m.cuenta_descripcion_id
                    );
                    return (
                      <tr key={m.id} className="hover:bg-gray-50">
                        <td className="border p-2">
                          {cuenta ? cuenta.cuenta : "Sin cuenta"}
                        </td>
                        <td className="border p-2">
                          {cuenta ? cuenta.descripcion : "Sin descripción"}
                        </td>
                        <td className="border p-2">{m.debe}</td>
                        <td className="border p-2">{m.haber}</td>
                        <td className="border p-2">
                          <button
                            onClick={() => eliminarMovimiento(m.id)}
                            className="bg-red-500 text-white py-1 px-3 rounded-lg shadow hover:bg-red-600 transition duration-300"
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Generar Movimiento Automático */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Generar Movimiento Automático para venta o compra
                </h2>
                <div className="flex space-x-4">
                  <input
                    type="number"
                    step="0.01"
                    value={nuevoMovimiento.debe}
                    onChange={(e) =>
                      setNuevoMovimiento({
                        ...nuevoMovimiento,
                        debe: e.target.value,
                      })
                    }
                    className="border p-2 rounded-lg w-full"
                    placeholder="Monto base (Debe para compras o ventas)"
                  />
                  <select
                    onChange={(e) =>
                      generarMovimientosAutomaticos(
                        parseFloat(nuevoMovimiento.debe),
                        e.target.value
                      )
                    }
                    className="border p-2 rounded-lg w-full"
                  >
                    <option value="">Selecciona operación</option>
                    <option value="compra">Compra</option>
                    <option value="venta">Venta</option>
                    <option value="pago_compra">Pago Compra</option>
                    <option value="cobro_venta">Cobro Venta</option>
                  </select>
                </div>
              </div>

              {/* Agregar nuevo movimiento manual */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  Nuevo Movimiento Manual
                </h2>
                <div className="flex space-x-4">
                  <select
                    value={nuevoMovimiento.cuenta_descripcion_id}
                    onChange={(e) =>
                      setNuevoMovimiento({
                        ...nuevoMovimiento,
                        cuenta_descripcion_id: e.target.value,
                      })
                    }
                    className="border p-2 rounded-lg w-full"
                  >
                    <option value="">Selecciona una cuenta</option>
                    {cuentas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.cuenta} - {c.descripcion}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    value={nuevoMovimiento.debe}
                    onChange={(e) =>
                      setNuevoMovimiento({
                        ...nuevoMovimiento,
                        debe: e.target.value,
                        haber: "",
                      })
                    }
                    className="border p-2 rounded-lg w-full"
                    placeholder="Debe"
                  />
                  <input
                    type="number"
                    step="0.01"
                    value={nuevoMovimiento.haber}
                    onChange={(e) =>
                      setNuevoMovimiento({
                        ...nuevoMovimiento,
                        haber: e.target.value,
                        debe: "",
                      })
                    }
                    className="border p-2 rounded-lg w-full"
                    placeholder="Haber"
                  />
                  <button
                    onClick={agregarMovimiento}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg shadow hover:bg-blue-600 transition duration-300"
                  >
                    Agregar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

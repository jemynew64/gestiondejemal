import { useState, useEffect } from "react";

function BalanceContable({ cuentas, movimientos }) {
  const [resultados, setResultados] = useState([]);

  useEffect(() => {
    const balance = cuentas.map((cuenta) => {
      const movimientosCuenta = movimientos.filter(
        (movimiento) => movimiento.cuenta_descripcion_id === cuenta.id
      );

      let totalDebe = 0;
      let totalHaber = 0;
      let saldoDeudor = 0;
      let saldoAcreedor = 0;

      movimientosCuenta.forEach((movimiento) => {
        if (movimiento.debe) totalDebe += movimiento.debe;
        if (movimiento.haber) totalHaber += movimiento.haber;

        // Ajuste de saldos dependiendo del tipo de cuenta
        if (cuenta.id === 1 || cuenta.id === 7) {
          // "Cuentas por cobrar" o "Efectivo o Cuenta Corriente"
          if (movimiento.debe) {
            saldoDeudor += movimiento.debe;
          }
          if (movimiento.haber) {
            saldoAcreedor += movimiento.haber;
          }
        } else if (cuenta.id === 6) {
          // "Cuentas por pagar"
          if (movimiento.debe) {
            saldoAcreedor += movimiento.debe;
          }
          if (movimiento.haber) {
            saldoDeudor += movimiento.haber;
          }
        } else if (cuenta.id === 2) {
          // "IGV"
          if (movimiento.debe) {
            saldoDeudor += movimiento.debe;
          }
          if (movimiento.haber) {
            saldoAcreedor += movimiento.haber;
          }
        } else if (cuenta.id === 3) {
          // "Ventas"
          if (movimiento.debe) {
            saldoDeudor += movimiento.debe;
          }
          if (movimiento.haber) {
            saldoAcreedor += movimiento.haber;
          }
        } else if (cuenta.id === 4) {
          // "Compras"
          if (movimiento.debe) {
            saldoDeudor += movimiento.debe;
          }
          if (movimiento.haber) {
            saldoAcreedor += movimiento.haber;
          }
        } else if (cuenta.id === 5) {
          // "Efectivo"
          if (movimiento.debe) {
            saldoDeudor += movimiento.debe;
          }
          if (movimiento.haber) {
            saldoAcreedor += movimiento.haber;
          }
        }
      });

      // Ajustar la diferencia entre Débito y Crédito para IGV
      if (cuenta.id === 2) {
        if (totalDebe > totalHaber) {
          saldoDeudor = totalDebe - totalHaber;
          saldoAcreedor = 0;
        } else if (totalHaber > totalDebe) {
          saldoAcreedor = totalHaber - totalDebe;
          saldoDeudor = 0;
        } else {
          saldoDeudor = 0;
          saldoAcreedor = 0;
        }
      }

      // Aquí agregamos una lógica para manejar los casos de igual débito y crédito.
      if (totalDebe === totalHaber) {
        saldoDeudor = 0;
        saldoAcreedor = 0;
      }

      return {
        cuenta: cuenta.cuenta,
        descripcion: cuenta.descripcion,
        debe: totalDebe,
        haber: totalHaber,
        saldoDeudor,
        saldoAcreedor,
      };
    });

    setResultados(balance);
  }, [cuentas, movimientos]);

  // Calcular totales
  const totalDebe = resultados.reduce((acc, cuenta) => acc + cuenta.debe, 0);
  const totalHaber = resultados.reduce((acc, cuenta) => acc + cuenta.haber, 0);
  const totalDeudor = resultados.reduce(
    (acc, cuenta) => acc + cuenta.saldoDeudor,
    0
  );
  const totalAcreedor = resultados.reduce(
    (acc, cuenta) => acc + cuenta.saldoAcreedor,
    0
  );

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">Balance Contable</h2>
      <table className="table-auto w-full border-collapse border border-gray-300 mb-4">
        <thead>
          <tr>
            <th className="border p-2">Cuenta</th>
            <th className="border p-2">Nombre</th>
            <th className="border p-2">Débito</th>
            <th className="border p-2">Crédito</th>
            <th className="border p-2">Deudor</th>
            <th className="border p-2">Acreedor</th>
          </tr>
        </thead>
        <tbody>
          {resultados.map((resultado) => (
            <tr key={resultado.cuenta}>
              <td className="border p-2">{resultado.cuenta}</td>
              <td className="border p-2">{resultado.descripcion}</td>
              <td className="border p-2">{resultado.debe.toFixed(2)}</td>
              <td className="border p-2">{resultado.haber.toFixed(2)}</td>
              <td className="border p-2">{resultado.saldoDeudor.toFixed(2)}</td>
              <td className="border p-2">
                {resultado.saldoAcreedor.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="2" className="border p-2 font-bold">
              Totales
            </td>
            <td className="border p-2">{totalDebe.toFixed(2)}</td>
            <td className="border p-2">{totalHaber.toFixed(2)}</td>
            <td className="border p-2">{totalDeudor.toFixed(2)}</td>
            <td className="border p-2">{totalAcreedor.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default BalanceContable;

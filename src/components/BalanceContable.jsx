import { useState, useEffect } from "react";

function BalanceContable({ cuentas, movimientos }) {
  const [resultados, setResultados] = useState([]);

  useEffect(() => {
    // Definimos una función para manejar la lógica de saldos de forma simplificada
    const procesarSaldo = (totalDebe, totalHaber) => {
      let saldoDeudor = 0;
      let saldoAcreedor = 0;

      if (totalDebe > totalHaber) {
        saldoDeudor = totalDebe - totalHaber;
      } else if (totalHaber > totalDebe) {
        saldoAcreedor = totalHaber - totalDebe;
      }

      return { saldoDeudor, saldoAcreedor };
    };

    const balance = cuentas.map((cuenta) => {
      // Filtrar los movimientos que pertenecen a esta cuenta
      const movimientosCuenta = movimientos.filter(
        (movimiento) => movimiento.cuenta_descripcion_id === cuenta.id
      );

      let totalDebe = 0;
      let totalHaber = 0;

      // Procesar todos los movimientos asociados a la cuenta
      movimientosCuenta.forEach((movimiento) => {
        if (movimiento.debe) totalDebe += movimiento.debe;
        if (movimiento.haber) totalHaber += movimiento.haber;
      });

      // Usamos la función generica de procesamiento de saldo
      const { saldoDeudor, saldoAcreedor } = procesarSaldo(
        totalDebe,
        totalHaber
      );

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

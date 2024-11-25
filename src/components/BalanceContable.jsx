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
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Balance Contable
      </h2>
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="py-3 px-4 text-left font-medium">Cuenta</th>
            <th className="py-3 px-4 text-left font-medium">Nombre</th>
            <th className="py-3 px-4 text-right font-medium">Débito</th>
            <th className="py-3 px-4 text-right font-medium">Crédito</th>
            <th className="py-3 px-4 text-right font-medium">Deudor</th>
            <th className="py-3 px-4 text-right font-medium">Acreedor</th>
          </tr>
        </thead>
        <tbody>
          {resultados.map((resultado) => (
            <tr
              key={resultado.cuenta}
              className="border-t border-gray-200 hover:bg-gray-50"
            >
              <td className="py-3 px-4">{resultado.cuenta}</td>
              <td className="py-3 px-4">{resultado.descripcion}</td>
              <td className="py-3 px-4 text-right">
                {resultado.debe.toFixed(2)}
              </td>
              <td className="py-3 px-4 text-right">
                {resultado.haber.toFixed(2)}
              </td>
              <td className="py-3 px-4 text-right">
                {resultado.saldoDeudor.toFixed(2)}
              </td>
              <td className="py-3 px-4 text-right">
                {resultado.saldoAcreedor.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot className="bg-gray-100 text-gray-700">
          <tr>
            <td colSpan="2" className="py-3 px-4 font-bold text-left">
              Totales
            </td>
            <td className="py-3 px-4 text-right font-bold">
              {totalDebe.toFixed(2)}
            </td>
            <td className="py-3 px-4 text-right font-bold">
              {totalHaber.toFixed(2)}
            </td>
            <td className="py-3 px-4 text-right font-bold">
              {totalDeudor.toFixed(2)}
            </td>
            <td className="py-3 px-4 text-right font-bold">
              {totalAcreedor.toFixed(2)}
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

export default BalanceContable;

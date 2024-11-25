const ResumenFiscal = ({ transacciones, movimientos, cuentas }) => {
  // Calcular el total de las compras, ventas, y el IGV
  const calcularTotalPagar = () => {
    let totalCompras = 0;
    let totalVentas = 0;
    let totalIGVCompras = 0;
    let totalIGVVentas = 0;

    // Calcular totales
    movimientos.forEach((movimiento) => {
      if (movimiento.cuenta_descripcion_id === 4) {
        totalCompras += movimiento.debe || 0;
      }
      if (movimiento.cuenta_descripcion_id === 3) {
        totalVentas += movimiento.haber || 0;
      }
      if (movimiento.cuenta_descripcion_id === 2) {
        if (movimiento.debe) {
          totalIGVCompras += movimiento.debe || 0;
        }
        if (movimiento.haber) {
          totalIGVVentas += movimiento.haber || 0;
        }
      }
    });

    return {
      totalCompras,
      totalVentas,
      totalIGVCompras,
      totalIGVVentas,
    };
  };

  const { totalCompras, totalVentas, totalIGVCompras, totalIGVVentas } =
    calcularTotalPagar();

  // Calcular el saldo a pagar o a favor del IGV
  const saldoIGV = totalIGVVentas - totalIGVCompras;

  // Total neto a pagar (compras + IGV sobre compras)
  const totalNetoPagar = totalVentas + totalIGVVentas;

  // Calcular las cuentas por cobrar y por pagar
  let cuentasPorCobrar = 0;
  let cuentasPorPagar = 0;

  movimientos.forEach((movimiento) => {
    if (movimiento.cuenta_descripcion_id === 1) {
      cuentasPorCobrar += movimiento.debe || 0;
    }
    if (movimiento.cuenta_descripcion_id === 6) {
      cuentasPorPagar += movimiento.debe || 0;
    }
  });

  // Determinar el estado financiero (positivo o negativo)
  const saldoGeneral = cuentasPorCobrar - cuentasPorPagar;

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Resumen Fiscal y de Pago
      </h2>

      {/* Resumen general en tarjetas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Compras */}
        <div className="bg-yellow-100 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-yellow-800">Compras</h3>
          <p className="text-xl text-yellow-700">
            Total Compras: S/ {totalCompras.toFixed(2)}
          </p>
          <p className="text-yellow-600">
            IGV sobre Compras: S/ {totalIGVCompras.toFixed(2)}
          </p>
        </div>

        {/* Ventas */}
        <div className="bg-green-100 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-green-800">Ventas</h3>
          <p className="text-xl text-green-700">
            Total Ventas: S/ {totalVentas.toFixed(2)}
          </p>
          <p className="text-green-600">
            Total a Pagar con IGV: S/ {totalNetoPagar.toFixed(2)}
          </p>
        </div>
      </div>

      {/* IGV Resumen */}
      <div
        className={`p-4 rounded-lg shadow-md ${
          saldoIGV > 0 ? "bg-red-100" : "bg-green-100"
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-800">IGV</h3>
        <p
          className={`text-xl font-semibold ${
            saldoIGV > 0 ? "text-red-600" : "text-green-600"
          }`}
        >
          {saldoIGV > 0
            ? `IGV a Pagar: S/ ${saldoIGV.toFixed(2)}`
            : `IGV a Favor: S/ ${Math.abs(saldoIGV).toFixed(2)}`}
        </p>
      </div>

      {/* Resumen de Cuentas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-100 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-blue-800">
            Cuentas por Cobrar
          </h3>
          <p className="text-xl text-blue-700">
            S/ {cuentasPorCobrar.toFixed(2)}
          </p>
        </div>

        <div className="bg-red-100 p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-red-800">
            Cuentas por Pagar
          </h3>
          <p className="text-xl text-red-700">
            S/ {cuentasPorPagar.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Saldo General */}
      <div
        className={`p-4 rounded-lg shadow-md ${
          saldoGeneral >= 0 ? "bg-green-50" : "bg-red-50"
        }`}
      >
        <h3 className="text-lg font-semibold text-gray-800">Saldo Neto</h3>
        <p
          className={`text-xl font-semibold ${
            saldoGeneral >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {saldoGeneral >= 0
            ? `Saldo Positivo: S/ ${saldoGeneral.toFixed(2)}`
            : `Saldo Negativo: S/ ${Math.abs(saldoGeneral).toFixed(2)}`}
        </p>
      </div>
    </div>
  );
};

export default ResumenFiscal;

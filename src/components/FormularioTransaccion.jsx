import { useState } from "react";

function FormularioTransaccion({ onCrearTransaccion }) {
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!descripcion || !fecha) {
      alert("Por favor, completa todos los campos.");
      return;
    }

    const nuevaTransaccion = { descripcion, fecha };

    try {
      // Enviar la transacción al servidor
      const res = await fetch("http://localhost:3001/transacciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevaTransaccion),
      });

      if (res.ok) {
        const transaccionCreada = await res.json();
        onCrearTransaccion(transaccionCreada); // Actualizar el estado de la App
        setDescripcion("");
        setFecha("");
      } else {
        console.error("Error al guardar la transacción en el servidor.");
      }
    } catch (error) {
      console.error("Error de red:", error);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto bg-white p-6 rounded-lg shadow-lg"
    >
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">
        Nueva Transacción
      </h2>

      {/* Descripción */}
      <div className="mb-4">
        <label
          htmlFor="descripcion"
          className="block text-gray-700 font-medium mb-2"
        >
          Descripción
        </label>
        <input
          id="descripcion"
          type="text"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción de la transacción"
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Fecha */}
      <div className="mb-6">
        <label htmlFor="fecha" className="block text-gray-700 font-medium mb-2">
          Fecha
        </label>
        <input
          id="fecha"
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Botón de Enviar */}
      <button
        type="submit"
        className="w-full py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition duration-300 ease-in-out"
      >
        Crear Transacción
      </button>
    </form>
  );
}

export default FormularioTransaccion;

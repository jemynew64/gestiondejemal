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
    <form onSubmit={handleSubmit} className="mb-4">
      <h2 className="text-xl font-semibold mb-2">Nueva Transacción</h2>
      <input
        type="text"
        value={descripcion}
        onChange={(e) => setDescripcion(e.target.value)}
        placeholder="Descripción"
        className="border p-2 rounded mb-2 w-full"
      />
      <input
        type="date"
        value={fecha}
        onChange={(e) => setFecha(e.target.value)}
        className="border p-2 rounded mb-2 w-full"
      />
      <button type="submit" className="bg-blue-500 text-white p-2 rounded">
        Crear Transacción
      </button>
    </form>
  );
}

export default FormularioTransaccion;

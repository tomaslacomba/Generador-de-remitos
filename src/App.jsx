import { useState } from 'react';
import jsPDF from 'jspdf';
import './App.css';

function App() {
  const [form, setForm] = useState({
    cliente: '',
    direccion: '',
    localidad: 'San Nicolas de los Arroyos',
    telefono: '',
    fecha: '',
    cuit: ''
  });
  const [productos, setProductos] = useState([
    { descripcion: '', cantidad: '', precio: '' }
  ]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleProductoChange = (index, e) => {
    const nuevosProductos = [...productos];
    nuevosProductos[index][e.target.name] = e.target.value;
    setProductos(nuevosProductos);
  };

  const agregarProducto = () => {
    setProductos([...productos, { descripcion: '', cantidad: '', precio: '' }]);
  };

  const eliminarProducto = (index) => {
    setProductos(productos.filter((_, i) => i !== index));
  };

  const totalGeneral = productos.reduce((acc, prod) => {
    const cantidad = parseFloat(prod.cantidad) || 0;
    const precio = parseFloat(prod.precio) || 0;
    return acc + cantidad * precio;
  }, 0);

  const generarPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Ferretería Guerrina', 20, 20);
    doc.setFontSize(12);
    doc.text('Remito - Documento no válido como factura', 20, 30);
    doc.text(`Fecha: ${form.fecha}`, 150, 30);
    doc.line(10, 35, 200, 35);
    doc.text(`Cliente: ${form.cliente}`, 20, 45);
    doc.text(`Dirección: ${form.direccion}`, 20, 52);
    doc.text(`Localidad: ${form.localidad}`, 20, 59);
    doc.text(`Tel: ${form.telefono}`, 20, 66);
    doc.text(`CUIT: ${form.cuit || ''}`, 120, 66);
    doc.line(10, 70, 200, 70);
    doc.setFontSize(12);
    doc.text('CANTIDAD', 20, 78);
    doc.text('DESCRIPCIÓN', 50, 78);
    doc.text('PRECIO/U', 110, 78);
    doc.text('TOTAL', 150, 78);
    doc.line(10, 80, 200, 80);
    let y = 88;
    productos.forEach((prod) => {
      const cantidad = prod.cantidad ? prod.cantidad : '';
      const descripcion = prod.descripcion ? prod.descripcion : '';
      const precio = prod.precio ? parseFloat(prod.precio) : 0;
      const total = prod.cantidad && prod.precio ? (parseFloat(prod.cantidad) * precio) : '';
      doc.text(String(cantidad), 20, y);
      doc.text(descripcion, 50, y);
      doc.text(precio ? `$${precio.toFixed(2)}` : '', 110, y);
      doc.text(total ? `$${total.toFixed(2)}` : '', 150, y);
      doc.line(10, y + 2, 200, y + 2);
      y += 10;
    });
    doc.setFontSize(13);
    doc.text(`Total general: $${totalGeneral.toFixed(2)}`, 150, y + 10);
    doc.text('Recibí(mos) Conforme', 20, 185);
    doc.text('Firma', 120, 185);
    doc.text('Aclaración', 160, 185);
    doc.line(10, 190, 200, 190);
    const nombreCliente = form.cliente.trim() ? form.cliente.trim().replace(/\s+/g, '_') : 'remito';
    doc.save(`${nombreCliente}.pdf`);
  };

  return (
    <div className="remito-container">
      <h1>Generar Remito</h1>
      <form className="remito-form" onSubmit={e => e.preventDefault()}>
        <label>
          Cliente:
          <input type="text" name="cliente" value={form.cliente} onChange={handleChange} />
        </label>
        <label>
          Dirección:
          <input type="text" name="direccion" value={form.direccion} onChange={handleChange} />
        </label>
        <label>
          Localidad:
          <input type="text" name="localidad" value={form.localidad} onChange={handleChange} />
        </label>
        <label>
          Teléfono:
          <input type="text" name="telefono" value={form.telefono} onChange={handleChange} />
        </label>
        <label>
          Fecha:
          <input type="date" name="fecha" value={form.fecha} onChange={handleChange} />
        </label>
        <label>
          CUIT:
          <input type="text" name="cuit" value={form.cuit || ''} onChange={handleChange} placeholder="Ej: 20-12345678-9" />
        </label>
        <div style={{marginTop: '16px'}}>
          <h3 style={{color:'#222'}}>Productos</h3>
          <div style={{display:'flex', gap:'8px', alignItems:'flex-end', marginBottom:'4px', fontWeight:'bold', color:'#222'}}>
            <span style={{width:'70px', textAlign:'center'}}>Unidades</span>
            <span style={{width:'120px', textAlign:'center'}}>Producto</span>
            <span style={{width:'60px', textAlign:'center'}}>Precio/U</span>
            <span style={{width:'70px', textAlign:'center'}}>Total</span>
            <span style={{width:'32px'}}></span>
          </div>
          {productos.map((prod, idx) => (
            <div key={idx} style={{display:'flex', gap:'8px', alignItems:'center', marginBottom:'8px'}}>
              <input
                type="number"
                name="cantidad"
                min="1"
                value={prod.cantidad === 0 ? '' : prod.cantidad}
                onChange={e => handleProductoChange(idx, e)}
                placeholder="Unidades"
                style={{width:'70px'}}
              />
              <input
                type="text"
                name="descripcion"
                value={prod.descripcion}
                onChange={e => handleProductoChange(idx, e)}
                placeholder="Producto"
                style={{width:'120px'}}
              />
              <input
                type="number"
                name="precio"
                min="0"
                step="0.01"
                value={prod.precio === 0 ? '' : prod.precio}
                onChange={e => handleProductoChange(idx, e)}
                placeholder="Precio/U"
                style={{width:'60px'}}
              />
              <span style={{fontWeight:'bold', color:'#43a047', width:'70px', textAlign:'right', display:'inline-block'}}>
                {prod.cantidad && prod.precio ? `$${(parseFloat(prod.cantidad) * parseFloat(prod.precio)).toFixed(2)}` : ''}
              </span>
              <button type="button" onClick={() => eliminarProducto(idx)} style={{background:'#e53935', color:'#fff', border:'none', borderRadius:'4px', padding:'4px 8px', cursor:'pointer', width:'32px'}} aria-label="Eliminar producto">&#10006;</button>
            </div>
          ))}
          <button type="button" onClick={agregarProducto} style={{background:'#000000ff', color:'#fff', border:'none', borderRadius:'4px', padding:'6px 12px', cursor:'pointer', marginTop:'8px'}}>Agregar producto</button>
        </div>
      </form>
      <div style={{marginTop:'24px', textAlign:'right', fontWeight:'bold', fontSize:'22px', color:'#1976d2'}}>
        Total general: ${totalGeneral.toFixed(2)}
      </div>
      <button type="button" onClick={generarPDF} style={{marginTop:'24px'}}>Generar PDF</button>
    </div>
  );
}

export default App;
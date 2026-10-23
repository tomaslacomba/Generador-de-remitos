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
    const pageHeight = doc.internal.pageSize.getHeight();
    const tableBottom = pageHeight - 50;
    const dibujarEncabezadoTabla = (headerY) => {
      doc.setFontSize(12);
      doc.text('CANTIDAD', 20, headerY);
      doc.text('DESCRIPCIÓN', 50, headerY);
      doc.text('PRECIO/U', 110, headerY);
      doc.text('TOTAL', 150, headerY);
      doc.line(10, headerY + 2, 200, headerY + 2);
    };
    dibujarEncabezadoTabla(78);
    let y = 88;
    productos.forEach((prod) => {
      const cantidad = prod.cantidad ? prod.cantidad : '';
      const descripcion = prod.descripcion ? prod.descripcion : '';
      const precio = prod.precio ? parseFloat(prod.precio) : 0;
      const total = prod.cantidad && prod.precio ? (parseFloat(prod.cantidad) * precio) : '';
      const descLines = doc.splitTextToSize(descripcion, 55);
      let lineIndex = 0;
      let lastLineY = y;

      while (lineIndex < descLines.length) {
        if (y > tableBottom) {
          doc.addPage();
          dibujarEncabezadoTabla(20);
          y = 30;
        }

        const availableLines = Math.floor((tableBottom - y) / 6) + 1;
        const linesOnPage = Math.min(availableLines, descLines.length - lineIndex);
        for (let offset = 0; offset < linesOnPage; offset += 1) {
          const currentLineY = y + offset * 6;
          if (lineIndex === 0 && offset === 0) {
            doc.text(String(cantidad), 20, currentLineY);
            doc.text(precio ? `$${precio.toFixed(2)}` : '', 110, currentLineY);
            doc.text(total ? `$${total.toFixed(2)}` : '', 150, currentLineY);
          }
          doc.text(descLines[lineIndex + offset], 50, currentLineY);
          lastLineY = currentLineY;
        }

        lineIndex += linesOnPage;
        y = lastLineY + 6;
      }

      doc.line(10, lastLineY + 2, 200, lastLineY + 2);
      y = lastLineY + (descLines.length === 1 ? 10 : 6);
    });

    let sectionY = y;
    if (sectionY + 30 > pageHeight - 15) {
      doc.addPage();
      sectionY = 20;
    }
    doc.setFontSize(13);
    doc.text(`Total general: $${totalGeneral.toFixed(2)}`, 150, sectionY + 10);
    doc.text('Recibí(mos) Conforme', 20, sectionY + 25);
    doc.text('Firma', 120, sectionY + 25);
    doc.text('Aclaración', 160, sectionY + 25);
    doc.line(10, sectionY + 30, 200, sectionY + 30);
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
            <div key={idx} className="remito-producto-row">
              <input
                type="number"
                name="cantidad"
                min="1"
                value={prod.cantidad === 0 ? '' : prod.cantidad}
                onChange={e => handleProductoChange(idx, e)}
                placeholder="Unidades"
                style={{width:'70px'}}
              />
              <textarea
                name="descripcion"
                value={prod.descripcion}
                onChange={e => handleProductoChange(idx, e)}
                placeholder="Producto"
                className="remito-producto-descripcion"
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
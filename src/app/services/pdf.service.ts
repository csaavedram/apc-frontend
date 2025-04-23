// pdf-service.ts
import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  constructor() { }

  generatePdf(orderData: any) {
    const doc = new jsPDF();
    console.log(orderData)

    if (orderData.length === 0) {
      console.error('Order data is empty');
      return;
    }

    // Extract user information from the first order
    const user = orderData[0].order.user;

    // Add title and company information
    const pageWidth = doc.internal.pageSize.getWidth();

    doc.addImage('../../../assets/logo.png', 'PNG', 10, 10, 50, 20); // Use the uploaded image path with rectangular dimensions
    doc.setFontSize(18);
    doc.text(`Factura Nº001-${orderData[0].order.orderId}`, pageWidth / 2, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text('APC Emedicom - RUC: 20517224694', pageWidth / 2, 25, { align: 'center' });
    doc.text('Jr. Enrique Pallardelli 554 - Lima - Comas', pageWidth / 2, 30, { align: 'center' });
    doc.text('Teléfono: (01) 557-6015', pageWidth / 2, 35, { align: 'center' });
    doc.text('Correo: ventas@apcemedicom.com', pageWidth / 2, 40, { align: 'center' });

    // Add client details
    let y = 50;
    doc.setFontSize(14);
    doc.text(`Detalles del Cliente:`, 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Nombre del Cliente: ${user.nombre} ${user.apellido}`, 10, y);
    y += 10;
    doc.text(`DNI/RUC: ${orderData[0].order.documento}`, 10, y);
    y += 10;
    doc.text(`Dirección de Entrega: ${orderData[0].order.streetAddress}`, 10, y);
    y += 10;

    // Add order details
    doc.setFontSize(14);
    doc.text(`Detalles del Pedido:`, 10, y);
    y += 5;
    const orderDetails = orderData.map((order: any) => [
      order.product.nombreProducto,
      order.product.sku,
      order.quantity,
      parseFloat(order.unitPrice).toFixed(2),
      parseFloat(order.totalPrice).toFixed(2)
    ]);

    // Calculate totals
    const deliveryPrice = parseFloat(orderData[0].order.deliveryPrice);
    const totalPrice = orderDetails.reduce((acc: number, curr: any) => acc + parseFloat(curr[4]), 0) + deliveryPrice;
    const opGravada = totalPrice / 1.18;
    const igv = totalPrice - opGravada;

    autoTable(doc, {
      startY: y,
      head: [['Producto', 'SKU', 'Cantidad', 'Precio Unitario', 'Precio Total']],
      body: [
        ...orderDetails,
        [{ content: 'COSTO DELIVERY', colSpan: 4, styles: { halign: 'right' } }, 'S/.'+deliveryPrice.toFixed(2)],
        [{ content: 'OP. GRAVADA', colSpan: 4, styles: { halign: 'right' } }, 'S/.'+opGravada.toFixed(2)],
        [{ content: 'IGV (18%)', colSpan: 4, styles: { halign: 'right' } }, 'S/.'+igv.toFixed(2)],
        [{ content: 'TOTAL', colSpan: 4, styles: { halign: 'right' } }, 'S/.'+totalPrice.toFixed(2)]
      ],
      theme: 'plain', // Change theme to 'plain' to avoid colored stripes
      styles: {
        fillColor: [255, 255, 255], // White background
        textColor: [0, 0, 0], // Black text color
        lineColor: [0, 206, 209], // RGB for #00CED1
      },
      headStyles: {
        fillColor: [0, 206, 209], // RGB for #8C5962
        textColor: [255, 255, 255] // White text color
      }
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    //const totalAmountInWords = NumerosALetras(totalPrice.toFixed(2));
    //doc.setFontSize(12);
    //doc.text(`SON: ${totalAmountInWords}`, 10, y);
    //y += 10;
    //doc.setFontSize(14);
    //doc.text(`Datos del Pago:`, 10, y);
    //y += 10;
    //doc.setFontSize(12);
    //doc.text(`Tipo de Operación: ${orderData[0].order.tipoOperacion}`, 10, y);
    //y += 10;
    // Format date here using Angular's formatDate function
    //const fechaOperacionFormatted = formatDate(orderData[0].order.fechaOperacion, 'dd-MM-yyyy HH:mm:ss', 'en-US');
    //doc.text(`Fecha de Operación: ${fechaOperacionFormatted}`, 10, y);
    //y += 10;
    //doc.text(`Número de Operación: ${orderData[0].order.noperacion}`, 10, y);
    //y += 10;

    // Add footer
    doc.setFontSize(10);
    doc.text('Gracias por su compra!', pageWidth / 2, 285, { align: 'center' });
    doc.text('Alguna consulta con tu compra? Envía un correo a consultas@apcemedicom.com', pageWidth / 2, 290, { align: 'center' });

    // Save the PDF
    doc.save('factura.pdf');
  }

  generatePdfCotizacion(cotizacionData: any) {
    const doc = new jsPDF();



    // Variables for dynamic data
    const fecha = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const clienteNombre = cotizacionData.clienteNombre || 'Nombre del Cliente';
    const clienteRuc = cotizacionData.clienteRuc || '00000000';
    const clienteDireccion = cotizacionData.clienteDireccion || 'Dirección del Cliente';
    const items = cotizacionData.items || [];
    const formaPago = cotizacionData.formaPago || 'CONTADO';
    const plazoEntrega = cotizacionData.plazoEntrega || '05 DÍAS';
    const validezOferta = cotizacionData.validezOferta || '06 DÍAS';
    const total = items.reduce((sum: number, item: any) => sum + item.total, 0);

    // Add logo
    doc.addImage('../../../assets/logo.png', 'PNG', 10, 10, 50, 20);

    // Add header
    doc.setFontSize(12);
    doc.text(`Lima, ${fecha}`, 10, 35);
    doc.setFontSize(12);
    doc.text('Señores:', 10, 40);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`INSTITUTO DE GINECOLOGIA GARLL E.I.R.L.`, 10, 50);
    doc.setFont('helvetica', 'normal');
    doc.text(clienteNombre, 10, 55);
    doc.setTextColor(0, 0, 0); // Blue color for "Presente.-"
    doc.text('Presente', 10, 60);
    doc.setTextColor(0, 0, 0); // Reset to black

    // Add introductory text
    doc.setFontSize(12);
    doc.text(
      'De nuestra más cordial consideración:\n',
      10,
      70
    );
    doc.text(
      'Es sumamente grato dirigirnos a ustedes, para saludarlos muy cordialmente, asimismo',
      10,
      75
    );
    doc.text(
      'remito por medio de la presente nuestra propuesta del siguiente equipamiento:',
      10,
      80
    );

    // Add table
  // const tableData = items.map((item: any, index: number) => [
  //   index + 1,
  //   item.descripcion || 'Descripción no disponible',
  //   item.cantidad || '0',
  //   `S/. ${item.precioUnitario?.toFixed(2) || '0.00'}`,
  //   `S/. ${item.total?.toFixed(2) || '0.00'}`,
  // ]);
  const tableData = [
    [1, 'SABANILLA BLANCA', 1, 'S/. 129.00', 'S/. 129.00'],
    [2, 'GUANTES DE LÁTEX', 2, 'S/. 50.00', 'S/. 100.00'],
    [3, 'ALCOHOL EN GEL', 3, 'S/. 25.00', 'S/. 75.00'],
  ];

    autoTable(doc, {

      startY: 90,
      head: [['ITEM', 'DESCRIPCIÓN', 'CANT', 'PRECIO UNITARIO', 'PRECIO TOTAL']],
      body: tableData,
      theme: 'grid',
      styles: {
        fontSize: 10,
        halign: 'center',
        valign: 'middle',
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [0, 206, 209], // Cyan color
        textColor: [255, 255, 255],
        fontStyle: 'bold',
      },

        columnStyles: {
        1: { halign: 'center' }, // Descripción alineada a la izquierda
      },
    });

    // Add footer details
    let y = (doc as any).lastAutoTable.finalY + 40;
    doc.setFontSize(12);
    doc.text(`PRECIOS INC. I.G.V. : SOLES`, 10, y);
    y += 5;
    doc.text(`FORMA DE PAGO      : ${formaPago}`, 10, y);
    y += 5;
    doc.text(`PLAZO DE ENTREGA   : ${plazoEntrega}`, 10, y);
    y += 5;
    doc.text(`VALIDEZ DE OFERTA  : ${validezOferta}`, 10, y);

    // Add closing text
    y += 10;
    doc.text(
      'Agradeciendo anticipadamente la atención que le brinde la presente, es oportuno',
      10,
      y
    );
    y += 5;
    doc.text(
      'testimoniarle los sentimientos de consideración y estima personal.',
      10,
      y + 5
    );
    y += 15;
    doc.text('Atentamente,', 10, y);

    // Add signature
    y += 20;
    doc.addImage('../../../assets/logo.png', 'PNG', 10, y, 50, 20);
    y += 25;
    doc.setFontSize(10);
    doc.text('DPTO. COMERCIAL', 10, y);

    // Save the PDF
    doc.save('cotizacion.pdf');
  }
}

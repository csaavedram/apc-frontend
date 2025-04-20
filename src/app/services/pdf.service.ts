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
    console.log(cotizacionData);

    if (cotizacionData.length === 0) {
      console.error('Cotizacion data is empty');
      return;
    }

    // Add current date
    const currentDate = new Date().toLocaleDateString('es-PE', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(12);
    doc.text(`Fecha: ${currentDate}`, 10, 10, { align: 'left' });

    // Add title
    doc.setFontSize(18);
    doc.text('Cotización', pageWidth / 2, 20, { align: 'center' });

    // Add client details
    let y = 30;
    doc.setFontSize(14);
    doc.text('Detalles del Cliente:', 10, y);
    y += 10;
    doc.setFontSize(12);
    doc.text(`Nombre del Cliente: Yo`, 10, y);
    y += 10;
    doc.text(`DNI/RUC: 76588310`, 10, y);
    y += 10;
    doc.text(`Dirección: Ca. Los Alarifes 1080`, 10, y);
    y += 10;

    // Add cotización details
    doc.setFontSize(14);
    doc.text('Detalles de la Cotización:', 10, y);
    y += 5;

    // const cotizacionDetails = cotizacionData.items.map((item: any) => [
    //   item.producto,
    //   item.cantidad,
    //   parseFloat(item.precioUnitario).toFixed(2),
    //   parseFloat(item.total).toFixed(2)
    // ]);

    autoTable(doc, {
      startY: y,
      head: [['Producto', 'Cantidad', 'Precio Unitario', 'Total']],
      // body: cotizacionDetails,
      theme: 'grid',
      styles: {
        fontSize: 10,
        halign: 'center'
      },
      headStyles: {
        fillColor: [0, 206, 209],
        textColor: [255, 255, 255]
      }
    });

    y = (doc as any).lastAutoTable.finalY + 10;

    // Add total
    doc.setFontSize(12);
    doc.text(`Total: S/. 800`, 10, y);

    // Save the PDF
    doc.save(`cotizacion.pdf`);
  }
}

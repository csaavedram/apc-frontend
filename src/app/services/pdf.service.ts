// pdf-service.ts
import { Injectable } from '@angular/core';
import { da } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QuotationService } from 'src/app/services/quotation.service';
import { UserService } from 'src/app/services/user.service';
import { QuotationDetailsService } from 'src/app/services/quotation-details.service';
import { UpperCasePipe } from '@angular/common';
import { FacturaService } from './factura.service';
import { FacturaDetailsService } from './factura-details.service';
<<<<<<< HEAD
import { PaymentTermService } from './payment-term.service';
=======
import { NotaCreditoService } from './nota-credito.service';
import { NotaCreditoDetailsService } from './nota-credito-details.service';
>>>>>>> origin/rafael

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor(
    private quotationService: QuotationService,
    private userService: UserService,
    private quotationDetailsService: QuotationDetailsService,
    private facturaService: FacturaService,
    private facturaDetailsService: FacturaDetailsService,
<<<<<<< HEAD
    private paymentTermService: PaymentTermService
=======
    private notaCreditoService: NotaCreditoService,
    private notaCreditoDetailsService: NotaCreditoDetailsService,
>>>>>>> origin/rafael
  ) {}

  generatePdf(orderData: any) {
    const doc = new jsPDF();
    console.log(orderData);

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
    doc.text(`Factura Nº001-${orderData[0].order.orderId}`, pageWidth / 2, 15, {
      align: 'center',
    });
    doc.setFontSize(12);
    doc.text('APC Emedicom - RUC: 20517224694', pageWidth / 2, 25, {
      align: 'center',
    });
    doc.text('Jr. Enrique Pallardelli 554 - Lima - Comas', pageWidth / 2, 30, {
      align: 'center',
    });
    doc.text('Teléfono: (01) 557-6015', pageWidth / 2, 35, { align: 'center' });
    doc.text('Correo: ventas@apcemedicom.com', pageWidth / 2, 40, {
      align: 'center',
    });

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
    doc.text(
      `Dirección de Entrega: ${orderData[0].order.streetAddress}`,
      10,
      y
    );
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
      parseFloat(order.totalPrice).toFixed(2),
    ]);

    // Calculate totals
    const deliveryPrice = parseFloat(orderData[0].order.deliveryPrice);
    const totalPrice =
      orderDetails.reduce(
        (acc: number, curr: any) => acc + parseFloat(curr[4]),
        0
      ) + deliveryPrice;
    const opGravada = totalPrice / 1.18;
    const igv = totalPrice - opGravada;

    autoTable(doc, {
      startY: y,
      head: [
        ['Producto', 'SKU', 'Cantidad', 'Precio Unitario', 'Precio Total'],
      ],
      body: [
        ...orderDetails,
        [
          {
            content: 'COSTO DELIVERY',
            colSpan: 4,
            styles: { halign: 'right' },
          },
          'S/.' + deliveryPrice.toFixed(2),
        ],
        [
          { content: 'OP. GRAVADA', colSpan: 4, styles: { halign: 'right' } },
          'S/.' + opGravada.toFixed(2),
        ],
        [
          { content: 'IGV (18%)', colSpan: 4, styles: { halign: 'right' } },
          'S/.' + igv.toFixed(2),
        ],
        [
          { content: 'TOTAL', colSpan: 4, styles: { halign: 'right' } },
          'S/.' + totalPrice.toFixed(2),
        ],
      ],
      theme: 'plain', // Change theme to 'plain' to avoid colored stripes
      styles: {
        fillColor: [255, 255, 255], // White background
        textColor: [0, 0, 0], // Black text color
        lineColor: [0, 206, 209], // RGB for #00CED1
      },
      headStyles: {
        fillColor: [0, 206, 209], // RGB for #8C5962
        textColor: [255, 255, 255], // White text color
      },
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
    doc.text(
      'Alguna consulta con tu compra? Envía un correo a consultas@apcemedicom.com',
      pageWidth / 2,
      290,
      { align: 'center' }
    );

    // Save the PDF
    doc.save('factura.pdf');
  }

  generatePdfCotizacion(cotizacionId: any) {
    this.quotationService.obtenerQuotation(cotizacionId).subscribe(
      (cotizacionData: any) => {
        const cotizacioDetails = {
          TipoPago: cotizacionData.tipoPago,
          PlazoEn: new Date(cotizacionData.plazoEntrega).toLocaleDateString(
            'es-PE',
            {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }
          ),
          ValidezO: new Date(cotizacionData.validezOferta).toLocaleDateString(
            'es-PE',
            {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            }
          ),
          TotalIGV: cotizacionData.total,
        };
        const userDetails = {
          id: cotizacionData.user.id,
          nombre: cotizacionData.user.nombre,
          apellido: cotizacionData.user.apellido,
          ruc: cotizacionData.user.ruc,
          tipoUsuario: cotizacionData.user.tipoUsuario,
        };
        const razonsocial = cotizacionData.user.username;
        const fullName = `${userDetails.nombre} ${userDetails.apellido}`;
        const ruc = cotizacionData.user.ruc;        
        this.quotationDetailsService.listarQuotationsDetailsByQuotation(cotizacionId).subscribe(
          (quotationDetailsData: any) => {
            const cotizacionesDe = quotationDetailsData.map(
              (item: any, index: number) => {
                // Calculate total price as precioNuevo * cantidad
                const precioUnitario = item.producto === null ? parseFloat(item.precioUnitario) : parseFloat(item.precioNuevo);
                const precioTotal = precioUnitario * item.cantidad;
                
                return [
                  index + 1,
                  item.producto?.nombreProducto || item.tipoServicio,
                  item.cantidad,
                  `S/. ${precioUnitario.toFixed(2)}`,
                  `S/. ${precioTotal.toFixed(2)}`,
                ];
              }
            );

            const doc = new jsPDF();

            const fecha = new Date().toLocaleDateString('es-PE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            const año = new Date().getFullYear();

            doc.addImage('../../../assets/logo.png', 'PNG', 10, 10, 50, 20);

            doc.setFontSize(12);
            doc.text(`Lima, ${fecha}`, 10, 35);
            doc.text(`COT Nº ${cotizacionId} / ${año}`, 150, 35);
            doc.setFontSize(12);
            doc.text('Señores:', 10, 45);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            if (userDetails.tipoUsuario == 'cliente_empresa') {
              doc.text(`${razonsocial.toUpperCase()}`, 10, 50);
            }
            else{
              doc.text(`Presente: ${fullName}`, 10, 60);
            }
            doc.text(`RUC: ${ruc}`, 10, 55);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);

            doc.setFontSize(12);
            doc.text('De nuestra más cordial consideración:\n', 10, 70);
            doc.text(
              'Es sumamente grato dirigirnos a ustedes, para saludarlos muy cordialmente, asimismo',
              10,
              80
            );
            doc.text(
              'remito por medio de la presente nuestra propuesta del siguiente equipamiento:',
              10,
              85
            );

            autoTable(doc, {
              startY: 95,
              head: [
                ['ITEM', 'DESCRIPCIÓN', 'CANT', 'PRECIO UNITARIO', 'PRECIO TOTAL'],
              ],
              body: cotizacionesDe,
              theme: 'grid',
              styles: {
                fontSize: 10,
                halign: 'center',
                valign: 'middle',
                cellPadding: 3,
              },
              headStyles: {
                fillColor: [0, 206, 209],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
              },
              columnStyles: {
                1: { halign: 'center' },
              },
              didDrawPage: () => {
                const pageHeight = doc.internal.pageSize.height;
                doc.setFontSize(10);
                doc.setTextColor(0, 0, 0);
                doc.line(10, 280, 200, 280);
                doc.text(
                  'Jr. Enrique Pallardelli Nº 554 - Urb. San Agustín - Comas / Central Telefónica: (511) 557 - 6015',
                  30,
                  285,
                  { align: 'left' }
                );
                doc.text(
                  'E-mail: apcemedicom@hotmail.com / Celular 970 181 638',
                  60,
                  290,
                  { align: 'left' }
                );
              },
            });

            const finalY = (doc as any).lastAutoTable.finalY;
            const pageHeight = doc.internal.pageSize.height;
            const marginBottom = 20;
            const remainingSpace = pageHeight - finalY - marginBottom;
            const additionalContentHeight = 50;

            let y = finalY + 10;

            if (remainingSpace < additionalContentHeight) {
              doc.addPage();
              y = 20;
            }

            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.text('CONDICIONES GENERALES(S.E.U.O):', 10, y);
            const textWidth = doc.getTextWidth('CONDICIONES GENERALES(S.E.U.O):');
            doc.line(10, y + 1, 10 + textWidth, y + 1);
            y += 8;
            doc.text(`PRECIOS INC. I.G.V. : ${cotizacioDetails.TotalIGV} SOLES`, 10, y);
            y += 5;
            doc.text(`FORMA DE PAGO      : ${cotizacioDetails.TipoPago}`, 10, y);
            y += 5;
            doc.text(`PLAZO DE ENTREGA   : ${cotizacioDetails.PlazoEn}`, 10, y);
            y += 5;
            doc.text(`VALIDEZ DE OFERTA  : ${cotizacioDetails.ValidezO}`, 10, y);

            doc.setFont('helvetica', 'normal');
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

            y += 10;
            doc.addImage('../../../assets/firma.png', 'PNG', 10, y, 50, 50);
            y += 25;

            const pageCount = doc.getNumberOfPages();

            for (let i = 1; i <= pageCount; i++) {
              doc.setPage(i);
              doc.setFontSize(10);
              doc.setTextColor(0, 0, 0);
              doc.line(10, 280, 200, 280);
              doc.text(
                'Jr. Enrique Pallardelli Nº 554 - Urb. San Agustín - Comas / Central Telefónica: (511) 557 - 6015',
                30,
                285,
                { align: 'left' }
              );
              doc.text(
                'E-mail: apcemedicom@hotmail.com / Celular 970 181 638',
                60,
                290,
                { align: 'left' }
              );
            }
            doc.save(`cotizacion-${cotizacionId}.pdf`);
          });
      });
  }

  generatePdfFactura(facturaId: any) {
  this.facturaService.obtenerFactura(facturaId).subscribe((facturaData: any) => {
    this.facturaDetailsService.listarFacturaDetailsPorFactura(facturaId).subscribe((facturaDetails: any) => {
      const doc = new jsPDF();

      const codigoFactura = facturaData.codigo || facturaData.id || facturaId;
      const fecha = new Date().toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc.addImage('../../../assets/logo.png', 'PNG', 10, 10, 50, 20);

      doc.setFontSize(12);
      doc.text(`Lima, ${fecha}`, 10, 35);
      doc.text(`FACTURA Nº ${codigoFactura}`, 150, 35);

      // Datos del cliente
      let y = 45;
      doc.setFontSize(12);
      doc.text('Señores:', 10, y);
      y += 10;
      doc.setFont('helvetica', 'bold');
      const razonSocial = facturaData.user?.razonSocial;
      const nombreCompleto = `${facturaData.user?.nombre || ''} ${facturaData.user?.apellido || ''}`.trim();
      if (razonSocial) {
        doc.text(`${razonSocial.toUpperCase()}`, 10, y);
      } else {
        doc.text(`Presente: ${nombreCompleto}`, 10, y);
      }
      y += 5;
      doc.text(`RUC/DNI: ${(facturaData.user?.ruc || facturaData.user?.dni || '').toUpperCase()}`, 10, y);
      doc.setFont('helvetica', 'normal');
      y += 10;

      // Mensaje cordial
      doc.setFontSize(12);
      doc.text('De nuestra más cordial consideración:\n', 10, y);
      y += 10;
      doc.text(
        'Es sumamente grato dirigirnos a ustedes, para saludarlos muy cordialmente, asimismo',
        10,
        y
      );
      y += 5;
      doc.text('remito por medio de la presente nuestra propuesta del siguiente equipamiento:',
        10,
        y
      );
      y += 10;



      const detallesTabla = facturaDetails.map((item: any, index: number) => [
        index + 1,
        item.producto?.nombreProducto || item.tipoServicio,
        item.cantidad,
        `S/. ${parseFloat(item.precioUnitario).toFixed(2)}`,
        `S/. ${parseFloat(item.precioTotal).toFixed(2)}`
      ]);

      // Totales
      const totalPrice = detallesTabla.reduce((acc: number, curr: any) => acc + parseFloat(curr[4].replace('S/. ', '')), 0);
      const opGravada = totalPrice / 1.18;
      const igv = totalPrice - opGravada;

      // Tabla de productos
      autoTable(doc, {
        startY: y,
        head: [['ITEM', 'DESCRIPCIÓN', 'CANT', 'PRECIO UNITARIO', 'PRECIO TOTAL']],
        body: detallesTabla,
        theme: 'grid',
        styles: {
          fontSize: 10,
          halign: 'center',
          valign: 'middle',
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [0, 206, 209],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        columnStyles: {
          1: { halign: 'center' },
        },
        didDrawPage: () => {
          const pageHeight = doc.internal.pageSize.height;
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.line(10, 280, 200, 280);
          doc.text(
            'Jr. Enrique Pallardelli Nº 554 - Urb. San Agustín - Comas / Central Telefónica: (511) 557 - 6015',
            30,
            285,
            { align: 'left' }
          );
          doc.text(
            'E-mail: apcemedicom@hotmail.com / Celular 970 181 638',
            60,
            290,
            { align: 'left' }
          );
        },
      });

      // --- Salto de página si no hay espacio para totales y firma ---
      let finalY = (doc as any).lastAutoTable.finalY;
      const pageHeight = doc.internal.pageSize.height;
      const marginBottom = 20;
      const additionalContentHeight = 50;
      let yTotales = finalY + 10;

      if (pageHeight - finalY - marginBottom < additionalContentHeight) {
        doc.addPage();
        yTotales = 20;
      }

      // Totales fuera de la tabla
      const labelX = 60;
      const valueX = 190;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('OP. GRAVADA:', labelX, yTotales, { align: 'left' });
      doc.setTextColor(0, 0, 0);
      doc.text(`S/. ${opGravada.toFixed(2)}`, valueX, yTotales, { align: 'right' });

      yTotales += 10;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('IGV (18%):', labelX, yTotales, { align: 'left' });
      doc.setTextColor(0, 0, 0);
      doc.text(`S/. ${igv.toFixed(2)}`, valueX, yTotales, { align: 'right' });

      yTotales += 10;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('TOTAL:', labelX, yTotales, { align: 'left' });
      doc.setFontSize(15);
      doc.setTextColor(0, 0, 0);
      doc.text(`S/. ${totalPrice.toFixed(2)}`, valueX, yTotales, { align: 'right' });

      console.log(facturaData)
      // Apartado de información de crédito SOLO si es de crédito
      if (facturaData.tipoPago === 'Credito') {
        // Obtener los plazos de pago antes de guardar el PDF
        this.paymentTermService.obtenerPlazosPagoPorFactura(facturaId).subscribe((plazos: any) => {
          console.log(plazos);
          if (Array.isArray(plazos) && plazos.length > 0) {
            // Calcular monto pendiente y total de cuotas
            const montoPendiente = plazos.reduce((acc, curr) => acc + (curr.cantidad || 0), 0);
            const totalCuotas = plazos.length;

            // Título
            yTotales += 15;
            doc.setFontSize(13);
            doc.setTextColor(0, 206, 209);
            doc.text('Información del crédito:', 10, yTotales);

            // Monto pendiente y total cuotas
            yTotales += 8;
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            doc.text(`Monto neto pendiente de pago: S/ ${montoPendiente.toFixed(2)}`, 10, yTotales);
            yTotales += 7;
            doc.text(`Total de cuotas: ${totalCuotas}`, 10, yTotales);

            // Encabezado de tabla
            yTotales += 10;
            doc.setFontSize(11);
            doc.setTextColor(255, 255, 255);
            doc.setFillColor(0, 206, 209);
            doc.rect(10, yTotales - 6, 180, 8, 'F');
            doc.text('NºCuota', 15, yTotales);
            doc.text('Fec.Venc', 45, yTotales);
            doc.text('Monto', 85, yTotales);
            doc.text('NºCuota', 110, yTotales);
            doc.text('Fec.Venc', 140, yTotales);
            doc.text('Monto', 180, yTotales, { align: 'right' });

            // Filas de cuotas (máximo 2 por fila)
            doc.setFontSize(11);
            doc.setTextColor(0, 0, 0);
            let rowY = yTotales + 7;
            for (let i = 0; i < Math.ceil(plazos.length / 2); i++) {
              const cuota1 = plazos[i * 2];
              const cuota2 = plazos[i * 2 + 1];
              // Columna 1
              doc.text(`${cuota1?.nroCuota ?? ''}`, 15, rowY);
              doc.text(`${cuota1?.fechaFin ? new Date(cuota1.fechaFin).toLocaleDateString('es-PE') : ''}`, 45, rowY);
              doc.text(`${cuota1?.cantidad ? cuota1.cantidad.toFixed(2) : ''}`, 85, rowY, { align: 'right' });
              // Columna 2
              doc.text(`${cuota2?.nroCuota ?? ''}`, 110, rowY);
              doc.text(`${cuota2?.fechaFin ? new Date(cuota2.fechaFin).toLocaleDateString('es-PE') : ''}`, 140, rowY);
              doc.text(`${cuota2?.cantidad ? cuota2.cantidad.toFixed(2) : ''}`, 180, rowY, { align: 'right' });
              rowY += 8;
            }

            // Footer en todas las páginas
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
              doc.setPage(i);
              doc.setFontSize(10);
              doc.setTextColor(0, 0, 0);
              doc.line(10, 280, 200, 280);
              doc.text(
                'Jr. Enrique Pallardelli Nº 554 - Urb. San Agustín - Comas / Central Telefónica: (511) 557 - 6015',
                30,
                285,
                { align: 'left' }
              );
              doc.text(
                'E-mail: apcemedicom@hotmail.com / Celular 970 181 638',
                60,
                290,
                { align: 'left' }
              );
            }

            doc.save(`factura-${codigoFactura}.pdf`);
          } else {
            // Si no hay plazos, solo guardar el PDF normalmente
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
              doc.setPage(i);
              doc.setFontSize(10);
              doc.setTextColor(0, 0, 0);
              doc.line(10, 280, 200, 280);
              doc.text(
                'Jr. Enrique Pallardelli Nº 554 - Urb. San Agustín - Comas / Central Telefónica: (511) 557 - 6015',
                30,
                285,
                { align: 'left' }
              );
              doc.text(
                'E-mail: apcemedicom@hotmail.com / Celular 970 181 638',
                60,
                290,
                { align: 'left' }
              );
            }
            doc.save(`factura-${codigoFactura}.pdf`);
          }
        });
        return; // Importante: para que no se ejecute el guardado dos veces
      }

      // Footer en todas las páginas (caso contado)
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.line(10, 280, 200, 280);
        doc.text(
          'Jr. Enrique Pallardelli Nº 554 - Urb. San Agustín - Comas / Central Telefónica: (511) 557 - 6015',
          30,
          285,
          { align: 'left' }
        );
        doc.text(
          'E-mail: apcemedicom@hotmail.com / Celular 970 181 638',
          60,
          290,
          { align: 'left' }
        );
      }

      doc.save(`factura-${codigoFactura}.pdf`);
    });
  });
}

  generatePdfNotaCredito(notaCreditoId: any) {
    this.notaCreditoService.obtenerNotaCredito(notaCreditoId).subscribe((notaCreditoData: any) => {
    this.notaCreditoDetailsService.listarNotasCreditoDetailsPorNotaCredito(notaCreditoId).subscribe((notaCreditoDetails: any) => {
      const doc = new jsPDF();

      const codigoNotaCredito = notaCreditoData.codigo || notaCreditoData.id || notaCreditoId;
      const fecha = new Date().toLocaleDateString('es-PE', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

      doc.addImage('../../../assets/logo.png', 'PNG', 10, 10, 50, 20);

      doc.setFontSize(12);
      doc.text(`Lima, ${fecha}`, 10, 35);
      doc.text(`NOTA DE CRÉDITO Nº ${codigoNotaCredito}`, 130, 35);

      // Datos del cliente
      let y = 45;
      doc.setFontSize(12);
      doc.text('Señores:', 10, y);
      y += 10;
      doc.setFont('helvetica', 'bold');
      const razonSocial = notaCreditoData.user?.razonSocial;
      const nombreCompleto = `${notaCreditoData.user?.nombre || ''} ${notaCreditoData.user?.apellido || ''}`.trim();
      if (razonSocial) {
        doc.text(`${razonSocial.toUpperCase()}`, 10, y);
      } else {
        doc.text(`Presente: ${nombreCompleto}`, 10, y);
      }
      y += 5;
      doc.text(`RUC/DNI: ${(notaCreditoData.user?.ruc || notaCreditoData.user?.dni || '').toUpperCase()}`, 10, y);
      doc.setFont('helvetica', 'normal');
      y += 10;

      // Mensaje cordial
      doc.setFontSize(12);
      doc.text('De nuestra más cordial consideración:\n', 10, y);
      y += 10;
      doc.text(
        'Es sumamente grato dirigirnos a ustedes, para saludarlos muy cordialmente, asimismo',
        10,
        y
      );
      y += 5;
      doc.text('remito por medio de la presente nuestra propuesta del siguiente equipamiento:',
        10,
        y
      );
      y += 10;



      const detallesTabla = notaCreditoDetails.map((item: any, index: number) => [
        index + 1,
        item.producto?.nombreProducto || item.tipoServicio,
        item.cantidad,
        `S/. ${parseFloat(item.precioUnitario).toFixed(2)}`,
        `S/. ${parseFloat(item.precioTotal).toFixed(2)}`
      ]);

      // Totales
      const totalPrice = detallesTabla.reduce((acc: number, curr: any) => acc + parseFloat(curr[4].replace('S/. ', '')), 0);
      const opGravada = totalPrice / 1.18;
      const igv = totalPrice - opGravada;

      // Tabla de productos
      autoTable(doc, {
        startY: y,
        head: [['ITEM', 'DESCRIPCIÓN', 'CANT', 'PRECIO UNITARIO', 'PRECIO TOTAL']],
        body: detallesTabla,
        theme: 'grid',
        styles: {
          fontSize: 10,
          halign: 'center',
          valign: 'middle',
          cellPadding: 3,
        },
        headStyles: {
          fillColor: [0, 206, 209],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
        },
        columnStyles: {
          1: { halign: 'center' },
        },
        didDrawPage: () => {
          const pageHeight = doc.internal.pageSize.height;
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          doc.line(10, 280, 200, 280);
          doc.text(
            'Jr. Enrique Pallardelli Nº 554 - Urb. San Agustín - Comas / Central Telefónica: (511) 557 - 6015',
            30,
            285,
            { align: 'left' }
          );
          doc.text(
            'E-mail: apcemedicom@hotmail.com / Celular 970 181 638',
            60,
            290,
            { align: 'left' }
          );
        },
      });

      // --- Salto de página si no hay espacio para totales y firma ---
      let finalY = (doc as any).lastAutoTable.finalY;
      const pageHeight = doc.internal.pageSize.height;
      const marginBottom = 20;
      const additionalContentHeight = 50;
      let yTotales = finalY + 10;

      if (pageHeight - finalY - marginBottom < additionalContentHeight) {
        doc.addPage();
        yTotales = 20;
      }

      // Totales fuera de la tabla
      const labelX = 60;
      const valueX = 190;

      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('OP. GRAVADA:', labelX, yTotales, { align: 'left' });
      doc.setTextColor(0, 0, 0);
      doc.text(`S/. ${opGravada.toFixed(2)}`, valueX, yTotales, { align: 'right' });

      yTotales += 10;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('IGV (18%):', labelX, yTotales, { align: 'left' });
      doc.setTextColor(0, 0, 0);
      doc.text(`S/. ${igv.toFixed(2)}`, valueX, yTotales, { align: 'right' });

      yTotales += 10;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text('TOTAL:', labelX, yTotales, { align: 'left' });
      doc.setFontSize(15);
      doc.setTextColor(0, 0, 0);
      doc.text(`S/. ${totalPrice.toFixed(2)}`, valueX, yTotales, { align: 'right' });

      // Mensaje de cierre y firma
      yTotales += 20;
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(
        'Agradeciendo anticipadamente la atención que le brinde la presente, es oportuno',
        10,
        yTotales
      );
      yTotales += 5;
      doc.text(
        'testimoniarle los sentimientos de consideración y estima personal.',
        10,
        yTotales + 5
      );
      yTotales += 15;
      doc.text('Atentamente,', 10, yTotales);

      yTotales += 10;
      doc.addImage('../../../assets/firma.png', 'PNG', 10, yTotales, 50, 50);

      // Footer en todas las páginas
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.line(10, 280, 200, 280);
        doc.text(
          'Jr. Enrique Pallardelli Nº 554 - Urb. San Agustín - Comas / Central Telefónica: (511) 557 - 6015',
          30,
          285,
          { align: 'left' }
        );
        doc.text(
          'E-mail: apcemedicom@hotmail.com / Celular 970 181 638',
          60,
          290,
          { align: 'left' }
        );
      }

      doc.save(`nota-credito-${codigoNotaCredito}.pdf`);
    });
  });
  }
}

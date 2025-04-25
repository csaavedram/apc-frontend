// pdf-service.ts
import { Injectable } from '@angular/core';
import { da } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { QuotationService } from 'src/app/services/quotation.service';
import { UserService } from 'src/app/services/user.service';
import { QuotationDetailsService } from 'src/app/services/quotation-details.service';
import { UpperCasePipe } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class PdfService {
  constructor(
    private quotationService: QuotationService,
    private userService: UserService,
    private quotationDetailsService: QuotationDetailsService
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
    console.log('Cotizacion ID:', cotizacionId);
    this.quotationService
      .obtenerQuotation(cotizacionId)
      .subscribe((cotizacionData: any) => {
        console.log('Cotizacion Data:', cotizacionData);
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
          id: cotizacionData.user.id, // Asegúrate de que este campo exista en la respuesta
          nombre: cotizacionData.user.nombre, // Asegúrate de que este campo exista en la respuesta
          apellido: cotizacionData.user.apellido, // Asegúrate de que este campo exista en la respuesta
          ruc: cotizacionData.user.ruc, // Asegúrate de que este campo exista en la respuesta
          tipoUsuario: cotizacionData.user.tipoUsuario, // Asegúrate de que este campo exista en la respuesta
        };
        const razonsocial = cotizacionData.user.razonSocial;
        const ruc = cotizacionData.user.ruc;
        const fullName = `${userDetails.nombre} ${userDetails.apellido}`;
        console.log('User Details:', userDetails);
        this.quotationDetailsService
          .listarQuotationsDetailsByQuotation(cotizacionId)
          .subscribe((quotationDetailsData: any) => {
            console.log('Quotation Details Data:', quotationDetailsData);
            // Mapear los datos de cada objeto en el array
            const cotizacionesDe = quotationDetailsData.map(
              (item: any, index: number) => [
                index + 1,
                item.product?.nombreProducto || item.serviceType, // DESCRIPCIÓN: Tipo de servicio o producto
                item.cantidad, // CANT: Cantidad
                `S/. ${parseFloat(item.unitPrice).toFixed(2)}`, // PRECIO UNITARIO: Formateado como moneda
                `S/. ${parseFloat(item.totalPrice).toFixed(2)}`, // PRECIO TOTAL: Formateado como moneda
              ]
            );

            console.log('Cotizaciones De:', cotizacionesDe);

            // Create PDF document
            const doc = new jsPDF();

            // Variables for dynamic data
            const fecha = new Date().toLocaleDateString('es-PE', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
            const año = new Date().getFullYear();

            // Add logo
            doc.addImage('../../../assets/logo.png', 'PNG', 10, 10, 50, 20);

            // Add header
            doc.setFontSize(12);
            doc.text(`Lima, ${fecha}`, 10, 35);
            doc.text(`COT Nº ${cotizacionId} / ${año}`, 150, 35);
            doc.setFontSize(12);
            doc.text('Señores:', 10, 40);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text(`${razonsocial.toUpperCase()}`, 10, 50);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(`RUC: ${ruc.toUpperCase()}`, 10, 55);
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            if (userDetails.tipoUsuario !== 'cliente_empresa') {
              doc.text(`Presente: ${fullName}`, 10, 60);
            }

            // Add introductory text
            doc.setFontSize(12);
            doc.text('De nuestra más cordial consideración:\n', 10, 70);
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

            autoTable(doc, {
              startY: 90,
              head: [
                [
                  'ITEM',
                  'DESCRIPCIÓN',
                  'CANT',
                  'PRECIO UNITARIO',
                  'PRECIO TOTAL',
                ],
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
            doc.text(
              `PRECIOS INC. I.G.V. : ${cotizacioDetails.TotalIGV} SOLES`,
              10,
              y
            );
            y += 5;
            doc.text(
              `FORMA DE PAGO      : ${cotizacioDetails.TipoPago}`,
              10,
              y
            );
            y += 5;
            doc.text(`PLAZO DE ENTREGA   : ${cotizacioDetails.PlazoEn}`, 10, y);
            y += 5;
            doc.text(
              `VALIDEZ DE OFERTA  : ${cotizacioDetails.ValidezO}`,
              10,
              y
            );

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
            doc.addImage('../../../assets/firma.png', 'PNG', 10, y, 50, 50);
            y += 25;

            // Save the PDF
            doc.save('cotizacion.pdf');
          });
      });
  }
}

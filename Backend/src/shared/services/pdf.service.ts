import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { ReceiptData } from '../../modules/interfaces/receipt.interface';

export const generarReciboPDF = (data: ReceiptData, stream: Response) => {
    console.log("--> Iniciando generación de PDF..."); // LOG 1
    try{
        const doc = new PDFDocument({ margin: 50 });

        // Conectamos la salida del PDF directamente a la respuesta del servidor
        doc.pipe(stream);
        console.log("--> Dibujando encabezado..."); // LOG 2
        doc
            .fontSize(20)
            .text('RECIBO DE PAGO', 110, 57)
            .fontSize(10)
            .text(`N°: ${data.nroComprobante}`, 200, 50, { align: 'right' })
            .text(`Fecha: ${data.fecha.toLocaleDateString()}`, 200, 65, { align: 'right' });

        doc.moveDown();
        
        // Validamos que los datos existan para no romper
        const nombre = data.nombreSocio || "Consumidor Final";
        const nro = data.nroSocio || "-";

        doc
            .fontSize(12)
            .text(`Recibimos de: ${nombre}`, 50, 100)
            .text(`Socio N°: ${nro}`, 50, 115);


        // --- TABLA DE DETALLES ---
        console.log("--> Dibujando tabla..."); // LOG 3
        const invoiceTableTop = 150;
        
        // Definimos nuevas posiciones X para que entren 4 columnas
        const colX = {
            mes: 50,
            desc: 130,
            pago: 280,
            importe: 400
        };

        generateHr(doc, invoiceTableTop);
        
        // Cabecera
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Mes', colX.mes, invoiceTableTop + 5);
        doc.text('Concepto', colX.desc, invoiceTableTop + 5);
        doc.text('Abono', colX.pago, invoiceTableTop + 5);
        doc.text('Importe', colX.importe, invoiceTableTop + 5);

        generateHr(doc, invoiceTableTop + 20);

        // Filas
        doc.font('Helvetica');
        let position = invoiceTableTop + 30;

        data.items.forEach((item) => {
            doc.text(item.mes, colX.mes, position);
            doc.text(item.descripcion, colX.desc, position, { width: 140 });
            doc.text(item.formaPago, colX.pago, position);
            doc.text(`$${item.importe}`, colX.importe, position);
            
            position += 20;
        });

        generateHr(doc, position);

        // --- TOTAL ---
        console.log("--> Dibujando total y cerrando..."); // LOG 4
        const totalPosition = position + 10;
        doc
            .fontSize(12)
            .font('Helvetica-Bold')
            .text('TOTAL:', 300, totalPosition)
            .text(`$${data.total}`, 400, totalPosition);
        doc.end();
        console.log("--> PDF Finalizado y enviado al stream."); // LOG 5

    }catch(error: unknown) {
        const msg = error instanceof Error ? error.message : "Error desconocido";
        console.error("CRASH en generarReciboPDF:", msg);
        stream.status(500).json({
            success: false,
            messages: ["Error interno al generar el PDF", msg],
            data: null
        });
        return;
    };
};
    

// Función auxiliar para dibujar líneas separadoras
function generateHr(doc: PDFKit.PDFDocument, y: number) {
    doc
        .strokeColor('#aaaaaa')
        .lineWidth(1)
        .moveTo(50, y)
        .lineTo(550, y)
        .stroke();
}
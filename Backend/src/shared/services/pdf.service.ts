import PDFDocument from 'pdfkit';
import { ReceiptData } from '../../modules/interfaces/receipt.interface';
import path from 'path';

export const generarReciboPDF = (data: ReceiptData):Promise<Buffer> => {
    return new Promise((resolve, reject) => {
        try{
            const doc = new PDFDocument({ margin: 50 });
            const buffers: Buffer[] = [];

            // 1. Capturamos los datos en un array en lugar de mandarlos al response
            doc.on('data', (chunk) => buffers.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(buffers)));
            doc.on('error', (err) => reject(err));

            const logoPath = path.join(process.cwd(), 'public', 'logo-club.png');

            doc
                .image(logoPath, 50, 45, { width: 50 })
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
            const totalPosition = position + 10;
            doc
                .fontSize(12)
                .font('Helvetica-Bold')
                .text('TOTAL:', 300, totalPosition)
                .text(`$${data.total}`, 400, totalPosition);
            doc.end();

        }catch(error: unknown) {
            const msg = error instanceof Error ? error.message : "Error desconocido";
            console.error("CRASH en generarReciboPDF:", msg);
            return;
        };
    });
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
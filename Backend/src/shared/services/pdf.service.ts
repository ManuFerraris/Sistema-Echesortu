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

            // --- TOTAL ---
            const totalPosition = position + 30;
            // 1. Línea separadora fina
            generateHr(doc, totalPosition - 10);
            // 2. Fondo Gris Suave para el bloque de totales (x, y, ancho, alto)
            // Esto le da un toque muy "Pro"
            doc
                .fillColor('#f4f4f4')
                .rect(280, totalPosition - 5, 270, 50) 
                .fill();

            // Volvemos a color negro para el texto
            doc.fillColor('#000000');

            // Definimos columnas alineadas
            // Usamos 'width' y 'align: right' para que los números queden encolumnados perfectos
            const labelX = 290;
            const valueX = 420;
            const colWidth = 120; // Ancho de la columna invisible para alinear

            // A. TOTAL PAGADO (Grande y destacado)
            doc
                .font('Helvetica-Bold')
                .fontSize(14)
                .text('TOTAL PAGADO:', labelX, totalPosition, { width: colWidth, align: 'right' })
                .text(`$ ${data.total}`, valueX, totalPosition, { width: colWidth, align: 'right' });

            // B. SALDO RESTANTE (Más chico, abajo)
            // Lógica visual: Si debe plata (>0), lo ponemos en Rojo. Si está en 0, en Verde o Gris.
            const colorRestante = Number(data.restanPagar) > 0 ? '#cc0000' : '#2e7d32'; // Rojo vs Verde oscuro
            
            doc
                .fillColor(colorRestante)
                .fontSize(10) // Un poco más chico que el total
                .font('Helvetica-Bold')
                .text('Saldo Restante:', labelX, totalPosition + 22, { width: colWidth, align: 'right' })
                .text(`$ ${data.restanPagar}`, valueX, totalPosition + 22, { width: colWidth, align: 'right' });

            // C. Firma (Opcional, un detalle lindo al final)
            doc
                .fillColor('#000000')
                .fontSize(8)
                .font('Helvetica')
                .text('Recibido por: Administración', 50, totalPosition + 25);

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
import PDFDocument  from 'pdfkit';
import path from 'path';
import { EntityManager } from '@mikro-orm/core';
import { Caja } from '../caja';

export class GenerarReporteCierre {
    constructor() {}

    async ejecutar(cajaId: number, em: EntityManager): Promise<Buffer | string> {

        const caja = await em.findOneOrFail(Caja, { id: cajaId }, { populate: ['usuario', 'tickets'] });
        if (!caja) {
            return 'Caja no encontrada';
        };

        if(caja.estado !== 'cerrada') {
            return 'Solo se pueden generar reportes de cajas cerradas';
        };

        let totalEfectivo = 0;
        let totalDigital = 0;

        for (const t of caja.tickets) {
            const medio = t.medioPago?.toUpperCase();
            if (medio === 'EFECTIVO') totalEfectivo += Number(t.montoPagado);
            else totalDigital += Number(t.montoPagado);
        };

        const saldoTeoricoEfectivo = Number(caja.saldoInicial) + totalEfectivo;

        // Dibujar PDF
        return new Promise((resolve, reject) => {
            const doc = new PDFDocument({ margin: 50, size: 'A4' });
            const chunks: Buffer[] = [];

            doc.on('data', chunk => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);

            // --- ENCABEZADO ---
            const logoPath = path.join(process.cwd(), 'public', 'logo-club.png');
            doc.image(logoPath, 50, 45, { width: 50 })
            doc.fontSize(18).font('Helvetica-Bold').text('ARQUEO Y CIERRE DE CAJA', { align: 'center' });
            doc.fontSize(10).font('Helvetica').text('Club Echesortu - Sistema de Gestión', { align: 'center' });
            
            doc.moveDown();
            
            // Línea separadora
            doc.moveTo(50, 100).lineTo(550, 100).stroke();
            doc.moveDown();

            // --- DATOS DE LA SESIÓN ---
            doc.fontSize(12).font('Helvetica-Bold').text('Información de la Sesión');
            doc.fontSize(10).font('Helvetica');
            doc.text(`ID de Caja: #${caja.id}`);
            doc.text(`Operador / Cajero: ${caja.usuario.nombreUsuario}`);
            doc.text(`Apertura: ${caja.fechaApertura.toLocaleString()}`);
            doc.text(`Cierre: ${caja.fechaCierre ? caja.fechaCierre.toLocaleString() : 'N/A'}`);
            doc.moveDown();

            // --- RESUMEN FINANCIERO ---
            doc.fontSize(12).font('Helvetica-Bold').text('Resumen Financiero (Efectivo Físico)');
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica');

            const startX = 50;
            const valueX = 400;

            doc.text('1. Saldo Inicial (Fondo Fijo):', startX, doc.y);
            doc.text(`$ ${caja.saldoInicial}`, valueX, doc.y);
            
            doc.text('2. Recaudación en Efectivo:', startX, doc.y + 15);
            doc.text(`$ ${totalEfectivo}`, valueX, doc.y);
            
            doc.font('Helvetica-Bold');
            doc.text('TOTAL TEÓRICO EN CAJÓN (1 + 2):', startX, doc.y + 20);
            doc.text(`$ ${saldoTeoricoEfectivo}`, valueX, doc.y);
            
            doc.moveDown(2);
            doc.font('Helvetica').text('Recuento Físico Declarado:', startX, doc.y);
            doc.text(`$ ${caja.saldoFinal}`, valueX, doc.y);

            // Resaltar la diferencia
            doc.moveDown();
            const colorDiferencia = caja.diferencia < 0 ? '#dc2626' : (caja.diferencia > 0 ? '#ca8a04' : '#16a34a');
            doc.fillColor(colorDiferencia).font('Helvetica-Bold');
            
            const textoDiferencia = caja.diferencia === 0 ? 'DIFERENCIA (ARQUEO PERFECTO):' : 
                (caja.diferencia < 0 ? 'DIFERENCIA (FALTANTE):' : 'DIFERENCIA (SOBRANTE):');
            
            doc.text(textoDiferencia, startX, doc.y);
            doc.text(`$ ${caja.diferencia}`, valueX, doc.y);
            doc.fillColor('black').font('Helvetica'); // Volver a negro

            doc.moveDown(2);

            // --- RECAUDACIÓN DIGITAL (Informativo) ---
            doc.fontSize(12).font('Helvetica-Bold').text('Otros Ingresos (No Físicos)');
            doc.moveDown(0.5);
            doc.fontSize(10).font('Helvetica');
            doc.text('Transferencias / Tarjetas / MercadoPago:', startX, doc.y);
            doc.text(`$ ${totalDigital}`, valueX, doc.y);
            doc.moveDown(2);

            // --- OBSERVACIONES ---
            if (caja.observaciones) {
                doc.fontSize(12).font('Helvetica-Bold').text('Observaciones:');
                doc.fontSize(10).font('Helvetica').text(caja.observaciones);
                doc.moveDown(2);
            }

            // --- ZONA DE FIRMAS ---
            // Motivo: El cajero imprime esto, lo firma, le abrocha los comprobantes de gastos si hubo, 
            // pone los billetes en una bolsita, y se lo da a administración.
            doc.moveDown(4);
            const firmaY = doc.y;
            
            doc.moveTo(100, firmaY).lineTo(250, firmaY).stroke();
            doc.text('Firma Cajero/Operador', 110, firmaY + 10);

            doc.moveTo(350, firmaY).lineTo(500, firmaY).stroke();
            doc.text('Firma Supervisor/Tesorero', 360, firmaY + 10);

            doc.end();
        });
    };
}
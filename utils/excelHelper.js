const ExcelJS = require('exceljs');

const generarExcelRespaldo = async (datosVentas, datosResumen) => {
    const workbook = new ExcelJS.Workbook();
    
    // HOJA 1: Detalle de Ventas
    const worksheet1 = workbook.addWorksheet('Detalle de Ventas');
    worksheet1.columns = [
        { header: 'Números', key: 'numero', width: 10 },
        { header: 'Cliente', key: 'cliente', width: 25 },
        { header: 'Cédula', key: 'cedula', width: 15 },
        { header: 'Teléfono', key: 'telefono', width: 15 },
        { header: 'Dirección', key: 'direccion', width: 30 },
        { header: 'Fecha', key: 'fecha', width: 20 },
        { header: 'Ticket', key: 'ticket', width: 15 },
        { header: 'Valor', key: 'valor', width: 10 },
        { header: 'Vendedor', key: 'vendedor', width: 20 }
    ];
    worksheet1.addRows(datosVentas);

    // HOJA 2: Resumen Estadístico
    const worksheet2 = workbook.addWorksheet('Resumen Estadístico');
    worksheet2.columns = [
        { header: 'Métrica', key: 'metrica', width: 30 },
        { header: 'Cantidad', key: 'cantidad', width: 15 }
    ];
    worksheet2.addRows([
        { metrica: 'Total de tickets vendidos', cantidad: datosResumen.total_vendidos || 0 },
        { metrica: 'Total de tickets pagados', cantidad: datosResumen.total_pagados || 0 },
        { metrica: 'Total de tickets pendientes', cantidad: datosResumen.total_pendientes || 0 }
    ]);

    return workbook;
};

module.exports = { generarExcelRespaldo };
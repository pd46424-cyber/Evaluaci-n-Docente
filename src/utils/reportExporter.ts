import { Teacher, EvaluationResult } from '../types';

// Export arrays as CSV files
export function exportToCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
    + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Export data to a simulated Excel format (XML Spreadsheet or tab-delimited XLS is recognized natively by Excel)
export function exportToExcel(filename: string, headers: string[], rows: string[][]) {
  // We can write HTML Table structure which Excel opens and styles perfectly
  let excelTemplate = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">`;
  excelTemplate += `<head><meta charset="UTF-8">\n<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Reporte</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->\n`;
  excelTemplate += `<style>
    table { border-collapse: collapse; font-family: sans-serif; }
    th { background-color: #7C3AED; color: #ffffff; font-weight: bold; border: 1px solid #ddd; padding: 10px; }
    td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    tr:nth-child(even) { background-color: #f8fafc; }
  </style></head><body>`;
  
  excelTemplate += `<table>`;
  excelTemplate += `<thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>`;
  excelTemplate += `<tbody>`;
  rows.forEach(row => {
    excelTemplate += `<tr>${row.map(val => `<td>${val}</td>`).join('')}</tr>`;
  });
  excelTemplate += `</tbody></table></body></html>`;

  const blob = new Blob([excelTemplate], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.xls`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Printable PDF layout wrapper
export function printPDFReport(title: string, contentHTML: string) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Por favor habilita las ventanas emergentes (pop-ups) para ver el reporte imprimible.");
    return;
  }
  
  printWindow.document.write(`
    <html>
      <head>
        <title>Reporte - ${title}</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          body { font-family: 'Inter', sans-serif; color: #0f172a; }
          @media print {
            .no-print { display: none !important; }
            body { padding: 0; margin: 0; background: white; }
          }
        </style>
      </head>
      <body class="bg-slate-50 p-8 antialiased">
        <div class="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md border border-slate-100 min-h-[297mm]">
          <!-- Header -->
          <div class="flex justify-between items-center border-b border-slate-200 pb-6 mb-8">
            <div>
              <div class="text-xs font-semibold text-violet-600 tracking-wider uppercase mb-1">EVALUACIÓN DOCENTE INTELIGENTE</div>
              <h1 class="text-2xl font-bold text-slate-800">${title}</h1>
              <p class="text-sm text-slate-500 mt-1">Generado automáticamente el ${new Date().toLocaleDateString('es-MX', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <div class="text-right">
              <span class="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-violet-100 text-violet-700">
                SaaS Premium
              </span>
            </div>
          </div>

          <!-- Body -->
          <div>
            ${contentHTML}
          </div>

          <!-- Footer -->
          <div class="border-t border-slate-200 pt-8 mt-12 flex justify-between items-center text-xs text-slate-400">
            <div>© ${new Date().getFullYear()} Plataforma IntelDocente. Todos los derechos reservados.</div>
            <div>Reporte Confidencial con Firma Apps Script - Google Sheets</div>
          </div>
        </div>

        <!-- Print dialog control bar -->
        <div class="no-print fixed bottom-6 right-6 flex gap-3">
          <button onclick="window.close()" class="px-5 py-2.5 rounded-lg bg-slate-200 hover:bg-slate-300 transition text-slate-800 text-sm font-medium shadow-lg hover:cursor-pointer">
            Cerrar Ventana
          </button>
          <button onclick="window.print()" class="px-5 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 transition text-white text-sm font-medium shadow-lg hover:cursor-pointer">
            Imprimir Reporte (PDF)
          </button>
        </div>
      </body>
    </html>
  `);
  
  printWindow.document.close();
}

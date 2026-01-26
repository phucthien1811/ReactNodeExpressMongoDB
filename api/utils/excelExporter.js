import ExcelJS from 'exceljs';

/**
 * @param {Object} config 
 * @param {string} config.fileName 
 * @param {string} config.sheetName 
 * @param {Array} config.headers 
 * @param {Array} config.columns 
 * @param {Array} config.data
 * @param {Object} config.styles 
 * @returns {Promise<Buffer>} 
 */
export async function exportToExcel(config) {
  const {
    fileName = 'export.xlsx',
    sheetName = 'Sheet1',
    headers = [],
    columns = [],
    data = [],
    styles = {}
  } = config;

  // Merge default styles với custom styles
  const defaultStyles = {
    title: {
      font: { size: 16, bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF22C55E' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    },
    header: {
      font: { size: 14, bold: true, color: { argb: 'FF2C3E50' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE8F5E9' } },
      alignment: { horizontal: 'left', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    },
    tableHeader: {
      font: { size: 12, bold: true, color: { argb: 'FFFFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'medium', color: { argb: 'FF000000' } },
        left: { style: 'thin', color: { argb: 'FF000000' } },
        bottom: { style: 'medium', color: { argb: 'FF000000' } },
        right: { style: 'thin', color: { argb: 'FF000000' } }
      }
    },
    tableCell: {
      font: { size: 11, color: { argb: 'FF2C3E50' } },
      alignment: { horizontal: 'left', vertical: 'middle', wrapText: true },
      border: {
        top: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        left: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        bottom: { style: 'thin', color: { argb: 'FFE0E0E0' } },
        right: { style: 'thin', color: { argb: 'FFE0E0E0' } }
      }
    },
    alternateRow: {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8F9FA' } }
    }
  };

  const mergedStyles = {
    title: { ...defaultStyles.title, ...styles.title },
    header: { ...defaultStyles.header, ...styles.header },
    tableHeader: { ...defaultStyles.tableHeader, ...styles.tableHeader },
    tableCell: { ...defaultStyles.tableCell, ...styles.tableCell },
    alternateRow: { ...defaultStyles.alternateRow, ...styles.alternateRow }
  };

  // Tạo workbook và worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName, {
    pageSetup: { 
      paperSize: 9, 
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0
    }
  });

  let currentRow = 1;

  // Thêm các header info (tiêu đề, thông tin...)
  if (headers && headers.length > 0) {
    headers.forEach((headerInfo, index) => {
      const row = worksheet.getRow(currentRow);
      
      if (headerInfo.type === 'title') {
        // Title - merge tất cả các cột
        worksheet.mergeCells(currentRow, 1, currentRow, columns.length || 6);
        const cell = row.getCell(1);
        cell.value = headerInfo.value;
        cell.font = mergedStyles.title.font;
        cell.fill = mergedStyles.title.fill;
        cell.alignment = mergedStyles.title.alignment;
        cell.border = mergedStyles.title.border;
        row.height = 30;
      } else if (headerInfo.type === 'info') {
        // Info - style đơn giản hơn
        const cell = row.getCell(1);
        cell.value = headerInfo.value;
        cell.font = mergedStyles.header.font;
        cell.fill = mergedStyles.header.fill;
        cell.alignment = mergedStyles.header.alignment;
        row.height = 25;
      } else if (headerInfo.type === 'empty') {
        // Dòng trống
        row.height = 15;
      }
      
      currentRow++;
    });
  }

  // Thêm table header
  if (columns && columns.length > 0) {
    worksheet.columns = columns.map(col => ({
      header: col.header,
      key: col.key,
      width: col.width || 20
    }));

    const headerRow = worksheet.getRow(currentRow);
    headerRow.height = 30;
    
    columns.forEach((col, index) => {
      const cell = headerRow.getCell(index + 1);
      cell.font = mergedStyles.tableHeader.font;
      cell.fill = mergedStyles.tableHeader.fill;
      cell.alignment = mergedStyles.tableHeader.alignment;
      cell.border = mergedStyles.tableHeader.border;
    });
    
    currentRow++;
  }

  // Thêm data rows
  if (data && data.length > 0) {
    data.forEach((rowData, rowIndex) => {
      const row = worksheet.addRow(rowData);
      row.height = 25;
      
      row.eachCell((cell, colNumber) => {
        cell.font = mergedStyles.tableCell.font;
        cell.alignment = mergedStyles.tableCell.alignment;
        cell.border = mergedStyles.tableCell.border;
        
        // Alternate row color
        if (rowIndex % 2 === 1) {
          cell.fill = mergedStyles.alternateRow.fill;
        }
      });
    });
  }

  // Auto-fit columns (nếu không có width được chỉ định)
  worksheet.columns.forEach((column) => {
    if (!column.width) {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, (cell) => {
        const columnLength = cell.value ? cell.value.toString().length : 10;
        if (columnLength > maxLength) {
          maxLength = columnLength;
        }
      });
      column.width = Math.min(maxLength + 2, 50);
    }
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

/**
 * Preset styles cho các loại báo cáo khác nhau
 */
export const presetStyles = {
  // Style xanh lá (cho gym/fitness)
  green: {
    title: {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF22C55E' } }
    },
    tableHeader: {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF16A34A' } }
    }
  },
  
  // Style xanh dương (professional)
  blue: {
    title: {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF3B82F6' } }
    },
    tableHeader: {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } }
    }
  },
  
  // Style tím (modern)
  purple: {
    title: {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF9333EA' } }
    },
    tableHeader: {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF7C3AED' } }
    }
  },
  
  // Style cam (warning/attention)
  orange: {
    title: {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF59E0B' } }
    },
    tableHeader: {
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD97706' } }
    }
  }
};

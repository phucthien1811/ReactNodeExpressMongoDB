import invoiceRepo from '../repositories/invoice.repo.js';
import { exportToExcel } from '../utils/excelExporter.js';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class InvoiceService {
  // Tạo hóa đơn thủ công từ quầy
  async createManualInvoice(adminId, invoiceData) {
    try {
      const invoiceNumber = await invoiceRepo.generateInvoiceNumber();
      
      const invoice = await invoiceRepo.createManualInvoice({
        invoice_number: invoiceNumber,
        source_type: 'manual',
        source_id: null,
        user_id: invoiceData.user_id,
        customer_name: invoiceData.customer_name,
        customer_email: invoiceData.customer_email || null,
        customer_phone: invoiceData.customer_phone || null,
        item_name: invoiceData.item_name,
        description: invoiceData.description || null,
        quantity: invoiceData.quantity || 1,
        unit_price: invoiceData.unit_price,
        total_amount: invoiceData.total_amount,
        payment_method: invoiceData.payment_method,
        payment_status: invoiceData.amount_paid >= invoiceData.total_amount ? 'paid' : 'pending',
        amount_paid: invoiceData.amount_paid || 0,
        change_amount: invoiceData.change_amount || 0,
        paid_at: invoiceData.amount_paid >= invoiceData.total_amount ? new Date() : null,
        created_by: adminId
      });

      return {
        success: true,
        data: invoice,
        message: 'Invoice created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  // Tạo hóa đơn tự động từ gói tập (được gọi sau khi thanh toán)
  async createGymPackageInvoice(packageData) {
    try {
      const invoice = await invoiceRepo.createGymPackageInvoice(packageData);

      return {
        success: true,
        data: invoice,
        message: 'Gym package invoice created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create gym package invoice: ${error.message}`);
    }
  }

  // Tạo hóa đơn tự động từ đơn hàng shop (được gọi sau khi tạo order)
  async createShopOrderInvoice(orderData) {
    try {
      const invoice = await invoiceRepo.createShopOrderInvoice(orderData);

      return {
        success: true,
        data: invoice,
        message: 'Shop order invoice created successfully'
      };
    } catch (error) {
      throw new Error(`Failed to create shop order invoice: ${error.message}`);
    }
  }

  // Lấy danh sách hóa đơn
  async getAllInvoices(filters) {
    try {
      const result = await invoiceRepo.getAllInvoices(filters);

      return {
        success: true,
        data: result,
        message: 'Invoices retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to get invoices: ${error.message}`);
    }
  }

  // Lấy chi tiết hóa đơn
  async getInvoiceById(invoiceId) {
    try {
      const invoice = await invoiceRepo.getInvoiceById(invoiceId);
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      return {
        success: true,
        data: invoice,
        message: 'Invoice details retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to get invoice: ${error.message}`);
    }
  }

  // Xác nhận thanh toán (cho COD hoặc manual pending)
  async confirmPayment(invoiceId, adminId, paymentData) {
    try {
      const invoice = await invoiceRepo.getInvoiceById(invoiceId);
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.payment_status === 'paid') {
        throw new Error('Invoice already paid');
      }

      const updatedInvoice = await invoiceRepo.confirmPayment(invoiceId, adminId, {
        amount_paid: paymentData.amount_paid || invoice.total_amount,
        change_amount: paymentData.change_amount || 0
      });

      return {
        success: true,
        data: updatedInvoice,
        message: 'Payment confirmed successfully'
      };
    } catch (error) {
      throw new Error(`Failed to confirm payment: ${error.message}`);
    }
  }

  // Hoàn tiền
  async refundInvoice(invoiceId, adminId) {
    try {
      const invoice = await invoiceRepo.getInvoiceById(invoiceId);
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      if (invoice.payment_status !== 'paid') {
        throw new Error('Can only refund paid invoices');
      }

      const updatedInvoice = await invoiceRepo.refundInvoice(invoiceId, adminId);

      return {
        success: true,
        data: updatedInvoice,
        message: 'Invoice refunded successfully'
      };
    } catch (error) {
      throw new Error(`Failed to refund invoice: ${error.message}`);
    }
  }

  // Thống kê doanh thu
  async getRevenueStatistics(filters) {
    try {
      const stats = await invoiceRepo.getRevenueStatistics(filters);

      return {
        success: true,
        data: stats,
        message: 'Revenue statistics retrieved successfully'
      };
    } catch (error) {
      throw new Error(`Failed to get statistics: ${error.message}`);
    }
  }

  // Xuất Excel danh sách hóa đơn
  async exportInvoicesToExcel(filters) {
    try {
      // Lấy tất cả hóa đơn theo filter (không phân trang)
      const allInvoices = await invoiceRepo.getAllInvoices({
        ...filters,
        page: 1,
        limit: 10000 // Lấy tối đa 10000 bản ghi
      });

      const invoices = allInvoices.invoices || [];

      // Helper function để format tiền VNĐ
      const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND'
        }).format(amount);
      };

      // Helper function để format ngày
      const formatDate = (date) => {
        if (!date) return '';
        return new Date(date).toLocaleString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        });
      };

      // Helper function để lấy tên trạng thái thanh toán
      const getPaymentStatus = (status) => {
        const statusMap = {
          'pending': 'Chờ thanh toán',
          'paid': 'Đã thanh toán',
          'refunded': 'Đã hoàn tiền',
          'cancelled': 'Đã hủy'
        };
        return statusMap[status] || status;
      };

      // Helper function để lấy tên nguồn
      const getSourceType = (type) => {
        const typeMap = {
          'manual': 'Quầy',
          'gym_package': 'Gói tập',
          'shop_order': 'Đơn hàng'
        };
        return typeMap[type] || type;
      };

      // Helper function để lấy phương thức thanh toán
      const getPaymentMethod = (method) => {
        const methodMap = {
          'cash': 'Tiền mặt',
          'bank_transfer': 'Chuyển khoản',
          'card': 'Thẻ',
          'momo': 'MoMo',
          'vnpay': 'VNPay'
        };
        return methodMap[method] || method;
      };

      // Cấu hình Excel
      const config = {
        fileName: `Hoa-Don-${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName: 'Danh Sách Hóa Đơn',
        headers: [
          {
            type: 'title',
            value: 'DANH SÁCH HÓA ĐƠN'
          },
          {
            type: 'info',
            value: `Ngày xuất: ${formatDate(new Date())}`
          },
          {
            type: 'info',
            value: `Tổng số hóa đơn: ${invoices.length}`
          },
          {
            type: 'empty'
          }
        ],
        columns: [
          { header: 'Mã HĐ', key: 'invoice_number', width: 15 },
          { header: 'Khách hàng', key: 'customer_name', width: 25 },
          { header: 'Điện thoại', key: 'customer_phone', width: 15 },
          { header: 'Sản phẩm/Dịch vụ', key: 'item_name', width: 30 },
          { header: 'Số lượng', key: 'quantity', width: 12 },
          { header: 'Đơn giá', key: 'unit_price', width: 18 },
          { header: 'Tổng tiền', key: 'total_amount', width: 18 },
          { header: 'Nguồn', key: 'source_type', width: 15 },
          { header: 'PT Thanh toán', key: 'payment_method', width: 18 },
          { header: 'Trạng thái', key: 'payment_status', width: 18 },
          { header: 'Ngày tạo', key: 'created_at', width: 20 }
        ],
        data: invoices.map(invoice => ({
          invoice_number: invoice.invoice_number,
          customer_name: invoice.customer_name || 'N/A',
          customer_phone: invoice.customer_phone || 'N/A',
          item_name: invoice.item_name || 'N/A',
          quantity: invoice.quantity,
          unit_price: formatCurrency(invoice.unit_price),
          total_amount: formatCurrency(invoice.total_amount),
          source_type: getSourceType(invoice.source_type),
          payment_method: getPaymentMethod(invoice.payment_method),
          payment_status: getPaymentStatus(invoice.payment_status),
          created_at: formatDate(invoice.created_at)
        }))
      };

      const buffer = await exportToExcel(config);
      return buffer;
    } catch (error) {
      throw new Error(`Failed to export invoices: ${error.message}`);
    }
  }

  // Tạo PDF cho một hóa đơn cụ thể
  async generateInvoicePDF(invoiceId) {
    try {
      const invoice = await invoiceRepo.getInvoiceById(invoiceId);
      
      if (!invoice) {
        throw new Error('Invoice not found');
      }

      return new Promise((resolve, reject) => {
        try {
          // Tạo PDF document
          const doc = new PDFDocument({ 
            size: 'A4', 
            margin: 50,
            bufferPages: true
          });

          // Đường dẫn font Arial (có sẵn trong Windows, hỗ trợ tiếng Việt)
          const arialPath = 'C:/Windows/Fonts/arial.ttf';
          const arialBoldPath = 'C:/Windows/Fonts/arialbd.ttf';
          
          // Đăng ký fonts
          try {
            doc.registerFont('Arial', arialPath);
            doc.registerFont('Arial-Bold', arialBoldPath);
          } catch (fontError) {
            console.log('Could not load Arial font, using default fonts');
            // Nếu không tìm thấy font, sẽ dùng font mặc định
          }

          // Tạo buffer để lưu PDF
          const chunks = [];
          doc.on('data', (chunk) => chunks.push(chunk));
          doc.on('end', () => {
            const buffer = Buffer.concat(chunks);
            resolve({
              buffer,
              invoiceNumber: invoice.invoice_number
            });
          });
          doc.on('error', reject);

          // Sử dụng font Arial thay vì Helvetica
          const regularFont = fs.existsSync(arialPath) ? 'Arial' : 'Helvetica';
          const boldFont = fs.existsSync(arialBoldPath) ? 'Arial-Bold' : 'Helvetica-Bold';

          // === HEADER ===
          // Logo và tiêu đề
          doc.fontSize(24)
             .font(boldFont)
             .fillColor('#2563eb')
             .text('FITNESS GYM CENTER', { align: 'center' });
          
          doc.fontSize(10)
             .font(regularFont)
             .fillColor('#666666')
             .text('Dia chi: 123 Duong ABC, Quan XYZ, TP.HCM', { align: 'center' })
             .text('Email: info@fitnessgym.vn | Hotline: 1900-xxxx', { align: 'center' });

          doc.moveDown(1);

          // Đường kẻ ngang
          doc.moveTo(50, doc.y)
             .lineTo(550, doc.y)
             .strokeColor('#e5e7eb')
             .stroke();

          doc.moveDown(1);

          // === TIÊU ĐỀ HÓA ĐƠN ===
          doc.fontSize(20)
             .font(boldFont)
             .fillColor('#000000')
             .text('HOA DON THANH TOAN', { align: 'center' });

          doc.moveDown(0.5);

          // Mã hóa đơn
          doc.fontSize(11)
             .font(regularFont)
             .fillColor('#666666')
             .text(`Ma hoa don: ${invoice.invoice_number}`, { align: 'center' });

          doc.moveDown(1.5);

          // === THÔNG TIN KHÁCH HÀNG ===
          const leftX = 50;
          const rightX = 320;
          let currentY = doc.y;

          // Cột trái - Thông tin khách hàng
          doc.fontSize(12)
             .font(boldFont)
             .fillColor('#000000')
             .text('THONG TIN KHACH HANG', leftX, currentY);

          currentY += 20;
          doc.fontSize(10)
             .font(regularFont)
             .fillColor('#333333');

          doc.text(`Ho ten: ${invoice.customer_name}`, leftX, currentY);
          currentY += 15;
          
          if (invoice.customer_phone) {
            doc.text(`So dien thoai: ${invoice.customer_phone}`, leftX, currentY);
            currentY += 15;
          }
          
          if (invoice.customer_email) {
            doc.text(`Email: ${invoice.customer_email}`, leftX, currentY);
          }

          // Cột phải - Thông tin hóa đơn
          currentY = doc.y - 60; // Reset về vị trí tiêu đề
          doc.fontSize(12)
             .font(boldFont)
             .fillColor('#000000')
             .text('THONG TIN HOA DON', rightX, currentY);

          currentY += 20;
          doc.fontSize(10)
             .font(regularFont)
             .fillColor('#333333');

          const createdDate = new Date(invoice.created_at).toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          doc.text(`Ngay xuat: ${createdDate}`, rightX, currentY);
          currentY += 15;

          const paymentMethodMap = {
            'cash': 'Tien mat',
            'banking': 'Chuyen khoan',
            'card': 'The tin dung',
            'momo': 'MoMo',
            'vnpay': 'VNPay',
            'cod': 'COD'
          };
          doc.text(`Phuong thuc: ${paymentMethodMap[invoice.payment_method] || 'Khac'}`, rightX, currentY);
          currentY += 15;

          const statusText = invoice.payment_status === 'paid' ? 'Da thanh toan' : 'Chua thanh toan';
          const statusColor = invoice.payment_status === 'paid' ? '#22c55e' : '#ef4444';
          doc.fillColor(statusColor)
             .text(`Trang thai: ${statusText}`, rightX, currentY);

          doc.moveDown(3);

          // === CHI TIẾT SẢN PHẨM/DỊCH VỤ ===
          currentY = doc.y;
          
          // Đường kẻ trước bảng
          doc.moveTo(50, currentY)
             .lineTo(550, currentY)
             .strokeColor('#e5e7eb')
             .stroke();

          currentY += 15;

          // Header của bảng
          doc.fontSize(11)
             .font(boldFont)
             .fillColor('#ffffff');

          // Background cho header
          doc.rect(50, currentY, 500, 25)
             .fill('#2563eb');

          doc.fillColor('#ffffff')
             .text('San pham/Dich vu', 60, currentY + 8, { width: 200 })
             .text('SL', 270, currentY + 8, { width: 40, align: 'center' })
             .text('Don gia', 320, currentY + 8, { width: 100, align: 'right' })
             .text('Thanh tien', 430, currentY + 8, { width: 110, align: 'right' });

          currentY += 25;

          // Nội dung bảng
          doc.fontSize(10)
             .font(regularFont)
             .fillColor('#333333');

          // Background cho row (màu nhạt)
          doc.rect(50, currentY, 500, 30)
             .fill('#f9fafb');

          doc.fillColor('#333333')
             .text(invoice.item_name, 60, currentY + 10, { width: 200 })
             .text(invoice.quantity.toString(), 270, currentY + 10, { width: 40, align: 'center' })
             .text(parseFloat(invoice.unit_price).toLocaleString('vi-VN') + 'd', 320, currentY + 10, { width: 100, align: 'right' })
             .text(parseFloat(invoice.unit_price * invoice.quantity).toLocaleString('vi-VN') + 'd', 430, currentY + 10, { width: 110, align: 'right' });

          currentY += 30;

          // Đường kẻ sau bảng
          doc.moveTo(50, currentY)
             .lineTo(550, currentY)
             .strokeColor('#e5e7eb')
             .stroke();

          currentY += 20;

          // === TỔNG CỘNG ===
          // Giảm giá nếu có
          if (invoice.discount_amount && parseFloat(invoice.discount_amount) > 0) {
            doc.fontSize(10)
               .font(regularFont)
               .fillColor('#666666')
               .text('Giam gia:', 320, currentY, { width: 100, align: 'right' })
               .fillColor('#22c55e')
               .text('-' + parseFloat(invoice.discount_amount).toLocaleString('vi-VN') + 'd', 430, currentY, { width: 110, align: 'right' });
            
            if (invoice.voucher_code) {
              currentY += 15;
              doc.fillColor('#666666')
                 .fontSize(9)
                 .text(`(Ma voucher: ${invoice.voucher_code})`, 320, currentY, { width: 220, align: 'right' });
            }
            
            currentY += 20;
          }

          // Tổng tiền
          doc.fontSize(12)
             .font(boldFont)
             .fillColor('#000000')
             .text('TONG CONG:', 320, currentY, { width: 100, align: 'right' });

          doc.fontSize(14)
             .fillColor('#2563eb')
             .text(parseFloat(invoice.total_amount).toLocaleString('vi-VN') + 'd', 430, currentY, { width: 110, align: 'right' });

          currentY += 25;

          // Tiền khách đưa và tiền thối
          doc.fontSize(10)
             .font(regularFont)
             .fillColor('#666666')
             .text('Tien khach dua:', 320, currentY, { width: 100, align: 'right' })
             .fillColor('#333333')
             .text(parseFloat(invoice.amount_paid || 0).toLocaleString('vi-VN') + 'd', 430, currentY, { width: 110, align: 'right' });

          currentY += 15;

          doc.fillColor('#666666')
             .text('Tien thoi:', 320, currentY, { width: 100, align: 'right' })
             .fillColor('#333333')
             .text(parseFloat(invoice.change_amount || 0).toLocaleString('vi-VN') + 'd', 430, currentY, { width: 110, align: 'right' });

          // === MÔ TẢ (nếu có) ===
          if (invoice.description) {
            currentY += 30;
            doc.fontSize(10)
               .font(boldFont)
               .fillColor('#000000')
               .text('Ghi chu:', 50, currentY);

            currentY += 15;
            doc.fontSize(9)
               .font(regularFont)
               .fillColor('#666666')
               .text(invoice.description, 50, currentY, { width: 500 });
          }

          // === FOOTER ===
          // Đẩy footer xuống cuối trang
          const footerY = 700;

          doc.moveTo(50, footerY)
             .lineTo(550, footerY)
             .strokeColor('#e5e7eb')
             .stroke();

          doc.fontSize(9)
             .font(regularFont)
             .fillColor('#999999')
             .text('Cam on quy khach da su dung dich vu!', 50, footerY + 15, { 
               align: 'center',
               width: 500
             })
             .text('Moi thac mac vui long lien he: 1900-xxxx hoac info@fitnessgym.vn', 50, footerY + 30, { 
               align: 'center',
               width: 500
             });

          // Finalize PDF
          doc.end();
        } catch (error) {
          reject(error);
        }
      });
    } catch (error) {
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }
}

export default new InvoiceService();

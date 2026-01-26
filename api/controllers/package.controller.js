import packageService from '../services/package.service.js';
import packageValidation from '../validations/package.js';
import { exportToExcel, presetStyles } from '../utils/excelExporter.js';

export const packageController = {
  // GET /api/packages - Lấy danh sách packages (admin)
  async getAllPackages(req, res) {
    try {
      const result = await packageService.getAllPackages(req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // GET /api/packages/public - Lấy packages public (member)
  async getPublicPackages(req, res) {
    try {
      const result = await packageService.getPublicPackages();
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // GET /api/packages/:id - Lấy package theo ID
  async getPackageById(req, res) {
    try {
      const { id } = req.params;
      const result = await packageService.getPackageById(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // POST /api/packages - Tạo package mới
  async createPackage(req, res) {
    try {
      const { error, value } = packageValidation.create.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const result = await packageService.createPackage(value);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // PUT /api/packages/:id - Cập nhật package
  async updatePackage(req, res) {
    try {
      const { id } = req.params;
      const { error, value } = packageValidation.update.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: error.details[0].message
        });
      }

      const result = await packageService.updatePackage(id, value);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // DELETE /api/packages/:id - Xóa package
  async deletePackage(req, res) {
    try {
      const { id } = req.params;
      const result = await packageService.deletePackage(id);
      
      if (!result.success) {
        return res.status(400).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // POST /api/packages/:id/toggle-published - Toggle published status
  async togglePublished(req, res) {
    try {
      const { id } = req.params;
      const result = await packageService.togglePublished(id);
      
      if (!result.success) {
        return res.status(404).json(result);
      }

      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // GET /api/packages/:id/members - Lấy danh sách members của package
  async getPackageMembers(req, res) {
    try {
      const { id } = req.params;
      const result = await packageService.getPackageMembers(id, req.query);
      res.json(result);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  },

  // GET /api/packages/:id/members/export - Xuất Excel danh sách members
  async exportPackageMembers(req, res) {
    try {
      const { id } = req.params;
      const result = await packageService.getPackageMembers(id, req.query);
      
      if (!result.success || !result.data || result.data.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Không có thành viên nào để xuất'
        });
      }

      const members = result.data;
      const packageName = members[0]?.package_name || 'Package';

      // Prepare data for Excel
      const excelData = members.map((member, index) => ({
        stt: index + 1,
        fullName: member.full_name,
        email: member.email,
        phone: member.phone || '—',
        startDate: new Date(member.start_date).toLocaleDateString('vi-VN'),
        endDate: new Date(member.end_date).toLocaleDateString('vi-VN'),
        status: member.status === 'active' ? 'Đang hoạt động' : 
                member.status === 'expired' ? 'Hết hạn' : 'Đã hủy',
        amount: member.paid_amount?.toLocaleString('vi-VN') + ' VNĐ' || '0 VNĐ'
      }));

      // Create headers
      const headers = [
        { type: 'title', value: `DANH SÁCH THÀNH VIÊN - ${packageName}` },
        { type: 'info', value: `Ngày xuất: ${new Date().toLocaleDateString('vi-VN')} ${new Date().toLocaleTimeString('vi-VN')}` },
        { type: 'info', value: `Tổng số thành viên: ${members.length}` },
        { type: 'empty' }
      ];

      // Configure Excel export
      const config = {
        fileName: `ThanhVien_${packageName}_${new Date().toISOString().split('T')[0]}.xlsx`,
        sheetName: 'Danh sách thành viên',
        headers,
        columns: [
          { header: 'STT', key: 'stt', width: 8 },
          { header: 'Tên thành viên', key: 'fullName', width: 25 },
          { header: 'Email', key: 'email', width: 30 },
          { header: 'Số điện thoại', key: 'phone', width: 15 },
          { header: 'Ngày bắt đầu', key: 'startDate', width: 15 },
          { header: 'Ngày kết thúc', key: 'endDate', width: 15 },
          { header: 'Trạng thái', key: 'status', width: 18 },
          { header: 'Số tiền', key: 'amount', width: 18 }
        ],
        data: excelData,
        styles: presetStyles.green
      };

      // Generate Excel buffer
      const buffer = await exportToExcel(config);

      // Send file to client
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(config.fileName)}"`);
      res.send(buffer);
    } catch (error) {
      console.error('Error exporting package members:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
};

export default packageController;
// Role-based authorization middleware

export const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // Kiểm tra xem user đã được authenticate chưa
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      // Kiểm tra role của user
      const userRole = req.user.role;
      
      if (!userRole) {
        return res.status(403).json({
          success: false,
          message: 'User role not found'
        });
      }

      // Kiểm tra xem role của user có trong danh sách được phép không
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Insufficient permissions'
        });
      }

      // Nếu có quyền, cho phép tiếp tục
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authorization error',
        error: error.message
      });
    }
  };
};

// Middleware kiểm tra admin
export const requireAdmin = (req, res, next) => {
  return authorizeRoles(['admin'])(req, res, next);
};

// Middleware kiểm tra member
export const requireMember = (req, res, next) => {
  return authorizeRoles(['member'])(req, res, next);
};

// Middleware kiểm tra admin hoặc member
export const requireUser = (req, res, next) => {
  return authorizeRoles(['admin', 'member'])(req, res, next);
};

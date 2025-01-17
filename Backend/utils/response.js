const responseUtil = {
    // Success response
    success: (res, data = null, message = 'Success', statusCode = 200) => {
      return res.status(statusCode).json({
        success: true,
        message,
        data
      });
    },
  
    // Error response
    error: (res, message = 'Internal server error', statusCode = 500, errors = null) => {
      const response = {
        success: false,
        message
      };
  
      if (errors) {
        response.errors = errors;
      }
  
      return res.status(statusCode).json(response);
    },
  
    // Validation error response
    validationError: (res, errors) => {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: errors.array().map(err => ({
          field: err.param,
          message: err.msg
        }))
      });
    },
  
    // Unauthorized response
    unauthorized: (res, message = 'Unauthorized access') => {
      return res.status(401).json({
        success: false,
        message
      });
    },
  
    // Forbidden response
    forbidden: (res, message = 'Access denied') => {
      return res.status(403).json({
        success: false,
        message
      });
    },
  
    // Not found response
    notFound: (res, message = 'Resource not found') => {
      return res.status(404).json({
        success: false,
        message
      });
    },
  
    // Bad request response
    badRequest: (res, message = 'Bad request', errors = null) => {
      const response = {
        success: false,
        message
      };
  
      if (errors) {
        response.errors = errors;
      }
  
      return res.status(400).json(response);
    },
  
    // Created response
    created: (res, data = null, message = 'Resource created successfully') => {
      return res.status(201).json({
        success: true,
        message,
        data
      });
    },
  
    // No content response
    noContent: (res) => {
      return res.status(204).send();
    },
  
    // Pagination response
    pagination: (res, data, page, limit, total, message = 'Success') => {
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;
  
      return res.status(200).json({
        success: true,
        message,
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPrevPage
        }
      });
    },
  
    // File response
    file: (res, workbook, filename) => {
      res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      );
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );
      
      return workbook.xlsx.write(res)
        .then(() => {
          res.status(200).end();
        });
    },
  
    // Custom status response
    custom: (res, statusCode, data) => {
      return res.status(statusCode).json(data);
    }
  };
  
  module.exports = responseUtil;
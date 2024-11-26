const response = (statusCode, data, message, res) => {
  res.status(statusCode).json({
    data: Array.isArray(data) ? data : [data], // Paksa data jadi array
    message,
  });
};

module.exports = response;

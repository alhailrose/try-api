// response.js
const response = (statusCode, data, message, res) => {
  // Memastikan bahwa data yang dikirim adalah dalam format array
  if (!Array.isArray(data)) {
    data = [data]; // Membungkus data dalam array jika data bukan array
  }

  res.status(statusCode).json({
    data: data,
    message: message,
  });
};

module.exports = response;

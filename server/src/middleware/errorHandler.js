const errorHandler = (err, req, res, next) => {
  const aiDetail = err.response?.data?.detail || err.response?.data?.message;
  const statusFromAxios = err.response?.status;
  const statusCode = statusFromAxios || (res.statusCode === 200 ? 500 : res.statusCode);
  const message = aiDetail || err.message || 'Internal Server Error';

  console.error('[Global Error Handler]:', message);
  if (!aiDetail) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};

module.exports = errorHandler;

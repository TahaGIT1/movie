export function errorHandler(error, req, res, next) {
  const status = error.statusCode || (error.name === 'ValidationError' ? 400 : error.name === 'CastError' ? 404 : 500);
  res.status(status).json({ message: status === 500 ? 'Unexpected server error' : error.message });
}

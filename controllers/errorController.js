import AppError from '../utilis/appError.js'
//
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`
  return new AppError(message, 400)
}

const handleDuplicateFieldsDB = (err) => {
  const message = `Duplicate Field Value: "${err.keyValue.title}". Please input another value! `
  return new AppError(message, 409)
}

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message)
  const message = `Invalid Input Data: ${errors.join('. ')}`
  return new AppError(message, 400)
}

const handleJWTError = () =>
  new AppError('Invalid Token! Please log in again!', 401)

const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again!', 401)

const sendErrorDev = (err, req, res) => {
  // originalUrl is the URL but without host name
  // A): API)
  // TODO: Need to change the host name to the actual host name
  // if (req.hostname === 'localhost') {
  return res.status(err.statusCode).json({
    status: err.status,
    err,
    message: err.message,
    stack: err.stack
  })
  // }
  // B): RENDERED WEBSITE
  // console.error('Error: 💥', err);
  // return res.status(err.statusCode).render('error', {
  //   title: 'Something went wrong',
  //   msg: err.message,
  // });
}

const sendErrorProd = (err, req, res) => {
  // TODO: Need to change the host name to the actual host name
  if (
    req.hostname ===
    (process.env.NODE_ENV === 'development'
      ? process.env.HOST_LOCAL
      : process.env.HOST)
  ) {
    // A): Operational, trusted error: send message to the client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      })
    }
    // B): Programming or other error: Don't leak error details
    // 1): Log
    console.error('Error: 💥', err)
    // 2): Send Response
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    })
  }
  // Operational, trusted error: send message to the client
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong',
      msg: err.message
    })
  }
  // Programming or other error: Don't leak error details
  // 1): Log
  console.error('Error: 💥', err)
  // 2): Send Response
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong',
    msg: 'Please! Try again later.'
  })
}

export const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500
  err.status = err.status || 'error'
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res)
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') err = handleCastErrorDB(err)
    if (err.code === 11000) err = handleDuplicateFieldsDB(err)
    if (err.name === 'ValidationError') err = handleValidationErrorDB(err)
    if (err.name === 'JsonWebTokenError') err = handleJWTError()
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError()
    sendErrorProd(err, req, res)
  }
}

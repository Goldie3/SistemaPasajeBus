const { ValidationError, UniqueConstraintError, ForeignKeyConstraintError } = require('sequelize')


const handleSequelizeError = (err) => {
  if (err instanceof ValidationError) {
    return {
      status: 422,
      code: 'VALIDATION_ERROR',
      message: 'Los datos enviados no son válidos.',
      errors: err.errors.map(e => ({ field: e.path, message: e.message })),
    }
  }

  if (err instanceof UniqueConstraintError) {
    const field = err.errors[0]?.path ?? 'campo'
    return {
      status: 409,
      code: 'CONFLICT',
      message: `Ya existe un registro con ese ${field}.`,
    }
  }

  if (err instanceof ForeignKeyConstraintError) {
    return {
      status: 400,
      code: 'INVALID_REFERENCE',
      message: 'El registro referenciado no existe.',
    }
  }

  return null
}


const errorHandler = (err, req, res, next) => {
  const isProd = process.env.NODE_ENV === 'production'

  // 1. Errores Sequelize
  const sequelizeMapped = handleSequelizeError(err)
  if (sequelizeMapped) {
    const { status, ...body } = sequelizeMapped
    return res.status(status).json({ error: true, ...body })
  }


  if (err.isOperational) {
    return res.status(err.statusCode ?? 500).json({
      error: true,
      code: err.code ?? 'APP_ERROR',
      message: err.message,
      ...(err.details ? { details: err.details } : {}),
    })
  }


  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      error: true,
      code: 'INVALID_JSON',
      message: 'El cuerpo de la petición no es JSON válido.',
    })
  }


  console.error('[ERROR NO CONTROLADO]', err)

  return res.status(500).json({
    error: true,
    code: 'INTERNAL_ERROR',
    message: 'Ocurrió un error interno. Intenta nuevamente.',
    ...(!isProd && { stack: err.stack }),  // solo en desarrollo
  })
}

module.exports = errorHandler
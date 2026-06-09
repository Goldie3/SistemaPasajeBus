const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const enviarResetPassword = async (email, token, link) => {
  // Modo desarrollo: muestra el token en consola
  if (process.env.NODE_ENV !== 'production') {
    console.log('=================================');
    console.log('TOKEN DE RESET (modo desarrollo)');
    console.log('Token:', token);
    console.log('Link:', link);
    console.log('=================================');
    return;
  }

  await transporter.sendMail({
    from: `"Sistema de Pasajes" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Restablecer contraseña',
    html: `
      <h2>Restablecer contraseña</h2>
      <p>Recibiste este correo porque solicitaste restablecer tu contraseña.</p>
      <p>
        <a href="${link}" style="
          background:#3b82f6;
          color:#fff;
          padding:0.6rem 1.2rem;
          border-radius:6px;
          text-decoration:none;
        ">
          Restablecer contraseña
        </a>
      </p>
      <p>El link expira en <strong>1 hora</strong>.</p>
      <p>Si no lo solicitaste, ignora este correo.</p>
    `,
  });
};

module.exports = { enviarResetPassword };
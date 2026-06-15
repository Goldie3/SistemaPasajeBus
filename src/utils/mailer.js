const enviarResetPassword = async (email, token, link) => {
  console.log('=================================');
  console.log('TOKEN DE RESET DE CONTRASEÑA');
  console.log('Email:', email);
  console.log('Token:', token);
  console.log('Link:', link);
  console.log('=================================');
};

module.exports = { enviarResetPassword };
const bcrypt = require('bcrypt');

const password = 'cyntia123'; // ganti sesuai password yang kamu mau
const saltRounds = 10;

bcrypt.hash(password, saltRounds, function(err, hash) {
  if (err) throw err;
  console.log('Hashed password:', hash);
});

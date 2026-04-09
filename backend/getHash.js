import bcrypt from 'bcrypt';

const password = '123456';
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) {
    console.error('Lỗi khi mã hóa mật khẩu:', err);
    return;
  }
  console.log('Hash của 123456 là:', hash);
});
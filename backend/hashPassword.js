import bcrypt from "bcrypt";

const password = "123456"; // mật khẩu hiện tại
const saltRounds = 10;

bcrypt.hash(password, saltRounds, (err, hash) => {
  if (err) throw err;
  console.log("Hash của mật khẩu:", hash);
});
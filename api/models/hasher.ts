const bcrypt = require("bcryptjs");

class Hasher {
  crypt(password: any, callback: any) {
    bcrypt.genSalt(10, (err: any, salt: any) => {
      if (err) return callback(err);

      bcrypt.hash(password, salt, (err: any, hash: any) => {
        return callback(err, hash);
      });
    });
  }

  compare(password: any, hash: any, callback: any) {
    bcrypt.compare(password, hash, (err: any, isPasswordMatch: boolean) => {
      if (err) return callback(err);
      callback(err, isPasswordMatch);
    });
  }

  cryptSync(password: any, salt: any) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(salt));
  }

  compareSync(password: any, hash: any) {
    return bcrypt.compareSync(password, hash);
  }
}

export { Hasher };

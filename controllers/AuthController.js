import uuid from 'uuid';

import redis from 'redis';

const redisClient = redis.createClient();

redisClient.on("error", function(err) {
  console.log("Error " + err);
});

import {
  sendcode
}
from '../services/AccountKit';

import {
  NotfoundError
}
from '../services/ErrorExtends';

import {
  User
}
from '../models';

/**
 * 
{ me: 
   { id: 'VXNlcjo1Mg==',
     email: 'hieu22t5@gmail.com',
     name: 'Hieu',
     userName: 'hieu2223r',
     mobilePhone: '0904906903' },
  accountKit: 
   { id: '1027480904004634',
     phone: 
      { number: '+84904906903',
        country_prefix: '84',
        national_number: '904906903' } },
  access_token: '2c3c6ba1-a9b1-49b2-b02c-7f2113728420',
  expires_in: 2592000 }
}
 */

const TIME_TO_LIVE = 2592000;

export const authWithAccountKit = function(code, csrf_nonce) {
  return new Promise((resolve, reject) => {
    // Gửi resquest lên accountkit.com để xác thực code
    sendcode(code, csrf_nonce)
      // Nếu xác thực thành công
      // Query User Account
      .then(accountKitRes => {
        const mobilePhone = accountKitRes.phone && accountKitRes.phone.national_number ? ('0' + accountKitRes.phone.national_number) : null;
        const email = accountKitRes.email && accountKitRes.email.address ? accountKitRes.email.address : null;

        // Kiểm tra xem user có tồn tại trên hệ thống hay không
        return User.findOne({
            where: {
              $or: [{
                mobilePhone: mobilePhone
              }, {
                email: email
              }]
            }
          })
          .then(user => {
            // Nếu không tìm thấy user
            if (!user) {
              reject(new NotfoundError('Không tìm thấy user'));
            }
            // Nếu tìm thấy user:
            // - Lưu vào redis
            const access_token = uuid.v4();

            let userAuthedObj = {
              me: user,
              accountKit: accountKitRes,
              access_token: access_token,
              expires_in: TIME_TO_LIVE
            };

            redisClient.setex(access_token, TIME_TO_LIVE, JSON.stringify(userAuthedObj), (err, res) => {
              if (err) return reject(err);

              resolve(userAuthedObj);
            });
          })
          .catch(reject);
      })
      .catch(reject);
  });
};
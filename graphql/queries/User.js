import {
  GraphQLString
}
from 'graphql';

import {
  connectionArgs,
  connectionFromPromisedArray
}
from 'graphql-relay';

import {
  UserConnection
}
from '../connections/user';

import {
  waterfall,
  apply
}
from 'async';

import redis from 'redis';
const redisClient = redis.createClient();

redisClient.on("error", function(err) {
  console.log("Error " + err);
});

// import EmailType from '../custom-types/email';

// import loaders from '../loaders';

export default {
  type: UserConnection,
  args: {
    userName: {
      type: GraphQLString
    },
    mobilePhone: {
      type: GraphQLString
    },
    email: {
      type: GraphQLString
    },
    ...connectionArgs
  },
  async resolve(_, args, {
    loaders
  }) {
    let checkAccessToken = await isAuthenticatedPromise(_.access_token);

    let loaderKey;
    if (args.email || args.mobilePhone || args.userName) {
      loaderKey = {};

      let argObj = {
        email: args.email,
        mobilePhone: args.mobilePhone,
        userName: args.userName
      };

      // Loại bỏ các props rỗng
      Object.keys(argObj).forEach(key => {
        if (typeof argObj[key] !== 'undefined' && argObj[key] !== null) {
          loaderKey[key] = argObj[key];
        }
      });

      loaderKey = JSON.stringify(loaderKey);
    }
    else {
      loaderKey = 'allUsers';
    }
    
    return connectionFromPromisedArray(loaders.users.load(loaderKey), args);
  }
};

function isAuthenticatedPromise(access_token) {
  return new Promise((resolve, reject) => {
    if (!access_token) return reject(new Error('Không có access_token'));

    return redisClient.get(access_token, (err, reply) => {
      if (err) return reject(err);
      else if (!reply) return reject(new Error('Không tồn tại nhé'));

      return resolve(null, JSON.parse(reply));
    });
  });
}
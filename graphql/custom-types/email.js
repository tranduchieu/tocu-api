import {
  GraphQLScalarType
}
from 'graphql';
import {
  Kind
}
from 'graphql/language';
import {
  GraphQLError
}
from 'graphql/error';

import {
  User
}
from '../../models';

const EmailType = new GraphQLScalarType({
  name: 'EmailType',
  serialize: value => {
    console.log(`serialize: ${value}`);
    return value;
  },
  parseValue: email => emailValidate(email),
  parseLiteral: ast => {
    console.log(`ast: ${ast}`);
    if (ast.kind !== Kind.STRING) {
      let Err = new GraphQLError(`Query error: Can only parse strings got a: ${ast.kind}`, [ast]);
      Err['type'] = 'TypeError';
      throw Err;
    }

    // Regex taken from: http://stackoverflow.com/a/46181/761555
    const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    if (!re.test(ast.value)) {
      let Err = new GraphQLError('Query error: Not a valid Email', [ast]);

      Err.type = 'TypeError';
      console.log(Err.message);
      throw Err;
    }

    return ast.value;
  }
});

function emailValidatePromise(email) {
  return new Promise((resolve, reject) => {
    const re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    if (!re.test(email)) {
      let Err = new GraphQLError('Query error: Not a valid Email');

      Err.type = 'TypeError';
      console.log(Err.type);
      reject(Err);
    }

    User.findOne({
        where: {
          email: email
        }
      })
      .then(result => {
        if (result) {
          reject(new Error('Email tồn tại rồi'));
        }
        resolve(email);
      })
      .catch(err => {
        reject(err);
      });
  });
}

async function emailValidate(email) {
  await emailValidatePromise(email)
  .then(result => {
    return email;
  })
  .catch(err => {
    throw new GraphQLError(err.message);
  });
};

export default EmailType;

import DataLoader from 'dataloader';
import {
  User
}
from '../../models';

export let userByIDLoader = new DataLoader(ids => {
  return User.findAll({
      where: {
        id: {
          $in: ids
        }
      }
    })
    .then(users => {
      for (let user of users) {
        userNameLoader.prime(user.userName, user);
      }

      return users;
    });
});

let userNameLoader = new DataLoader(names => {
  return User.findAll({
      where: {
        userName: {
          $in: names
        }
      }
    })
    .then(users => {
      for (let user of users) {

      }
    })
});

export const allUserLoader = new DataLoader(keys => {
  console.log(keys[0]);
  
  if (keys[0] !== 'allUsers' && typeof JSON.parse(keys[0]) === 'object') {
    return Promise.all([User.findAll({
      where: JSON.parse(keys[0])
    })]);
  }
  else {
    
    return Promise.all([User.findAll()]);
  }
});
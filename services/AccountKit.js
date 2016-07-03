const Request = require('request');
const Querystring = require('querystring');
const crypto = require('crypto');

import Guid from 'guid';

import {
  facebook as FacebookConfig
}
from '../config';


let csrf_guid = Guid.raw();
const api_version = 'v1.0';
const app_id = FacebookConfig.app_id;
const app_secret = FacebookConfig.app_secret;
const me_endpoint_base_url = 'https://graph.accountkit.com/v1.0/me';
const token_exchange_base_url = 'https://graph.accountkit.com/v1.0/access_token';

export function sendcode(code, csrf_nonce) {
  return new Promise((resolve, reject) => {
    // if (csrf_nonce !== csrf_guid) return reject('Something went wrong.');
    var app_access_token = ['AA', app_id, app_secret].join('|');

    var params = {
      grant_type: 'authorization_code',
      code: code,
      access_token: app_access_token
    };

    // exchange tokens
    var token_exchange_url = token_exchange_base_url + '?' + Querystring.stringify(params);

    Request.get({
      url: token_exchange_url,
      json: true
    }, function(err, resp, respBody) {
      if (err) return reject(err);
      else if (respBody.error) return reject(respBody.error);

      var res = {
        user_access_token: respBody.access_token,
        expires_at: respBody.token_refresh_interval_sec,
        user_id: respBody.id,
      };

      const hash = crypto.createHmac('sha256', app_secret)
        .update(respBody.access_token)
        .digest('hex');

      // get account details at /me endpoint
      var me_endpoint_url = me_endpoint_base_url + '?access_token=' + respBody.access_token + '&appsecret_proof=' + hash;

      Request.get({
        url: me_endpoint_url,
        json: true
      }, function(err, resp, respBody) {
        if (err) return reject(err);
        else if (respBody.error) return reject(respBody.error);
        
        // if (respBody.phone) {
        //   res.phone_num = respBody.phone.number;
        // }
        // else if (respBody.email) {
        //   res.email_addr = respBody.email.address;
        // }

        resolve(respBody);
      });
    });
  })

}

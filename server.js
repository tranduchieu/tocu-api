'use strict';
import __config from './config';

import express from 'express';
import bodyParser from 'body-parser';
import GraphHTTP from 'express-graphql';
import Schema from './graphql/schema';
import loaders from './graphql/loaders';

let app = express();

// Enables CORS
// let enableCORS = function(req, res, next) {
//   res.header('Access-Control-Allow-Origin', '*');
//   res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//   res.header('Access-Control-Allow-Headers',
//     'Content-Type, Authorization, Content-Length, X-Requested-With, *');

//   next();
// };

app
  // .use(enableCORS)
  .use(bodyParser.urlencoded({
    extended: true
  }))
  .use(bodyParser.json())

// .use('/assets', express.static(path.join(__dirname, 'assets')))
.use('/accountkit/sendcode', (req, res) => {
    return res.send('Hello world!!!');
  })
  .use('/', GraphHTTP(req => ({
    schema: Schema,
    pretty: true,
    graphiql: true,
    rootValue: {
      access_token: req.query.access_token || null
    },
    context: {loaders}
    // formatError: error => ({
    //   message: error.message,
    //   locations: error.locations,
    //   stack: error.stack,
    //   name: error.name
    // })
  })));

app.set('port', __config.main.port || process.env.PORT || 3000);

app.listen(app.get('port'), function() {
  console.log(`Node app listening at ${__config.main.siteUrl}
    with NodeJS ${process.version}`);
});

import passport from 'passport';
import {
  Strategy as LocalStrategy
} from 'passport-local';
import {
  Strategy as BearerStragery
} from 'passport-http-bearer';

import bcrypt from 'bcrypt';

import {
  User
} from '../models';

/**
 * Passport Local
 * ------------------------------------------
 */
 passport.use(new LocalStrategy({
   usernameField: 'accessName',
   passwordField: 'password'
 }, (accessName, passport, done) => {
   
 }));
const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const AuthController = require('../controllers/auth');

describe('Auth Controller - Login', () => {

  it('should throw error with code 500 if db access fails', (done) => {
    sinon.stub(User, 'findOne');
    User.findOne.throws();
    const req = {
      body: {
        email: 'test@t.com',
        password: '1234'
      }
    };

    AuthController.login(req, {}, () => {}).then((result) => {
      expect(result).to.throw();
      expect(result).to.be.an('error');
      expect(result).to.have.property('statusCode', 500);

      done(); // It tells Mocha to only complete the test when done() is called.
    }).catch(() => done());

    User.findOne.restore();
  });

  it('Without done() - should throw error with code 500 if db access fails', async () => {
    sinon.stub(User, 'findOne');
    User.findOne.throws();
    const req = {
      body: {
        email: 'test@t.com',
        password: '1234'
      }
    };

    const result = await AuthController.login(req, {}, () => {});

    expect(result).to.be.an('error');
    expect(result).to.have.property('statusCode', 500);

    User.findOne.restore();
  });
});

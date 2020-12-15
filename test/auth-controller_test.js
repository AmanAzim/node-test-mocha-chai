const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
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

  it('Should send valid user status for an existing user', (done) => {
    mongoose.connect(
      'mongodb://localhost/test', { useUnifiedTopology: true  }
    ).then(result => {
      return new User({
        name: 'test',
        email: 'tester@t.com',
        password: 'test',
        posts: []
      }).save();
    }).then(user => {
      const req = { userId: user._id };
      const res = {
        statusCode: 500,
        userStatus: null,
        status: function(code) {
          this.statusCode = code;
          return this;
        },
        json: function(data) { // Do not use Arrow function () => {} where we need to use "this"
          this.userStatus = data.status;
        }
      };

      AuthController.getUserStatus(req, res, () => {}).then(() => {
        expect(res.statusCode).to.be.equal(200);
        expect(res.userStatus).to.be.equal('I am new!');

        return User.deleteMany({}).then(() => {
          return mongoose.disconnect().then(() => done());
        })
      }).catch(() => done());

    }).catch(err => {
      console.log(err);
      done();
    });
  });
});

describe('Auth Controller - Login 2', () => {
  let user;
  before((done) => {
    mongoose.connect(
      'mongodb://localhost/test', { useUnifiedTopology: true  }
    ).then(result => {
      return new User({
        name: 'test',
        email: 'tester@t.com',
        password: 'test',
        posts: []
      }).save();
    }).then((savedUser) => {
      user = savedUser;
      done();
    }).catch(() => done());;
  });

  after((done) => {
    User.deleteMany({}).then(() => {
      return mongoose.disconnect().then(() => done());
    }).catch(() => done());
  });

  it('Should send valid user status for an existing user', (done) => {
    const req = { userId: user._id };
    const res = {
      statusCode: 500,
      userStatus: null,
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) { // Do not use Arrow function () => {} where we need to use "this"
        this.userStatus = data.status;
      }
    };
    console.log('res 1 >>>>>>>>>>>>', res);
    AuthController.getUserStatus(req, res, () => {}).then(() => {
      console.log('res 2 >>>>>>>>>>>>', res);
      expect(res.statusCode).to.be.equal(300);
      console.log('res 3 >>>>>>>>>>>>', res);
      expect(res.userStatus).to.be.equal('I am new!');
      done();
    }).catch(() => done());
  });
});


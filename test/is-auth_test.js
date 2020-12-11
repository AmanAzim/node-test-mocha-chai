const { expect } = require('chai');
const sinon = require('sinon');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middleware/is-auth');

describe('authMiddleware', () => {
  it('should throw error if no authorization header present', () => {
    const req = {
      get: (headerName) => {
        return null;
      }
    };
  
    // Here we use bind to let Mocha call the method inside its test only if we call the method without bind then it will actually throw error as it is designed because of not getting any "authHeader" from the "req.get()" function.
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw('Not authenticated.');
  });
  
  it('should throw error if authorization header is only one string', () => {
    const req = {
      get: (headerName) => {
        return 'xyz';
      }
    };
  
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it('should throw error if token cannot be verified', () => {
    const req = {
      get: (headerName) => {
        return 'bearer xyzjdbjdsfgbjdskgb';
      }
    };
    
    expect(authMiddleware.bind(this, req, {}, () => {})).to.throw();
  });

  it('should yield a userId after decoding the token', () => {
    const req = {
      get: (headerName) => {
        return 'bearer xyzjdbjdsfgbjdskgb';
      }
    };
    
    
    sinon.stub(jwt, 'verify'); // Adding fake verify method to local jwt copy
    jwt.verify.returns({ userId: 'abc' }); //Moching "verify" method

    authMiddleware(req, {}, () => {}); // We dont need bind here as the "req.ret()" function will return a header so no obvious error is thrown because of "authHeader".
    
    expect(req).to.have.property('userId');
    expect(req).to.have.property('userId', 'abc');
    expect(jwt.verify.called).to.be.true;

    jwt.verify.restore(); // Restoring original method
  });
});

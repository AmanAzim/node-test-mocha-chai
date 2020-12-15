const { expect } = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const User = require('../models/user');
const FeedController = require('../controllers/feed');

describe('Feed Controller', () => {
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

  it('Should add created post to the crtetor list', (done) => {
    const req = {
      body: {
        title: 'Test post',
        content: 'A test post'
      },
      file: {
        path: '/test'
      },
      userId: user._id 
    };
    const res = {
      status: () => {},
      json: () => {}
    };

    console.log('res 1 >>>>>>>>>>>>', res);
    FeedController.createPost(req, res, () => {}).then((savedUser) => {
      console.log('res 2 >>>>>>>>>>>>', res);
      expect(savedUser).to.have.property('posts', '');
      console.log('res 3 >>>>>>>>>>>>', res);
      expect(res.userStatus).to.be.equal('I am new!');
      done();
    }).catch(() => done());
  });
});


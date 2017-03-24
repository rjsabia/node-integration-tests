const chai = require('chai');
const chaiHttp = require('chai-http');

const {app, runServer, closeServer} = require('../server');
const should = chai.should();

chai.use(chaiHttp);

describe('Recipes', function() {
	before(function() {
		return runServer();
	});
	after(function(){
		return closeServer();
	});

it('should list recipe items on GET', function() {
	return chai.request(app)
		.get('/recipes')
		.then(function(res) {
			res.should.have.status(200);
			res.should.be.json;
			res.body.should.be.a('array');
			res.body.length.should.be.at.least(1);
			const expectedKeys = ['id', 'name', 'ingredients'];
			res.body.forEach(function(item) {
				item.should.be.a('object');
				item.should.include.keys(expectedKeys);
			});
		});
	});

it('should add a recipe on POST', function() {
    const newItem = {name: 'bagel', ingredients: ['bagel', 'cream cheese']};
    return chai.request(app)
      .post('/recipes')
      .send(newItem)
      .then(function(res) {
        res.should.have.status(201);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.include.keys('id', 'name', 'ingredients');
        res.body.id.should.not.be.null;
        // response should be deep equal to `newItem` from above if we assign
        // `id` to it from `res.body.id`
        res.body.should.deep.equal(Object.assign(newItem, {id: res.body.id}));
      });
  });

it('should update recipes on PUT', function() {
    const updateData = {
      name: 'chicken soup',
      ingredients: ['chicken', 'soup']
    };
	return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        updateData.id = res.body[0].id;
        return chai.request(app)
          .put(`/recipes/${updateData.id}`)
          .send(updateData);
      })
      .then(function(res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        res.body.should.deep.equal(updateData);
      });
  });
it('should delete recipe on DELETE', function() {
    return chai.request(app)
      .get('/recipes')
      .then(function(res) {
        return chai.request(app)
          .delete(`/recipes/${res.body[0].id}`);
      })
      .then(function(res) {
        res.should.have.status(204);
      });
  });
});
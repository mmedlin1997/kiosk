var should = require('chai').should();

describe('Array', function() {

   var numbers;

   beforeEach(function() {
      numbers = [1, 2, 3, 4, 5];
   });

   it('should be type array that includes 2', function() {
      numbers.should.be.an('array').that.includes(2);
   });

   it('should have length 5', function() {
      numbers.should.have.lengthOf(5);
   });
});

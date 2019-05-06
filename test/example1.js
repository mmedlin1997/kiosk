var should = require('chai').should();

describe('Array', function() {

   var numbers;

   beforeEach(function() {
      numbers = [1, 2, 3, 4, 5, 6];
   });

   it('should be type array that includes 6', function() {
      numbers.should.be.an('array').that.includes(6);
   });

   it('should have length 6', function() {
      numbers.should.have.lengthOf(6);
   });
});
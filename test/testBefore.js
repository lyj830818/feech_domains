/**
 * Created by Administrator on 14-1-8.
 */

/*

 Object.defineProperty(global, "name_of_leaking_property", {
 set : function(value) {
 throw new Error("SHIT!");
 }
 });

 var should = require('chai').should();

 describe('Before', function(){
 this.timeout( 20000);

 var foo = true;

 before(function( done){
 setTimeout(function(){
 foo = false;
 done();
 } , 1000);
 console.dir('before 11');
 });

 beforeEach(function(){
 console.dir('beforeEach 11');
 });

 before(function(){
 console.dir('before 22');
 });

 describe('.exist', function(){
 it('test1111', function(){
 console.dir('test1');
 foo.should.equal(false);

 });
 it('test22', function(){
 console.dir('test2');
 foo.should.equal(false);
 });

 });

 });
 */
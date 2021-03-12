/*jshint -W030 */
const target = require("../index");
const assert = require('assert');
const chai = require('chai');
const expect = chai.expect;

const TF_TEST_FILE = './test/terraform.out';
const TF_TEST_DIR = './test';

describe('Unit Tests', function() {
  /*
  ** verifyParameters()
  */
  describe('verifyParameters()', function() {
    it('Should succeed with proper output file specified', function() {
      var results = target.verifyParameters( tf_outputFile=TF_TEST_FILE, tf_Directory=null, outputScriptFile='/tmp/test.sh', scriptFileType='bash');
      expect(results).equals(0);
    }),
    it('Should succeed with proper output directory specified', function() {
      var results = target.verifyParameters( tf_outputFile=null, tf_Directory=TF_TEST_DIR, outputScriptFile='/tmp/test.sh', scriptFileType='BASH');
      expect(results).equals(0);
    }),
    it('Should error on missing output parameters', function() {
      var results = target.verifyParameters( tf_outputFile=null, tf_Directory=null, outputScriptFile='/tmp/test.sh', scriptFileType='bash');
      expect(results).is.below(0);
    }),
    it('Should error on redundant output parameters', function() {
      var results = target.verifyParameters( tf_outputFile=TF_TEST_FILE, tf_Directory=TF_TEST_DIR, outputScriptFile='/tmp/test.sh', scriptFileType='bash');
      expect(results).is.below(0);
    }),
    it('Should error on an invalid output file', function() {
      var results = target.verifyParameters( tf_outputFile='./test/unknown.file', tf_Directory=null, outputScriptFile='/tmp/test.sh', scriptFileType='bash');
      expect(results).is.below(0);
    }),
    it('Should error on an invalid output directory', function() {
      var results = target.verifyParameters( tf_outputFile=null, tf_Directory='/foo', outputScriptFile='/tmp/test.sh', scriptFileType='bash');
      expect(results).is.below(0);
    }),
    it('Should error on an invalid shell', function() {
      var results = target.verifyParameters( tf_outputFile=null, tf_Directory=TF_TEST_DIR, outputScriptFile='/tmp/test.sh', scriptFileType='windows');
      expect(results).is.below(0);
    });
  }),
  describe('getOutputFile()', function() {
    it('Should error on missing paramaters', function() {
      var results = target.getOutputFile( outputFile=null, outputDir=null );
      expect(results).is.below(0);
    }),
    it('Should succeed when the specified file exists', function() {
      var results = target.getOutputFile( outputFile=TF_TEST_FILE, outputDir=null );
      expect(results).equals(TF_TEST_FILE);
    });
    /*
    ** We are not doing the integration test with a valid output dir as it requires terraform
    */
  }),
  describe('convertTerraformOutputToScript()', function () {
    it('Should succeed when the specified file exists', function() {
      var results = target.convertTerraformOutputToScript( inputFile=TF_TEST_FILE );
      expect(results).to.contain('url="some_url:8080"');
      expect(results).to.contain('sg="some-security-group"');
      expect(results.length).to.equal(45);
    });
  });
});
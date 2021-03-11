const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG, R_OK } = require('constants');
const core = require('@actions/core');
const fsPromises = require('fs').promises;
const util = require('util');
const process = require('child_process');

//#region supporting functions
/*
**
*/
function verifyParameters( tf_outputFile, tf_Directory, outputScriptFile, scriptFileType ) {
  // Verify exclusive terraform output parameters
  if (tf_Directory == null && tf_outputFile == null) {
    core.setFailed('Either the terraform-output-file or terraform-directory parameters must be specified');
    return -1;
  } else if (tf_Directory != null && tf_outputFile != null) {
    core.setFailed('The terraform-output-file and terraform-directory parameters asre mutually exclusive; please specify only one');
    return -2;
  }

  //  Verify that if specified, tf_Directory is a valid path
  if (tf_Directory != null) {
    try {
      var stats = fs.statSync(tf_Directory);
      if (!stats.isDirectory()) {
        core.setFailed('The terraform-directory parameter does not point to a valid directory path');
        return -3;
      }
    }
    catch (err) {
      console.error(err);
      core.setFailed('The terraform-directory parameter does not point to a valid directory path');
      return -3;
    }
  }
  //  Verify that if specified, tf_outputFile is an existing file path
  else {
    try {
      
      var stats = fs.statSync(tf_outputFile);
      if (!stats.isFile()) {
        core.setFailed('The terraform-output-file parameter does not point to a valid file path');
        return -4;
      }
    }
    catch (err) {
      console.error(err);
      core.setFailed('The terraform-output-file parameter does not point to a valid file path');
      return -4;
    }
  }

  // Verify shell
  if (scriptFileType.toLowerCase() != 'bash') {
    core.setFailed('This actions currently only supports bash scripts');
    return -5;
  }

  return 0;
}

/*
**
*/
function getOutputFile(outputFile, outputDir) {
  // Option 1 - outputFile is specified and exists, so return it
  if (outputFile != null) {
    try {
      fs.accessSync(outputFile, fs.F_OK);
      return outputFile;
    }
    catch (err) {
      console.error(err);
      core.setFailed('The file specified in terraform-output-file cannot be found or accessed.');
      return -1;
    }
    return outputFile;
  } 
  // Option 2 - outputDir is specified, so generate output from TF and return the resulting file
  // TO DO:
  //  Shell the erraform output
  if (outputDir != null) {
    core.setFailed('TBD');
    return -2;
  } else {
    core.setFailed('Must specify either the output folder or output directory parameter.');
    return -3;
  }
}

/*
**
*/
async function convertTerraformOutputToScript( inputFile ) {
  fsPromises.readFile(inputFile, R_OK)
    .then((data) => { return data })
    .catch((err) => console.error(err));
}
//#endregion

/*
** main
*/
function main() {
  try {
    // Read all input parameters
    const tf_outputFile    = core.getInput('terraform-output-file');
    const tf_Directory     = core.getInput('terraform-directory');
    const outputScriptFile = core.getInput('shell-output-file');
    const scriptFileType   = core.getInput('script-type');

    verifyParameters( tf_outputFile, tf_Directory, outputScriptFile, scriptFileType );
    var outputFile = getOutputFile( outputFile=tf_outputFile, outputDir=tf_Directory );

    var script = convertTerraformOutputToScript( outputFile );
  } catch( error ) {
    core.setFailed( error.message );
  }
}

module.exports.convertTerraformOutputToScript = convertTerraformOutputToScript
module.exports.verifyParameters = verifyParameters
module.exports.getOutputFile = getOutputFile

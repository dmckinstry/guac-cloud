const core = require('@actions/core');
const fs = require('fs');
const util = require('util');
const process = require('child_process');
const { notDeepEqual } = require('assert');

//#region supporting functions
/*
**
*/
function verifyParameters( tf_outputFile, tf_Directory, outputScriptFile, scriptFileType ) {
  // Verify exclusive terraform output parameters
  if (!tf_Directory && !tf_outputFile) {
    core.setFailed('Either the terraform-output-file or terraform-directory parameters must be specified');
    return -1;
  } else if (tf_Directory != "" && tf_outputFile != "") {
    core.setFailed('The terraform-output-file(' + tf_outputFile + ') and terraform-directory (' + tf_Directory + ') parameters are mutually exclusive; please specify only one');
    return -2;
  }

  //  Verify that if specified, tf_Directory is a valid path
  if (tf_Directory != "") {
    try {
      var dirStats = fs.statSync(tf_Directory);
      if (!dirStats.isDirectory()) {
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
      var fileStats = fs.statSync(tf_outputFile);
      if (!fileStats.isFile()) {
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
function convertTerraformOutputToScript( inputFile ) {
  // We can use sync file access since this is a single isolated process running in a container
  const buffer = fs.readFileSync( inputFile );
  const fileContents = buffer.toString();
  const lines = fileContents.split(/\r?\n/);
  var resultsScript = "";

  lines.forEach(line => {
    if ( line.includes( ' = "' ) && line[0].match(/^[a-z]+$/i)) {
      resultsScript += line.replace( ' = "', '="' ) + '\n';
    }
  });

  return resultsScript;
}

function writeScriptFile( filename, content, scriptType='bash' ) {
  // console.log('==== writing file====');
  // console.log('-> filename: ' + filename );
  // console.log('-> content:\n' + content );
  // console.log('-> script:   ' + scriptType );
  // console.log('======================');
  fs.writeFileSync( filename, content );
  if ( scriptType === 'bash' ) {
    fs.chmodSync( filename, '777' );
  }
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
    writeScriptFile( outputScriptFile, script );

  } catch( error ) {
    core.setFailed( error.message );
  }
}

main();

module.exports.writeScriptFile = writeScriptFile;
module.exports.convertTerraformOutputToScript = convertTerraformOutputToScript;
module.exports.verifyParameters = verifyParameters;
module.exports.getOutputFile = getOutputFile;

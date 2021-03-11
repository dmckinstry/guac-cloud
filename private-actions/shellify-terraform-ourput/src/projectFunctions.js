const { graphql } = require("@octokit/graphql");

/*
**
*/
async function getProjectStats(org, user, repo, project, token) {

  var projectNumber = await getProjectNumber(org, user, repo, project, token);
  var cardQl = getCardQuery(org, user, repo, projectNumber);

  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${token}`,
    },
  });
  
  var results = await graphqlWithAuth(cardQl);
  var summary = summarizeQueryResults(org, project, results);

  return summary;
}

/*
**
*/
function summarizeQueryResults( org, projectName, queryResults ) {
  var rootNode;
  if (org === null || org ==="") {
    rootNode = queryResults.user.repository;
  } else {
    rootNode = queryResults.organization.repository;
  }

  // Build list of columns with totals
  var columns = new Array();
  rootNode.project.columns.nodes.forEach(column => {
    // Capture column name and total card count
    var newColumn = { Column: column.name, Statistics: [] };
    newColumn.Statistics.push( {Key: "Total", Value: column.cards.totalCount });
    columns.push(newColumn);
  })

  // Loop through all issues
  var issues = rootNode.issues.nodes;
  issues.forEach( function(issue) {
    issue.projectCards.nodes.forEach( function( card ) {
      if (card.project.name === projectName ) {
        console.debug(`Found card titled ${issue.title}`);
        updateStatistics("Label", card.column.name, issue.labels.nodes, columns);
        updateStatistics("Assignee", card.column.name, issue.assignees.nodes, columns);
      }
    })
  })

  return columns;
}

// (Assignee||Label), Column, array of (A||L), array of columns
function updateStatistics(statType, columnName, issues, outputArray) {
  // Find the column
  var trackColumn = outputArray.find( function( column ) {
    return (column.Column === columnName);
  })

  // Find the stat type subarray in the column array (Label or Assignee)
  var trackStatType = trackColumn.Statistics.find( function( stat ) {
    return (stat.Key === statType);
  })
  if (trackStatType === undefined) {
    trackStatType = { Key: statType, Value: [] };
    trackColumn.Statistics.push(trackStatType);
  }
  
  // Loop through all isues items (assignees||labels)
  issues.forEach( function( item ) {
    // Find the specific label or assignee in the outputArray
    var trackStat = trackStatType.Value.find( function( value ) {
      return (value.Key === item.name);
    })
    if (trackStat === undefined) {
      trackStat = { Key: item.name, Value: 1 };
      trackStatType.Value.push(trackStat);
    } else {
      trackStat.Value++;
    }
  })

  console.debug(`... stat ${statType} in column ${columnName} searching ${issues.length} issues`);
}

/*
**
*/
async function getProjectNumber(org, user, repo, projectName, token) {
  const results = await getProjectData(org, user, repo, projectName, token);
  var projectArray;
  if (org === null || org === "") {
    projectArray = results.user.repository.projects.nodes;
  } else {
    projectArray = results.organization.repository.projects.nodes;
  }
  
  var projectNumber = -999;
  for(i=0; i<projectArray.length; i++) { 
    if (projectArray[i].name === projectName) {
      projectNumber = projectArray[i].number;
      break;
    }
  }
  if (projectNumber > 0)
    return projectNumber;
  else
    throw("Project not found");
}

async function getProjectData(org, user, repo, projectName, token) {
  const projectQl = getProjectsQuery(org, user, repo);
  const graphqlWithAuth = graphql.defaults({
    headers: {
      authorization: `token ${token}`,
    },
  });

  return await graphqlWithAuth(projectQl);
}

function getProjectsQuery(org, user, repo) {
  var root = getRootText(org, user);
  var query = `
  {
    ${root.Key}(login: "${root.Value}") {
      repository(name: "${repo}") {
        projects(first:100) {
          nodes {
            number
            name
          }
        }
      }     
    }
  }`;

  return query;  
}

/*
** getCardQuery - Create GitHub GraphQL to retrieve card and issue info related to projects
*/
function getCardQuery(org, user, repo, projectNumber) {
  var root = getRootText(org, user);

  var ql = `
  {
    ${root.Key}(login: "${root.Value}") {
      repository(name: "${repo}") {
        project(number: ${projectNumber}) {
          name
          columns(first: 100) {
            nodes {
              name
              cards(first: 100) {
                totalCount
                nodes {
                  content {__typename}
                  note
                  id
                }
              }
            }
          }
        }
        
        issues(first: 100, states: OPEN) {
          nodes {
            id
            number
            title
            assignees(first: 100) {
              nodes {
                name
              }
            }
            labels(first: 100) {
              nodes {
                name
              }            
            }
            
            projectCards(first: 100, archivedStates: NOT_ARCHIVED) {
              nodes {
                project {
                  name
                }
                column {
                  name
                }
              }
            }
          }
        }
      }
    }
  }`

  return ql;
}

/*
**
*/
function getRootText(org, user) {
  var root = {};
  if ((org !== null) && (org !== "")) {
    root.Key = "organization";
    root.Value = org;
  }
  else {
    root.Key = "user";
    root.Value = user;
  }
  return root;
}

/*
**
*/
function getRoot(organization, user) {
  var results = null;
  if ((organization === null) || (organization === "")) {
    results = user;
  }
  else if ((user === null) || (user === "")) {
    results = organization;
  }

  if (results === null) {
    throw("Org or Login must be specified");
  }

  return results;
}

/*
**
*/ 
function convertResultsToList( results ) {
  var markdown = "";
  results.forEach( function( column ) {
    markdown += `- ${column.Column}:\n`;
    column.Statistics.forEach( function( statArray ) {
      if (statArray.Key === "Total") {
        markdown += `  - Total: ${statArray.Value}\n`;
      } else {
        markdown += `  - ${statArray.Key}: ${statArray.Value.length}\n`;
        statArray.Value.forEach( function( stat ) {
          markdown += `    - ${stat.Key}: ${stat.Value}\n`;
        })
      }
    })
  })
  return markdown;
}

module.exports.getProjectNumber = getProjectNumber;
module.exports.getProjectStats = getProjectStats;
module.exports.getCardQuery = getCardQuery;
module.exports.getProjectsQuery = getProjectsQuery;
module.exports.getRoot = getRoot ;
module.exports.summarizeQueryResults = summarizeQueryResults;
module.exports.convertResultsToList = convertResultsToList;

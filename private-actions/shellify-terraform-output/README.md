# shellify-terraform-output Action

TBD!!!!!


![ProjectSummary-CI](https://github.com/dmckinstry/ProjectSummary/workflows/ProjectSummary-CI/badge.svg) ![ProjectSummary-Test](https://github.com/dmckinstry/ProjectSummary/workflows/ProjectSummary-Test/badge.svg)

This action queries a specified project board in GitHub and returns basic statistics including:

- Total number of cards in each column
- Number of cards per Assignee in each column
- Number of cards per Label in each column

Note that the total cards will not necessarily be equal to sums of any other statistic as cards may have zero, one or multiple assignees and labels.  However, total assignee or label counts for a column will not exceed the total number of cards in that column.

## Inputs

### `org`

GitHub organization hosting the project. Either the org or login is required.

### `login`

GitHub user account hosting the project. Either the org or login is required.

### `repo`

GitHub repository hosting the project. This field is required.

### `project`

The name of the Github project for which to retrieve the statics. This field is required.

### `token`

The security token... TO DO:  Info.

Please do *not* store your secrets in plan text. Instead, use GitHub Secrets or a similar vault technology as shown in the example.

## Outputs

### `summary`

The Summary output contains all of the per-column counts including:

- Total cards per column
- Cards per assignee per column
- Cards per label per column
- Issue-based cards per column

Reference sample from the latest test run: <https://github.com/dmckinstry/ProjectSummary/blob/master/test-results.md#json-results>

### `markdownList`

Summary data presented as a markdown bullet list.  For example:

- To do:
  - Total: 2
  - Label:
    - enhancement: 1
    - bug: 1
  - Done:
    - Total: 0

Reference sample from the latest test run: <https://github.com/dmckinstry/ProjectSummary/blob/master/test-results.md#markdown-list>

## Example usage

The following shows a configuration for this repo (i.e., <https://github.com/dmckinstry/ProjectSummary>) and a related project named `ProjectSummaryTest`:

``` YAML
uses: dmckinstry/ProjectSummary@v1
with:
  login: 'dmckinstry'
  repo: 'ProjectSummary'
  project: 'ProjectSummaryTest'
  token: ${ secrets.MyGitHubSecurityToken}
```

# Disclaimer

I used this action to build my experience in Node.JS. I consider myself an experienced developer but still only a novice Node developer. As such, everything here seems to work but I'm certain real Node developers will see many "opportunities" to improve this code. I'm happy to accept PRs, and feel free to reuse this code - but use at your own risk :). 

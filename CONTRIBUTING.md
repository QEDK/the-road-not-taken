This documentation contains a set of guidelines to help you during the contribution process. 
We are happy to welcome all the contributions from anyone willing to improve this project. Thank you for helping out!

# Getting Started 👩‍💻
Below you will find the process and workflow used to review and merge your changes.

## Step 0: Find an issue
- Take a look at the existing issues or create your own issues!
- Wait for the issue to be assigned to you after which you can start working on it.
- Note: Every change in this project should have an associated issue.

## Step 1: Fork the project
- Fork this Repository. This will create a Local Copy of this Repository on your Github Profile. Keep a reference to the original project in `upstream` remote.
```
$ git clone https://github.com/<your-username>/the-road-not-taken
$ cd the-road-not-taken
$ git remote add upstream https://github.com/QEDK/the-road-not-taken
```

- If you have already forked the project, update your copy before working.
```
$ git remote update
$ git checkout <branch-name>
$ git rebase upstream/<branch-name>
```

## Step 2: Branch
Create a new branch. Use its name to identify the issue your addressing.
```
# It will create a new branch with name branch_name and switch to that branch 
$ git checkout -b branch_name
```
## Step 3: Work on the issue assigned
- Work on the issue(s) assigned to you. 
- Add all the files/folders needed.
- After you've made changes or made your contribution to the project add changes to the branch you've just created by:
```
# To add all new files to branch branch_name
$ git add .
```

## Step 4: Commit
- To commit give a descriptive message for the convenience of reveiwer by:
```
# This message get associated with all files you have changed
$ git commit -m "message"
```

### Commit style guidelines

- game: If you're working on implementing game logic or UI, the commit should begin with `game: 'Brief Description'`
- general: If you're working on something else, your commit should begin with `general: 'Brief Description'`
- docs: If you're working on documentation, or any other chore, your commit should begin with `docs: 'Brief Description'`

## Step 5: Work Remotely
- Now you are ready to your work to the remote repository.
- When your work is ready and complies with the project conventions, upload your changes to your fork:

```
# To push your work to your remote repository
$ git push -u origin branch_name
```

## Step 6: Pull Request
- Go to your repository in browser and click on compare and pull requests. Then add a title and description to your pull request that explains your contribution.
- That's it! Your PR has been submitted and will be reviewed by the maintainers and merged.🥳

## Need more help?🤔
You can refer to the following articles on basics of Git and Github and also contact the maintainers, in case you are stuck:
- [Forking a repo](https://help.github.com/en/github/getting-started-with-github/fork-a-repo)
- [Cloning a repo](https://help.github.com/en/desktop/contributing-to-projects/creating-an-issue-or-pull-request)
- [How to create a PR](https://opensource.com/article/19/7/create-pull-request-github)
- [Getting started with Git and GitHub](https://towardsdatascience.com/getting-started-with-git-and-github-6fcd0f2d4ac6)
- [Learn GitHub from Scratch](https://lab.github.com/githubtraining/introduction-to-github)

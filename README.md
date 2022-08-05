<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [GitHub PR Template Picker](#github-pr-template-picker)
- [Installation](#installation)
  - [Userscript](#userscript)
- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# GitHub PR Template Picker

This project solves a simple problem:
1. GitHub allows you to specify a set of organization-wide PR templates by
   creating a public `.github` repository under your organization to contain
   them.
   ([docs](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-filehttps://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/creating-a-default-community-health-file). These can be used to initialize pull request descriptions with useful starting points.
2. If you create a single `.github/pull_request_template.md` file, that will be
   used as the default template for all PRs in repositories in your organization
   that don't have their own pull request template set. Great!
3. But... if you instead create multiple PR templates in a
   `.github/PULL_REQUEST_TEMPLATE` directory in your org's public `.github`
   repository, the only way to select among them is using a [query parameter in
   the
   URL](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/using-query-parameters-to-create-a-pull-request).
4. This is annoying and error prone!

So, this project provides userscripts (and maybe browser extensions) to make
this easier.

# Installation

## Userscript
Navigate to the following URL to install the userscript in Tampermonkey or
Greasemonkey:

https://raw.githubusercontent.com/bclarkx2/github-pr-template-picker/main/src/script.tamper.js

# Usage

Navigate to a "compare" page on the GitHub web app (e.g.
https://github.com/bclarkx2/github-pr-template-picker/compare/some/feature).

Set the Source field to the API URL for your organization's Pull Request
templates. The format is:

`https://api.github.com/repos/:org/.github/contents/.github/PULL_REQUEST_TEMPLATE`

Where:
  - `:org` - the name of your GitHub organization.

This will also work with any *public* directory on GitHub containing a list of
markdown files.

Then, just use the "PR Template" dropdown to select the PR template you'd like
to use!

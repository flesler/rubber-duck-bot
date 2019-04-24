#!/usr/bin/env node
// Based on https://github.com/lalitkapoor/github-changes/blob/master/release.sh
const { readFileSync, writeFileSync } = require('fs')
const { execSync } = require('child_process')

const BUMPS = ['major', 'minor', 'patch']
const DATE_FORMAT = 'YYYY-MM-DD HH:mm'

const token = process.argv[2]

if (!token) {
	throw new Error('First argument must be a valid Github personal access token with "repo" access')
}
const bump = process.argv[3] || 'minor'

if (!BUMPS.includes(bump)) {
	throw new Error('First argument must be one of ' + BUMPS.join(', '))
}

function exec(...args) {
	const command = args.join(' ')
	console.log('$', command)
	return execSync(command)
}

function safeExec(...args) {
	try {
		return exec(...args)
	} catch (err) {
		// IGNORE
	}
}

function hideTagCommits() {
	const lines = readFileSync('CHANGELOG.md', 'utf8').split('\n').filter(line => (
		!/\) v?\d+\.\d+\.\d+ \(/.test(line)
	))
	writeFileSync('CHANGELOG.md', lines.join('\n'))
}

// TODO: Auto-stash or leave like this so user becomes aware repo has changes?
exec('git', 'pull', '--rebase', 'origin', 'master')
// Run it now instead of as a precommit to abort early
exec('npm', 'run', 'lint')
// github-changes works with the online repo so all must be pushed
exec('git', 'push', 'origin', 'master')
exec('npm', '--no-git-tag-version', 'version', bump)

// After npm version updated the version
const pkg = require('../package.json')

const [owner, repo] = pkg.repository.url.split(/[/.]/).slice(4, -1)
const tag = `v${pkg.version}`

// If they exist remove them first
safeExec('git', 'tag', '-d', tag)
safeExec('git', 'push', 'origin', '--delete', tag)

exec('sh', './node_modules/.bin/github-changes', '-m', `"${DATE_FORMAT}"`, '--reverse-changes', '-o', owner, '-r', repo, '-v', '-n', tag, '-k', token)
hideTagCommits()

exec('git', 'add', 'CHANGELOG.md', 'package.json', 'package-lock.json')
exec('git', 'commit', '-m', tag, '--no-verify')
exec('git', 'tag', tag)

exec('git', 'push', 'origin', 'master')
exec('git', 'push', 'origin', '--tags')

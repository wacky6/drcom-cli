'use strict'

/* Account File, per line: `username password` */
let ACCOUNT = '/etc/drcom-account.conf'
/* Server hostname / address */
let SERVER  = '192.168.168.168'


var fs    = require('fs')
var join  = require('path').join
var resolve = require('path').resolve
var spawnSync = require('child_process').spawnSync

function timeStr() {
	return (new Date()).toISOString()
}

var accounts
try {
	var accountsPath = resolve(__dirname, ACCOUNT)
	accounts = fs.readFileSync(accountsPath, {encoding:'utf-8'})
	.split(/\n|\r|\n\r/)
	.filter(function(s){ return s.search(/\S/)!=-1 })
	.map(function(s){ return {user: s.split(/\s/)[0], pass: s.split(/\s/)[1] } })
}catch(e){
	console.log("Fail: can't read account information, "+accountsPath)
	process.exit(1)
}
console.log('loaded accounts = '+accounts.length)

function cliExec(argsArray) {
	var args = [SERVER].concat(argsArray)
	var ret = spawnSync( join(__dirname, './bin/drcom-cli'), args, {encoding: 'utf-8'} )
	return ret
}

function checkLogin() {
	var ret
	ret = cliExec(['status']).stdout
	if (ret=='LOGON') return

	var i = Math.floor(Math.random() * accounts.length)
	var user = accounts[i].user
	var pass = accounts[i].pass
	ret = cliExec([ 'login', user, pass ])
	if (ret.stdout!='LOGON') {
		console.log(timeStr()+', fail: logon '+user+', '+ret.stdout)
		console.log(timeStr()+', fail: '+ret.stderr)
	}else{
		console.log(timeStr()+', logged on with '+user)
	}
}

console.log(timeStr()+', started.')
if (cliExec(['status']).stdout == 'LOGON') 
	console.log(timeStr()+', already logged on')

checkLogin()
setInterval(checkLogin, 60*1000)  // check per minute
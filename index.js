'use strict'

var argv = process.argv.slice(2)

var usage = `
Usage: 
  drcom-cli server cmd [args]

server:
  dr.com server hostname/address
cmd: 
  one of 'login', 'logout', 'status'
args: 
  login:  [username] [password]
  logout: no arg
  status: no arg
`

function result(code) {
	process.stdout.write(code + (process.stdout.isTTY ? "\n" : ""))
	process.exit()
}

if (argv.length < 2) { process.stderr.write(usage); result('ERROR'); return }

// parse command line
var server = argv[0], cmd = argv[1]
var drcom  = new (require('./drcom'))(server)

process.on('uncaughtException', function(e){
	process.stderr.write(e.stack)
	result('ERROR')
	process.exit(0)
})

switch (cmd) {
	case 'login':
		if (argv.length!=4) { process.stderr.write(usage); result('ERROR'); return }
		var user   = argv[2]
		var passwd = argv[3]
		drcom.login(user, passwd, function(e, r){
			if (e) { result('ERROR'); return }
			result(r)
		})
		break
	case 'logout':
		drcom.logout(function(e,r){ 
			if (e) { result('ERROR'); return }
			result(r)
		})
		break
	case 'status':
		drcom.status(function(e,r){ 
			if (e) { result('ERROR'); return }
			result(r)
		})
		break
	default:
		process.stderr.write(usage)
		result('ERROR')
}
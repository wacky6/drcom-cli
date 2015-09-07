'use strict'

var http  = require('http')

var status = {
	'LOGON':     'logged on to dr.com server',
	'LOGOFF':    'not logged on',
	'ERROR':     'server error',
	'ECRED':     'incorrect username or password',
	'EINUSE':    'account in use',
	'EBALANCE':  'not enough balance in dr.com account',
	'ADDRLIMIT': 'address is limited by server',
	'SUSPEND':   'account suspended',
	'UNKNOW':    'unknow error',
	'NIMPL':     'message code is not implemented!'
}

var msgToErr = {
	'-1':  'UNKNOW',
	'0':   'ERROR',
	'1':   'ERROR',
	'2':   'EINUSE',
	'3':   'ADDRLIMIT',
	'4':   'EBALANCE',
	'5':   'SUSPENDED',
	'6':   'ERROR',
	'14':  'LOGOFF',
	'15':  'LOGON'
}

function baseHeader() {
	var h = {}
	h["Accept"]     = "text/html,*/*"
	h["User-Agent"] = "Mozilla/5.0 DrComClient/0.1"
	h["Connection"] = "close"
	return h
}

function urlencode(j) {
	var a = []
	for (var i in j)
		a.push( encodeURIComponent(i)+'='+encodeURIComponent(j[i]) )
	return a.join('&')
}

// use Standard Header, request's 'content-length' does not work with DrCom
function POST(host, path, form, cbk) {
	var f = urlencode(form)
	var h = baseHeader()
	var r = new Buffer('')
	h['Content-Type']   = 'application/x-www-form-urlencoded'
	h['Content-Length'] = f.length
	var req = http.request({
		method:   'POST',
		hostname: host,
		path:     path,
		headers:  h
	}, function(res){
		res.on('data',  function(d){ r=Buffer.concat([r, d]) })
		res.on('end',   function() { cbk(null, r)            })
		res.on('error', function(e){ process.stderr.write(e); cbk(null, r) })
	})
	req.on('error',     function(e){ process.stderr.write(e); cbk(e, undefined) })
	req.write(f)
	req.end()
}

function GET(host, path, cbk) {
	var h = baseHeader()
	var r = new Buffer('')
	var req = http.request({
		method:   'GET',
		hostname: host,
		path:     path,
		headers:  h
	}, function(res){
		if (res.statusCode<200 || res.statusCode>=400) {
			cbk(res.statusCode, undefined)
			return
		}
		res.on('data',  function(d){ r=Buffer.concat([r, d]) })
		res.on('end',   function() { cbk(null, r)            })
		res.on('error', function(e){ process.stderr.write(e); cbk(null, r) })
	})

	req.on('error',     function(e){ process.stderr.write(e); cbk(e, undefined) })
	req.end()
}


class drCom {
	constructor(serverAddress) {  // ip-address / hostname
		this.address = serverAddress
	}

	status(cbk) {
		GET(this.address, '/', function(e, d){
			var s = d.toString('utf-8')
			var ret = 'ERROR'
			if (s.indexOf('Used time')!=-1) ret = 'LOGON'
			if (s.indexOf('DDDDD')    !=-1) ret = 'LOGOFF'
			cbk(null, ret)
		})
	}

	login(user, passwd, cbk) {
		var form = {}
		form["DDDDD"]  = user
		form["upass"]  = passwd
		form["0MKKey"] = ''
		POST(this.address, '/', form, function(e, d){
			// DEBUG/DEV: require('fs').writeFileSync('/tmp/post-login.txt', d)
			var reMsg = /Msg=([0-9]+)/
			// capture msg Code
			var code = reMsg.exec(d.toString())
			// logon with redirection, set code=15
			if (d.toString().indexOf('You have successfully logged into our system')!=-1) code = ['', 15]
			code = parseInt(code ? code[1] : '-1')   // regExp capture or '-1' to signal error
			var stat = code in msgToErr ? msgToErr[code] : 'NIMPL'
			process.stderr.write('Msg = '+stat+', '+status[stat]+'\n')
			cbk(null, stat)
		})
	}

	logout(cbk) {
		GET(this.address, '/F.htm', function(e, d){
			var reMsg = /Msg=([0-9]+)/
			var code = reMsg.exec(d.toString())
			code = parseInt(code ? code[1] : '-1')   // regExp capture or '-1' to signal error
			var stat = code in msgToErr ? msgToErr[code] : 'NIMPL'
			process.stderr.write('Msg = '+stat+', '+status[stat]+'\n')
			cbk(null, stat)
		})
	}

}

module.exports = drCom
module.exports.status = status
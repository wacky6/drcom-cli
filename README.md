drcom-cli
===

node.js script to automate Dr.Com authentication.  
primarily for NJUPT, should work fine for others  


## Install
`npm install -g wacky6/drcom-cli`

## Usage - CLI
`drcom-cli server cmd [args]`

##### server
Dr.Com server's hostname  
the one in address bar when get redirected to login portal  

##### cmd / args
|  cmd   | args               |
|--------|--------------------|
| login  | username password  |
| logout | [none]             |
| status | [none]             |

* username: Dr.Com account, usually student card's ID
* password: Dr.Com password, usually last 6 digits of resident ID


## Usage - daemon
1. write account/password to `/etc/drcom-account.conf` (you can change that in drcom-daemon.js)
2. start daemon using the launcher you like (PM2, forever, ...)


#### Example of drcom-account.conf
Account on the left, Password on the right
```Text
110201300000000 123456
110201400000000 654321
```

## Internals
Checks login/logout status by requesting a probe url, every minute, if gets 30x redirection, it means logged out

Default:
* probe-url: `http://www.bing.com`
* interval: `60*1000 ms` (1 minute)

Change interval: modify `setInterval` in `drcom-daemon.js`  
Change probe: modify `this.probe` in `drCom.js`  

## Note
This script only works if Dr.Com server allows web portal login.  
Works by running RegExp matches against returned HTML, may not be consistent all the time!  

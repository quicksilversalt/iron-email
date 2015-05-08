var notifier = require('mail-notifier')
, fs = require('fs')
, Imap = require('imap')
, Imap2 = require('imap')
, stream = require('stream')
, MailParser = require('mailparser').MailParser;

var filename = __dirname + "/config.json";
var config = JSON.parse (fs.readFileSync(filename,'utf8'));
var topUID, topUID2;
var imapCollection = [];



function openImapMailbox(mailBox, imapcnct){
	var imapcnct = imapcnct;
	//console.log(imapcnct);
	imapcnct.openBox(mailBox, false, function(err, box) {
		//console.log(box);
        searchForNewEmail(box, imapcnct); // initial search/process of data
        imapcnct.on('mail', function (id) {
            searchForNewEmail(box, imapcnct);
        });
    });
}


function searchForNewEmail(box, imapcnct) {
	console.log(box.messages.total);
    imapcnct.search([box.messages.total + ':*'], function(err, results) {
    	if (err) {
            console.log(err);
        }
        if (!results || results.length === 0) {
            console.log('no new mail in INBOX');
            return;
        }
        var f = imapcnct.seq.fetch(results, { bodies: 'HEADER.FIELDS (TO FROM SUBJECT)', struct: true });
        console.log("============================================");
        console.log("");
        console.log("SEARCHING " + box.name);
        console.log("");
        console.log("============================================");
        f.on('message', function(msg, seqno) {
        	var mp = new MailParser();
        	var shouldMove, uid;
        	mp.once('end', function (mail) {
        		//console.log(mail.from);
                console.log(mail.subject);
                console.log("^^^^^");
                if(mail.subject !== undefined && mail.subject.indexOf("move to spam") != -1){
                	shouldMove = true;
                	if(uid !== undefined){
                		console.log("would move");
                		//moveMail(uid,"[Gmail]/Spam");
                	}
                }
            });
            msg.once('attributes', function(attrs) {
                uid = attrs.uid;
                if (shouldMove === true){
                	console.log("would move");
                  //moveMail(uid,"[Gmail]/Spam");
                }
            });
            msg.on('body', function(stream, info) {
            	stream.pipe(mp);
                var buffer = '';
                stream.on('data', function(chunk) {
                  //buffer += chunk.toString('utf8');
                });
                stream.once('end', function() {
                    // do something with 'buffer'
                });
            });
        });
    });
}


function moveMail (uid, box) {
    console.log("====== move mail with: ");
    console.log(uid);
    console.log(box);
    //imap.move(uid, box, function(err, code){
    //    if(err){
    //        console.log(err);
    //    }
    //})
}

//imap.connect(); // connect to imap
//imap2.connect(); // connect to imap
var dynImapInst = [];

for(var v = 0; v < config.messages.length; v++){
	//console.log(config.messages[v].body);
	var order = config.messages[v].body;
	var dynUsr = {
		user: order.email,
		password: order.password,
		host: order.imap.host,
		port: order.imap.port,
		markSeen: false,
		box: 'INBOX',
		tls: true,
		tlsOptions: {rejectUnauthorized: false}
	}
    //console.log(dynUsr);
	var dynImap = require ('imap');
	dynImapInst[order.email] = new dynImap(dynUsr);
	imapCollection.push(dynImapInst[order.email]);

	dynImapInst[order.email].once('ready', function(data) {
        this.usr = dynUsr.user;
        console.log("this user " + dynUsr.user);
        console.log("data " + data);
		console.log("checking imaps ");
        //console.log(dynImapInst[this.foo]._sock.address());
	    openImapMailbox('INBOX', dynImapInst[data]);
	});
    //console.log('+++++++++++   print events');
    //console.log(dynImapInst[order.email]._events.ready.toString());
    //console.log('-------------------');
	//dynImapInst[order.email].connect();

}
console.log(dynImapInst);
dynImapInst["evdhtester@gmail.com"].connect();

var notifier = require('mail-notifier')
, fs = require('fs')
, Imap = require('imap')
, Imap2 = require('imap')
, stream = require('stream')
, MailParser = require('mailparser').MailParser;

var filename = __dirname + "/config.json";
var config = JSON.parse (fs.readFileSync(filename,'utf8'));
var topUID, topUID2;


var usrInfo = {
        user: config.username,
        password: config.password,
        host: config.imap.host,
        port: config.imap.port,
        markSeen: false,
        //box: '[Gmail]/Spam',
         tls: true,// use secure connection
        tlsOptions: { rejectUnauthorized: false }
};

var usr1 = {
	user: "elephantventurestester@gmail.com",
    password: "ereIamJH",
    host: "imap.gmail.com",
    port: 993,
    markSeen: false,
    box: 'INBOX',
     tls: true,// use secure connection
    tlsOptions: { rejectUnauthorized: false }
}

var usr2 = {
	user: "evdhtester@gmail.com",
    password: "#Abc123!",
    host: "imap.gmail.com",
    port: 993,
    markSeen: false,
    box: '[Gmail]/Spam',
     tls: true,// use secure connection
    tlsOptions: { rejectUnauthorized: false }
}

var imap = new Imap(usr2);
var imap2 = new Imap2(usr1);


imap.once('ready', function() {
	console.log("checking imap");
    openImapMailbox('INBOX');
});
imap2.once('ready', function() {
	console.log("checking imap2");
    openImapMailbox2('INBOX');
});

function openImapMailbox(mailBox){
	imap.openBox(mailBox, false, function(err, box) {
		//console.log(box);
        searchForNewEmail(box); // initial search/process of data
        imap.on('mail', function (id) {
            searchForNewEmail(box);
        });
    });
}

function openImapMailbox2(mailBox){
	imap2.openBox(mailBox, false, function(err, box) {
		//console.log(box);
        searchForNewEmail2(box); // initial search/process of data
        imap2.on('mail', function (id) {
            searchForNewEmail2(box);
        });
    });
}

function searchForNewEmail(box) {
    imap.search([box.messages.total + ':*'], function(err, results) {
    	if (err) {
            console.log(err);
        }
        if (!results || results.length === 0) {
            console.log('no new mail in INBOX');
            return;
        }
        var f = imap.seq.fetch(results, { bodies: 'HEADER.FIELDS (TO FROM SUBJECT)', struct: true });
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

function searchForNewEmail2(box) {
    imap2.search([box.messages.total + ':*'], function(err, results) {
    	if (err) {
            console.log(err);
        }
        if (!results || results.length === 0) {
            console.log('no new mail in INBOX');
            return;
        }
        var f = imap2.fetch(results, { bodies: 'HEADER.FIELDS (TO FROM SUBJECT)', struct: true });
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

imap.connect(); // connect to imap
imap2.connect(); // connect to imap

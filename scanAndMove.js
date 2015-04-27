var notifier = require('mail-notifier')
, fs = require('fs')
, Imap = require('imap')
, stream = require('stream')
, MailParser = require('mailparser').MailParser;

var filename = __dirname + "/config.json";
var config = JSON.parse (fs.readFileSync(filename,'utf8'));


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

var imap = new Imap(usrInfo);

imap.once('ready', function() {
    openImapMailbox('INBOX');
});

function openImapMailbox(mailBox){
	imap.openBox(mailBox, false, function(err, box) {
		console.log(box);
        searchForNewEmail(box); // initial search/process of data
        imap.on('mail', function (id) {
            searchForNewEmail(box);
        });
    });
}

function searchForNewEmail(box) {
    imap.search(['ALL'], function(err, results) {
    	if (err) {
            console.log(err);
        }
        if (!results || results.length === 0) {
            console.log('no new mail in INBOX');
            return;
        }
        var f = imap.fetch(results, { bodies: 'HEADER.FIELDS (TO FROM SUBJECT)', struct: true });
        console.log("============================================");
        console.log("");
        console.log("SEARCHING " + box.name);
        console.log("");
        console.log("============================================");
        f.on('message', function(msg, seqno) {
        	var mp = new MailParser();
        	var shouldMove, uid;
        	mp.once('end', function (mail) {
                console.log(mail.subject);
                console.log("^^^^^");
                if(mail.subject !== undefined && mail.subject.indexOf("move to spam") != -1){
                	shouldMove = true;
                	if(uid !== undefined){
                		moveMail(uid,"[Gmail]/Spam");
                	}
                }
            });
            msg.once('attributes', function(attrs) {
                uid = attrs.uid;
                if (shouldMove === true){
                  moveMail(uid,"[Gmail]/Spam");
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
    imap.move(uid, box, function(err, code){
        if(err){
            console.log(err);
        }
    })
}

imap.connect(); // connect to imap

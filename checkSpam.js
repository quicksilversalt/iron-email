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
        box: '[Gmail]/Spam',
         tls: true,// use secure connection
        tlsOptions: { rejectUnauthorized: false }
};

var imap = new Imap(usrInfo);

imap.once('ready', function() {
    imap.openBox('[Gmail]/Spam', false, function(err, box) {
        searchForNewEmail(box); // initial search/process of data
        imap.on('mail', function (id) {
            searchForNewEmail(box);
        });
    });
});

function searchForNewEmail(box) {
    imap.search(['ALL'], function(err, results) {
        if (err) {
            console.log(err);
        }
        if (!results || results.length === 0) {
            console.log('no new mail in SPAM');
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
                console.log(mail.from);
                console.log(mail.subject);
                console.log("^^^^^");
            });
            msg.on('body', function(stream, info) {
            	stream.pipe(mp);
                //var buffer = '';
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

imap.connect(); // connect to imap

var notifier = require('mail-notifier')
, fs = require('fs')
, stream = require('stream');

var filename = __dirname + "/config.json";
var config = JSON.parse (fs.readFileSync(filename,'utf8'));

var userConfig = {
        user: config.username,
        password: config.password,
        host: config.imap.host,
        port: config.imap.port,
        markSeen: false,
        //box: '[Gmail]/Spam',
         tls: true,// use secure connection
        tlsOptions: { rejectUnauthorized: false }
};

//---------------------------------------------------------------------------------------------------------
// Mail Processor  mail receive event
//---------------------------------------------------------------------------------------------------------
var mailProcessor  = notifier(userConfig).on('mail', function (mail) {

    //Build a custom json email message from "mail" object.
    //mail has lot of other properties, please use it as per your requirement.
    var msg = {};
    msg.date = mail.date;
    msg.plaintextbody = mail.text;
    msg.subject = mail.subject;
    msg.to = JSON.stringify(mail.to);
    msg.id = mail.messageId;
    msg.from = JSON.stringify(mail.from);
    
    //[Optional]Save the email message to Mongo
   //db.save(JSON.stringify(msg));
   console.log("mail detected");
   console.log(mail.from[0].address);
   console.log("subject is " + JSON.stringify(msg.subject));
   //if(JSON.stringify(msg.subject).indexOf("move to spam") != -1){
   // console.log("should move this to spam!!!!!!!!!!!!!!!!!!!!!");
   //}

    //Check for attachments, if exists extract each attachment and save it to the file system ["uploads" folder] 
    //if (mail.attachments) {
    //    mail.attachments.forEach(function (attachment) {
    //        fs.writeFile( __dirname + "/uploads/" + attachment.generatedFileName, attachment.content, 'base64', function(err) {
    //               if (err!=null)
    //                    console.log("Error = " + err);
    //            });
    //    });
    //}
    //[Optional]Save the email message to file system as .txt/.json
    /*fs.writeFile("/tmp/test/email_" + mail.messageId + '.txt', JSON.stringify(msg), function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("The file was saved!");
        }
    });*/
});

//---------------------------------------------------------------------------------------------------------
// Mail Processor end event
//---------------------------------------------------------------------------------------------------------
mailProcessor.on('end',function(){
  console.log('Mail Processor  ended');
});

//Star the Mail Processor
mailProcessor.start();

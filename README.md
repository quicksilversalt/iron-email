# iron-email
r&amp;d repository for experimenting with using an iron worker to run IMAP chores


requirements:
- have an iron.io account
- have node installed
- have docker installed (and boot2docker if on a mac)
- have iron.io cli installed

steps:
- move a copy of your iron.json file into the directory
- add email password to the config file
- cd into the directory and run npm install
- start up docker and cd into directory from within the VM (if on mac)
- docker run --rm -v "$(pwd)":/worker -w /worker iron/images:node-0.10 sh -c 'node mailProcessor.js'

that should get a version running locally that logs to the docker console.  
in order to stop the process you'll have to kill it from within ubuntu.

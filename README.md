configure .env (my development example is included)

SFTP server's configuration (where the XML files are)
--
SFTP_HOST=XML file host's IP

SFTP_PORT=XML file host's port

SFTP_USER=XML file host's username

SFTP_PASS=XML file host's password

folder from the user's root

XML_FOLDER=./XML_FILES

XML_ARCHIVE=archive

how often the scan should run (seconds)
--
INTERVAL=10

port that the notification server is hosted on (for toast notifications on the UI)
--
NOTIFICATION_SERVER_PORT=3003

port for the UI server's content (basically a very simple API for fetching the data)
--
UI_SERVER_PORT=3001

Database config
--
MONGO_HOST=Database server's IP 
MONGO_PORT=Database's port
MONGO_DB=database
MONGO_USERNAME=database's username
MONGO_PASS=database's password

After that (and installing packages with yarn (npm untested)) you can run it with just yarn index.js and it should work
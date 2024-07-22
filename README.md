
This websites purpose is to allow a user to enter an artist and a specified country, which will return the artists top 10 tracks from the user entered country. 
This uses the spotify API.
If a user doesnt enter a country it will use an API to retrieve that information.
The user entered artist, country, and the number of tracks available for that artist in that country (trackCount) are stored in a MySQL database.
I have also implemented a function to retrieve the last 20 searches done by a user in a JSON format.

This project utlises a variety of web development tools and focuses on both front and backend development.

The tools I have used are as follows:

	- Node.js WebSockets for hosting the website
	- MySQL Databases for storing the searches
	- Server side js for backend communication with database. This includes using express promises.
	- Script js for communicating with APIs. This includes using Fetch.
	- Basic HTML, CSS Skills and Formatting
	- APIs to help me receive required information when needed. (Spotify API, IpInfo API)
	- DOM (document object model) in JSON form when receiving data from APIs

Spotify API is used to retrieve the data for artists, country, albums and top tracks. I use a combination of artists and albums to search data on a song level.

This website can be accessed through the url: http://localhost:3306/index.html as the websocket is running on port 3306.
The database credentials are supplied in server.js as a constant and in the future I plan to encapsulate this by placing in it a config file with abstraction.

To make this work you will need to install the packages shown in top lines of the server.js.
To do this cd to the directory of this project and do "npm i 'package'" and let it intall:

These are the ones you must install:

	- npm i express (Used for app)
	- npm i mysql2 (Used for MySQL db connection)
	- npm i ws (Used for hosting WebSocket)
	

Thank You.

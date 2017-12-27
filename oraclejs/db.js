fs = require('fs');
sqlite = require('sqlite3');
oracledb = require('oracledb');
oracledb.autoCommit = true;
oracledb.outFormat = oracledb.OBJECT;
remote = require('remote');
dialog = remote.require('dialog');
require('jquery-ui');
window.$ = window.jQuery = require('jquery');
photosPerPage = 20;
$(window).mousemove(mouseMoveHandler);
currentMode = "";

createTablesDDL = `
	DROP TABLE albums;
DROP TABLE locations;
DROP TABLE people;
DROP TABLE photos;
DROP TABLE peopleinphotos;
DROP TABLE photosextradata;

CREATE TABLE albums (
    id      INTEGER GENERATED BY DEFAULT ON NULL AS IDENTITY,
    title   VARCHAR2(50) NOT NULL
);

ALTER TABLE albums ADD CONSTRAINT albums_pk PRIMARY KEY ( id );

CREATE TABLE locations (
    id          INTEGER GENERATED BY DEFAULT ON NULL AS IDENTITY,
    name        INTEGER NOT NULL,
    latitude    NUMBER(5,5),
    longitude   NUMBER(5,5)
);

ALTER TABLE locations ADD CONSTRAINT locations_pk PRIMARY KEY ( id );

CREATE TABLE people (
    id     INTEGER GENERATED BY DEFAULT ON NULL AS IDENTITY,
    name   VARCHAR2(50) NOT NULL
);

ALTER TABLE people ADD CONSTRAINT people_pk PRIMARY KEY ( id );

CREATE TABLE peopleinphotos (
    person_id   INTEGER NOT NULL,
    photo_id    INTEGER NOT NULL
);

CREATE TABLE photos (
    id            INTEGER GENERATED BY DEFAULT ON NULL AS IDENTITY,
    path          VARCHAR2(1000) NOT NULL,
    description   VARCHAR2(1000) NULL,
    album_id      INTEGER NOT NULL,
    rating        INTEGER,
    location_id   INTEGER
);

ALTER TABLE photos ADD CONSTRAINT photos_pk PRIMARY KEY ( id );

CREATE TABLE photosextradata (
    id     INTEGER GENERATED BY DEFAULT ON NULL AS IDENTITY,
    data   VARCHAR2(100) NOT NULL
);

ALTER TABLE photosextradata ADD CONSTRAINT photosextradata_pk PRIMARY KEY ( id ); 
`;

oracledb.getConnection(
	{
		user: "system",
		password: "orcl",
		connectString: "localhost/orcl"
	},
	function (err, connection) 
	{
		conn = connection;
		if (err) {
			console.error(err.message);
			return;
		}
		console.log('Connection was successful.');
		
		// EXTRA FUNCTIONS
		conn.all = function (query, callback, bindVariables, options)
		{
			if (bindVariables === undefined || bindVariables === null)
				bindVariables = [];
			if (options == undefined || options == null)
				options = {};
			conn.execute(query, bindVariables, options, function (err, result){
					callback(err, result.rows);
				});
		}
		
		conn.each = function (query, callback, bindVariables, options, finalCallback)
		{
			if (bindVariables === undefined || bindVariables === null)
				bindVariables = [];
			if (options == undefined || options == null)
				options = {};
			console.log(bindVariables);
			conn.execute(query, bindVariables, options, function (err, result) {
				for (var i = 0; i < result.rows.length; i ++) {
					callback(err, result.rows[i]);
				}
				finalCallback();
			});
		}
	}
);

function initDB()
{
	conn.execute(createTablesDDL,
		function(err) {
			if (err) {
				notify("Some error occurred");
				console.error(err);
			}
			else
				notify("Tables created.");
		}
	);
}

function parseRootDirectoryDialog()
{
	dialog.showOpenDialog(
		null,
		{
			title: "Choose root dir",
			properties: ["openDirectory"]
		},
		function(rootDir)
		{
			parseRootDirectory(rootDir[0]);
			root = rootDir[0];
		}
	)
}

function parsePhotosInAlbum(rootDir,albumId)
{
	console.log("album = " + albumId);
	var filenames = fs.readdirSync(rootDir);
	var photoStatement = "BEGIN photoman.insert_photo(:x, :p, :e); END;";
	var photoDetailsArray = [];
	var photoSizeArray = [];
	var currentFileName;

	for (var i = 0; i<filenames.length;i++)
	{
		stats = fs.statSync(rootDir+"/"+filenames[i]);
		if (stats.isFile())
		{
			currentFileName = rootDir+"/"+filenames[i];
			currentFileName = currentFileName.replace(/\\/g, "/");
			//console.log(currentFileName);
			
			bindVariables = [];
			
			//photo details
			bindVariables.push(currentFileName);		
			bindVariables.push(albumId);
			bindVariables.push(stats.size);
			
			conn.execute(photoStatement, bindVariables);
		}
	}
}

function parseRootDirectory(rootDir, addFiles, albumName)
{
	notify("Parsing " + rootDir + "...");
	// get array of filenames
	var filenames = fs.readdirSync(rootDir);
	var directories = [];
	var albumId = -1;
	var stats;

	if (albumName !== undefined)
	{	
		try {
		console.log(albumName);
		var that = this;
		conn.execute("SELECT id FROM albums WHERE title = :title",
		[albumName],
		{ resultSet: true }, // return a Result Set.  Default is false
		function(err, result)
		{
			if (err) {
				notify('Some error occurred.');
				console.error(err);
				return;
			}
			result.resultSet.getRow(function (err, row)
			{
				if (err) {
					return;
				} else if (!row) {
					return;
				} else {
					albumId = row["ID"];
					parsePhotosInAlbum(rootDir, albumId);
				}
			});
		});
		} catch (e)
		{
			console.log("Caught some exception but continuing.");
		}
	};

	for (var i = 0; i<filenames.length;i++)
	{
		stats = fs.statSync(rootDir+"/"+filenames[i]);
		if (stats.isDirectory())
		{
			directories.push(filenames[i]);
		}
	}

	try {
		if (directories.length > 0)
		{
			var statement = "BEGIN photoman.insert_album (:title); END;";
			for (var i = 0; i<directories.length; i++)
			{
				conn.execute(statement, [directories[i]]);
				parseRootDirectory(rootDir + "/" + directories[i] + "/",true,directories[i]);
			}
		}
	} catch (e)
	{
		console.log("Caught some exception but continuing.");
	}
}

window.onload = function init()
{
/*
	db = new sqlite.Database('photos.db');
	if (db)
	{
		notify("Database opened successfully.");
		conn.serialize();
	}
	*/
};

function delPhoto()
{
	var currentPhotoId = currentPhotoList[photoIndex]['ID'];
	conn.execute("DELETE FROM photos WHERE id = ? ", [currentPhotoId], function(error)
	{
		if (error === null)
		{
			currentPhotoList.splice(photoIndex,1);
			$("#photoViewer").animate({opacity:0},500, function(){
				turnOffMode('photo');
				turnOnMode('album');
				displayCurrentPhotoWindow();
			});

		}
	});
}

function setCurrentPhotoRating(rating)
{
	var currentPhotoId = currentPhotoList[photoIndex]['ID'];
	var oldRating = currentPhotoList[photoIndex]['RATING'];
	conn.execute("UPDATE photos SET rating = :x WHERE id = :Y",[rating, currentPhotoId],
		function(error)
		{
			if (error === null)
			{
				$("#rate"+rating).css('backgroundColor','green');
				if (oldRating !== null)
				{
					$("#rate"+oldRating).animate({backgroundColor : 'black'});
				}
				$("#rate"+rating).animate({backgroundColor : 'yellow'});
				currentPhotoList[photoIndex]['RATING'] = rating;
			}
			else
			{
				$("#rate"+rating).css('backgroundColor','red');
			}
		});
}

function updatePhotoDescription()
{
	var currentPhotoId = currentPhotoList[photoIndex]['ID'];
	var newPhotoDescription = $("#photoDesc").html();
	conn.execute("UPDATE photos SET description = :description  WHERE id = :id", [newPhotoDescription, currentPhotoId],
		function(error) {
			if (error !== null)
			{
				$("#photoDesc").css("backgroundColor","red");
			}
			else
			{
				$("#photoDesc").css("backgroundColor","green");

				currentPhotoList[photoIndex]['DESCRIPTION'] = newPhotoDescription;
			}
			$("#photoDesc").animate({backgroundColor:"black"},500);
		})
}

function removePerson(id, callback)
{
	var query = "DELETE FROM people WHERE id = " + id;
	conn.execute(query, callback);
}

function insertPerson(name, callback)
{
	var query = "INSERT INTO people (name) VALUES (:x) ";
	conn.execute(query, [ name ], callback);
}

function insertLocation(name, lat, longitude, callback)
{
	var query = "INSERT INTO locations (name, latitude, longitude) VALUES (:name, :latitude, :longitude) ";
	conn.execute(query, [ name, lat, longitude ], callback);
}

function removeLocation(id, callback)
{
	var query = "DELETE FROM locations WHERE id = " + id;
	conn.execute(query, [], callback);
}

function removeAlbum(id, callback)
{
	var query = "DELETE FROM albums WHERE id = " + id;
	conn.execute(query, [], callback);
}

function insertPersonInPhoto(person_id, photo_id, callback)
{
	var query = "INSERT INTO peopleInPhotos (photo_id, person_id) VALUES (:x,:x)";
	conn.execute(query, [ photo_id, person_id ], callback);
}

function getPeopleInPhoto(photoId, callback)
{
	var query = "SELECT id, name FROM people, peopleInPhotos WHERE peopleInPhotos.person_id = people.id AND photo_id = :x";
	conn.all(query, callback, [ photoId ]);
}

function removePersonFromPhoto(person_id, photo_id, callback)
{
	var query = "DELETE FROM peopleInPhotos WHERE photo_id = :x AND person_id = :y";
	conn.execute(query,  [ photo_id, person_id ], callback);
}

function insertPhotoIntoAlbum(path, album, callback)
{
	var query = "INSERT INTO photos (path, album_id) VALUES (:X,:Y)";
	conn.execute(query, [path, album], callback);
}

function getAlbumName(id, callback)
{
	var query = "SELECT title FROM albums WHERE id = :x";
	conn.all(query, callback, [id] );
}

function getLocationName(id, callback)
{
	var query = "SELECT name FROM locations WHERE id = :x";
	conn.all(query, callback, [id] );
}

function displayAlbums()
{
	var query = "SELECT * FROM albums";
	contents = "<table>";
	conn.each(query,function(err,row){
		contents += "<tr><td><a href='javascript:displayPhotos(" + row['ID'] + ", \"" + row['TITLE'] + "\"" + ")'>" + row['TITLE'] + "</a></td> \
		<td><a href='javascript:removeAlbumClick(" + row['ID'] + ")'>Remove</a></td></tr>";
		console.log(contents);
	}, [], {}, function(err){
		contents += "<tr><td><input id='newAlbumName'></td><td><a href='javascript:addAlbumClick()'>Add new</a></td></tr>";
		contents += "</table>";
		$("#conts").html(contents);
	});
}

function addAlbumClick()
{
	addAlbum($("#newAlbumName").val(), displayAlbums);
}

function addAlbum(name, callback)
{
	var query = "INSERT INTO albums (title) VALUES (:x)";
	conn.execute(query, [name], callback);
}

function getAlbums(callback)
{
	var query = "SELECT * FROM albums";
	conn.all(query, callback);
}

function getLocations(callback)
{
	var query = "SELECT * FROM locations";
	conn.all(query, callback);
}

function movePhotoToAlbum(photoId, albumId, callback)
{
	var query = "UPDATE photos SET album_id = :x WHERE id = :y";
	albumId = parseInt(albumId);
	conn.execute(query, [albumId, photoId], callback);
}

function movePhotoToLocation(photoId, locationId, callback)
{
	var query = "UPDATE photos SET location_id = :x WHERE id = :y";
	conn.execute(query, [locationId, photoId], callback);
}

function removeAlbumClick(id)
{
	removeAlbum(id,
		function(err){
			if (err == null)
			{
				notify("Album removed.");
				displayAlbums();
			}
			else
			{
				notify("Album not removed.");
			}
		});
}
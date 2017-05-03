fs = require('fs');
sqlite = require('sqlite3');
remote = require('remote');
dialog = remote.require('dialog');
require('jquery-ui');
window.$ = window.jQuery = require('jquery');
photosPerPage = 20;
$(window).mousemove(mouseMoveHandler);
currentMode = "";


function displayAlbums()
{
	var query = "SELECT * FROM albums";
	contents = "<ul>";
	db.serialize(function(){
		db.each(query,function(err,row){
			contents += "<li><a href='javascript:displayPhotos(" + row['id'] + ", \"" + row['title'] + "\"" + ")'>" + row['title'] + "</a></li>";
		}, function(err){
			contents += "</ul>";
			$("#conts").html(contents);
		});
	});

}

function displayCurrentPhotoWindow()
{
	var numPhotos = -1;
	contents = "";
	for (var i = currentPhotoWindowFirstIndex; i < currentPhotoWindowFirstIndex + photosPerPage  && i < currentPhotoList.length; i++) {
		numPhotos++;
		if ((numPhotos % 5) === 0) {
			contents += "<tr>";
		}

		var shortTitle = currentPhotoList[i]['path'].substr(currentPhotoList[i]['path'].lastIndexOf("/")+1);

		contents += "<td>" +
			"<a href='javascript:displayPhoto(" + i + ")'>" +
			"<img src='" + currentPhotoList[i]['path'] + "' style='width:19vw; max-height:30vh'></img>" +
			"<div id='photoDesc" + numPhotos + "' class = \"photoDesc\"> " + shortTitle + " </div>" +
			"</a>" +
			"</td>";

		if (((numPhotos+1) % 5) === 0) {
			contents += "</tr>";
		}
	}
	if ((numPhotos+1)%5 != 0)
		contents += "</tr>";
	contents += "</table>";
	$("#conts").html(contents);
}

function displayPhotos(albumId, albumTitle)
{
	currentMode = "album";
	$('#title').html(albumTitle);
	$('#albumViewerCommands').css('display','block');
	var query = "SELECT * FROM photos WHERE album = " + albumId;
	contents = "<table>";
	db.all(query, function(err, data) {
		currentPhotoList = data;
		currentPhotoIndex = 0;
		currentPhotoWindowFirstIndex = 0;
		displayCurrentPhotoWindow();
	});
}

function displayPhoto(index)
{
	turnOffMode(currentMode);
	turnOnMode("photo");
	photoIndex = index;
	updatePhotoDisplay();
}

function turnOffMode(mode)
{
	if (mode == 'album')
	{
		$("#mainViewer").hide();
		$("#commands").hide();
	}
	else if (mode == 'photo')
	{
		$("#photoViewer").hide();
		$("#photoViewer").css('opacity',0);
		$("#photoViewer").css('z-index',-1);
		$("#photoCanvas").css('opacity',0);
	}
}

function turnOnMode(mode)
{
	currentMode = mode;
	if (mode == 'album')
	{
		$("#mainViewer").show();
		$("#commands").show();
	}
	else if (mode == 'photo')
	{
		$("#photoViewer").show();
		$("#photoViewer").css('opacity',1);
		$("#photoViewer").css('z-index',30);
		$("#photoCanvas").css('opacity',1);
	}
}

function updatePhotoDisplay()
{
	$("#photoCanvas").css('background','black url(\'' + currentPhotoList[photoIndex]['path'] + '\') no-repeat fixed center');
	$("#photoCanvas").css('background-size','contain	');
	var shortTitle = currentPhotoList[photoIndex]['path'].substr(currentPhotoList[photoIndex]['path'].lastIndexOf("/")+1);
	$("#photoTitle").html(shortTitle);
	var description = currentPhotoList[photoIndex]['description'];
	console.log(currentPhotoList[photoIndex]);
	if (description === null)
		description = "<i>No description for this photo</i>";
	$("#photoDesc").html(description);
}

function hidePhoto()
{
	turnOffMode(currentMode);
	turnOnMode("album");

}

function nextPhoto()
{
	if (photoIndex < currentPhotoList.length - 1)
		photoIndex ++;
	if (photoIndex > currentPhotoWindowFirstIndex + photosPerPage) {
		currentPhotoWindowFirstIndex += photosPerPage + 1;
		displayCurrentPhotoWindow();
	}
	updatePhotoDisplay();
}

function previousPhoto()
{
	if (photoIndex > 0 )
		photoIndex --;
	if (photoIndex >= 0) {
			currentPhotoWindowFirstIndex -= photosPerPage + 1;
			if (currentPhotoWindowFirstIndex < 0)
				currentPhotoWindowFirstIndex = 0;
			displayCurrentPhotoWindow();
		}
	updatePhotoDisplay();
}

function nextPhotos()
{
	if (currentPhotoWindowFirstIndex < currentPhotoList.length - photosPerPage - 1)
		currentPhotoWindowFirstIndex += photosPerPage;
	displayCurrentPhotoWindow();
}

function prevPhotos()
{
		currentPhotoWindowFirstIndex -= photosPerPage;
		if (currentPhotoWindowFirstIndex < 0)
			currentPhotoWindowFirstIndex = 0;
	displayCurrentPhotoWindow();
}

function initDB()
{
	db.run(`DROP TABLE photos`);
	db.run(`DROP TABLE albums`);

	lastQuerySuccessful = true;
	db.run(`CREATE TABLE photos(
	 id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	 path TEXT NOT NULL,
	 description TEXT NULL,
	 album INTEGER NULL,
	 rating INTEGER NULL,
	 location INTEGER NULL)`, {}, function(err){ lastQuerySuccessful = false;});

	 if (lastQuerySuccessful == false)
	 {
		 notify("Tables NOT created successfully!");
		 return;
	 }

	db.run(`CREATE TABLE albums (
		id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
		title TEXT NULL,
		desc TEXT NULL)`,  {}, function(err){ lastQuerySuccessful = false;});

	if (lastQuerySuccessful == false)
	{
		 notify("Tables NOT created successfully!");
	 	 return;
	}

	notify("Tables created successfully!");
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
	var filenames = fs.readdirSync(rootDir);
	var photoStatement = "INSERT INTO photos (path, album) VALUES ";
	var photoDetailsArray = [];

	for (var i = 0; i<filenames.length;i++)
	{
		stats = fs.statSync(rootDir+"/"+filenames[i]);
		if (stats.isFile())
		{
			photoDetailsArray.push(rootDir+filenames[i]);
			photoDetailsArray.push(albumId);
		}
	}

	if (photoDetailsArray.length > 0)
	{
		photoStatement += "(?, ?), ".repeat(photoDetailsArray.length/2 -1) + "(?, ?)";
		db.serialize(function()
		{
					db.run(photoStatement,photoDetailsArray);
		},function(){
			notify("Finished creating album " + albumName);
		});
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
		db.serialize(function() {
			var that = this;
			db.get("SELECT id FROM albums where title = ?", albumName, function(err, row)
			{
				albumId = row["id"];
				parsePhotosInAlbum(rootDir, albumId);
			});
		}
	)};

	for (var i = 0; i<filenames.length;i++)
	{
		stats = fs.statSync(rootDir+"/"+filenames[i]);
		if (stats.isDirectory())
		{
			directories.push(filenames[i]);
		}
	}

	if (directories.length > 0)
	{
		var statement = "INSERT INTO albums (title) VALUES" + "(?),".repeat(directories.length-1) + "(?)";

		db.run(statement,directories);
		for (var i = 0; i<directories.length; i++)
		{
			parseRootDirectory(rootDir + "/" + directories[i] + "/",true,directories[i]);
		}
	}
}

window.onload = function init()
{
	db = new sqlite.Database('photos.db');
	if (db)
	{
		notify("Database opened successfully.");
		db.serialize();
	}
};

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

function updatePhotoDescription()
{
	var currentPhotoId = currentPhotoList[photoIndex]['id'];
	var newPhotoDescription = $("#photoDesc").html();
	db.run("UPDATE photos SET description = ?  WHERE id = ?", [newPhotoDescription, currentPhotoId],
		function(error) {
			if (error !== null)
			{
				$("#photoDesc").css("backgroundColor","red");
			}
			else
			{
				$("#photoDesc").css("backgroundColor","green");
				currentPhotoList[photoIndex]['description'] = newPhotoDescription;
			}
			$("#photoDesc").animate({backgroundColor:"black"},500);
		})
}

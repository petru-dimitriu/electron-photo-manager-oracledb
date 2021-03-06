fs = require('fs');
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
            conn.execute(query, bindVariables, options, function (err, result) {
                for (var i = 0; i < result.rows.length; i ++) {
                    callback(err, result.rows[i]);
                }
                finalCallback();
            });
        }
    }
);

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
    );
}

function parsePhotosInAlbum(rootDir,albumId)
{
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
    //notify("Parsing " + rootDir + "...");
    // get array of filenames
    var filenames = fs.readdirSync(rootDir);
    var directories = [];
    var albumId = -1;
    var stats;

    if (albumName !== undefined)
    {    
        try {
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

};

function delPhoto()
{
    var currentPhotoId = currentPhotoList[photoIndex]['ID'];
    conn.execute("BEGIN photoman.delete_photo(:x); END; ", [currentPhotoId], function(error)
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
    conn.execute("BEGIN photoman.set_photo_rating(:x, :y); END;",[currentPhotoId, rating],
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
    conn.execute("BEGIN photoman.set_photo_description(:x, :y); END;", [currentPhotoId, newPhotoDescription],
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

function updatePhotoDate()
{
    var currentPhotoId = currentPhotoList[photoIndex]['ID'];
    var newDateTaken = $("#photoDateEdit").val();
    conn.execute("UPDATE photos SET date_taken = TO_DATE(:x, 'DD/MM/YYYY') WHERE id = :y", [newDateTaken, currentPhotoId],
        function(error) {
            if (error !== null)
            {
				console.log("eRR!");
                $("#photoDate").css("backgroundColor","red");
				$("#photoDate").html('Error occured.');
            }
            else
            {
                $("#photoDate").css("backgroundColor","green");
                currentPhotoList[photoIndex]['DATE_TAKEN'] = newDateTaken;
				$("#photoDate").html(newDateTaken);
            }
            $("#photoDate").animate({backgroundColor:"black"},500);
        });
}

function removePerson(id, callback)
{
    var query = "BEGIN photoman.remove_person(:x); END;";
    conn.execute(query,[ id ], callback);
}

function insertPerson(name, callback)
{
    var query = "BEGIN photoman.insert_person(:x); END;";
    conn.execute(query, [ name ], callback);
}

function insertLocation(name, lat, longitude, callback)
{
    var query = "BEGIN photoman.insert_location(:x, :y, :z); END;";
    conn.execute(query, [ name, lat, longitude ], callback);
}

function removeLocation(id, callback)
{
    var query = "BEGIN photoman.remove_location(" + id + "); END;";
    console.log(id);
    conn.execute(query, [], callback);
}

function removeAlbum(id, callback)
{
    var query = "BEGIN photoman.remove_album(" + id + "); END;";
    conn.execute(query, [], callback);
}

function insertPersonInPhoto(person_id, photo_id, callback)
{
    var query = "BEGIN photoman.insert_person_in_photo(:x, :y); END;";
    conn.execute(query, [ person_id,  photo_id ], callback);
}

function getPeopleInPhoto(photoId, callback)
{
    var query = "SELECT id, name FROM people, peopleInPhotos WHERE peopleInPhotos.person_id = people.id AND photo_id = :x";
    conn.all(query, callback, [ photoId ]);
}

function removePersonFromPhoto(person_id, photo_id, callback)
{
    var query = "BEGIN photoman.remove_person_from_photo(:x,:y); END;";
    conn.execute(query,  [ person_id, photo_id ], callback);
}

function insertPhotoIntoAlbum(path, album, callback)
{
    var query = "BEGIN photoman.insert_photo_into_album(:X,:Y); END;";
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

function getLocationCoords(id, callback)
{
	var query = "SELECT longitude, latitude FROM locations WHERE id = :x";
	conn.all(query, callback, [id]);
}

function displayAlbums()
{
    var query = "SELECT * FROM albums";
    contents = "<table>";
    conn.each(query,function(err,row){
        contents += "<tr><td><a href='javascript:displayPhotos(" + row['ID'] + ", \"" + row['TITLE'] + "\"" + ")'>" + row['TITLE'] + "</a></td> \
        <td><a href='javascript:removeAlbumClick(" + row['ID'] + ")'>Remove</a></td></tr>";
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
    var query = "BEGIN photoman.insert_album(:x); END;";
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
    var query = "BEGIN photoman.move_photo_to_album(:x, :y); END;";
    albumId = parseInt(albumId);
    conn.execute(query, [photoId, albumId], callback);
}

function movePhotoToLocation(photoId, locationId, callback)
{
	console.log("moving " + photoId + " to " + locationId);
    var query = "BEGIN update PHOTOS set location_id=:x where id=:y; COMMIT; END;";
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

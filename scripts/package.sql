create or replace package photoman is
  procedure insert_photo (p_path varchar2, p_album_id albums.id%type, p_extra_data photosExtraData.data%type);
  
  procedure insert_album (p_title varchar2);
  
  procedure move_photo_to_album(p_photo_id photos.id%type, p_album_id albums.id%type);
  
  procedure move_photo_to_location(p_photo_id photos.id%type, p_location_id locations.id%type);
  
  procedure remove_person(p_person_id people.id%type);
  
  procedure insert_person(p_person_name people.name%type);
  
  procedure insert_location(p_location_name locations.name%type, p_lat locations.latitude%type, p_long locations.longitude%type);
  
  procedure remove_location(p_location_id locations.id%type);
  
  procedure remove_album(p_album_id albums.id%type);
  
  procedure insert_person_in_photo(p_person_id people.id%type, p_photo_id photos.id%type);
  
  procedure remove_person_from_photo(p_person_id people.id%type, p_photo_id photos.id%type);
  
  procedure insert_photo_into_album(p_path photos.path%type, p_album_id albums.id%type);
  
  procedure set_photo_rating (p_photo_id photos.id%type, p_photo_rating photos.rating%type);
  
  procedure delete_photo (p_photo_id photos.id%type);
  
  procedure set_photo_description(p_photo_id photos.id%type, p_description varchar2);
  
end;


create or replace package body photoman is
  procedure insert_photo (p_path varchar2, p_album_id albums.id%type, p_extra_data photosExtraData.data%type)
  is
  begin
    insert into photos (path, album_id) values (p_path, p_album_id);
    insert into photosExtraData (data) values (p_extra_data);
  end;
  
  procedure insert_album (p_title varchar2) is
  begin
    insert into albums (title) values (p_title);
    commit;
  end;
  
  procedure move_photo_to_album(p_photo_id photos.id%type, p_album_id albums.id%type)
  is
  begin
    update photos set album_id = p_album_id where id = p_photo_id;
    commit;
  end;
  
  procedure move_photo_to_location(p_photo_id photos.id%type, p_location_id locations.id%type)
  is
  begin
    update photos set location_id = p_location_id where id = p_photo_id;
    commit;
  end;
  
  procedure remove_person(p_person_id people.id%type)
  is
  begin
    delete from people where id = p_person_id;
    commit;
  end;
  
  procedure insert_person(p_person_name people.name%type)
  is
  begin
    insert into people (name) values (p_person_name);
    commit;
  end;
  
  procedure insert_location(p_location_name locations.name%type, p_lat locations.latitude%type, p_long locations.longitude%type)
  is
  begin
    insert into locations (name, latitude, longitude) values (p_location_name, p_lat, p_long);
    commit;
  end;
  
  procedure remove_location(p_location_id locations.id%type)
  is
  begin
    delete from locations where id = p_location_id;
    commit;
  end;
  
  procedure remove_album(p_album_id albums.id%type)
  is
  begin
    delete from albums where id = p_album_id;
    commit;
  end;
  
  procedure insert_person_in_photo(p_person_id people.id%type, p_photo_id photos.id%type)
  is
  begin
    insert into peopleInPhotos (photo_id, person_id) values (p_photo_id, p_person_id);
    commit;
  end;
  
  procedure remove_person_from_photo(p_person_id people.id%type, p_photo_id photos.id%type)
  is
  begin
    delete from peopleInPhotos where photo_id = p_photo_id and person_id = p_person_id;
    commit;
  end;
  
  procedure insert_photo_into_album(p_path photos.path%type, p_album_id albums.id%type)
  is
  begin
    insert into photos (path, album_id) values (p_path, p_album_id);
    commit;
  end;
  
  procedure set_photo_rating (p_photo_id photos.id%type, p_photo_rating photos.rating%type)
  is
  begin
    UPDATE photos SET rating = p_photo_rating WHERE id = p_photo_id;
  end;
  
  procedure delete_photo (p_photo_id photos.id%type)
  is
  begin
    DELETE FROM photos WHERE id = p_photo_id;
  end;
  
  procedure set_photo_description(p_photo_id photos.id%type, p_description varchar2)
  is
  begin
    UPDATE photos SET description = p_description WHERE id = p_photo_id;
  end;
  
end photoman;
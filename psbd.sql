DROP TABLE albums CASCADE CONSTRAINTS;
DROP TABLE locations CASCADE CONSTRAINTS;
DROP TABLE people CASCADE CONSTRAINTS;
DROP TABLE photos CASCADE CONSTRAINTS;
DROP TABLE peopleinphotos CASCADE CONSTRAINTS;
DROP TABLE photosextradata CASCADE CONSTRAINTS;
DROP SEQUENCE albums_id_seq;
DROP SEQUENCE locations_id_seq;
DROP SEQUENCE people_id_seq;
DROP SEQUENCE photos_id_seq;
DROP SEQUENCE photosextradata_id_seq;

CREATE TABLE albums (
    id      INTEGER NOT NULL,
    title   VARCHAR2(50) NOT NULL
);

ALTER TABLE albums ADD CONSTRAINT albums_pk PRIMARY KEY ( id );

ALTER TABLE albums ADD CONSTRAINT albums__un UNIQUE ( title );

CREATE TABLE locations (
    id          INTEGER NOT NULL,
    name        VARCHAR2(200) NOT NULL,
    latitude    REAL,
    longitude   REAL
);

ALTER TABLE locations
    ADD CONSTRAINT locations_ck_1 CHECK (
        latitude < 90
        AND latitude >-90
        AND longitude < 180
        AND longitude >-180
    );
 
ALTER TABLE locations ADD CONSTRAINT locations_pk PRIMARY KEY ( id );

CREATE TABLE people (
    id     INTEGER NOT NULL,
    name   VARCHAR2(50) NOT NULL
);

ALTER TABLE people ADD CONSTRAINT people_pk PRIMARY KEY ( id );

CREATE TABLE peopleinphotos (
    person_id   INTEGER NOT NULL,
    photo_id    INTEGER NOT NULL
);

CREATE TABLE photos (
    id            INTEGER NOT NULL,
    path          VARCHAR2(200) NOT NULL,
    description   VARCHAR2(200) NULL,
    album_id      INTEGER NULL,
    rating        INTEGER,
    location_id   INTEGER NULL
);

ALTER TABLE photos ADD CONSTRAINT photos_pk PRIMARY KEY ( id );

CREATE TABLE photosextradata (
    id     INTEGER NOT NULL,
    data   VARCHAR2(100) NOT NULL
);

ALTER TABLE photosextradata ADD CONSTRAINT photosextradata_pk PRIMARY KEY ( id );

ALTER TABLE peopleinphotos
    ADD CONSTRAINT peopleinphotos_people_fk FOREIGN KEY ( person_id )
        REFERENCES people ( id )
        ON DELETE CASCADE;

ALTER TABLE peopleinphotos
    ADD CONSTRAINT peopleinphotos_photos_fk FOREIGN KEY ( photo_id )
        REFERENCES photos ( id )
        ON DELETE CASCADE;

ALTER TABLE photos
    ADD CONSTRAINT photos_albums_fk FOREIGN KEY ( album_id )
        REFERENCES albums ( id )
        ON DELETE CASCADE;

ALTER TABLE photos
    ADD CONSTRAINT photos_locations_fk FOREIGN KEY ( location_id )
        REFERENCES locations ( id )
        ON DELETE CASCADE;

ALTER TABLE photosextradata
    ADD CONSTRAINT photosextradata_photos_fk FOREIGN KEY ( id )
        REFERENCES photos ( id )
        ON DELETE CASCADE;

CREATE SEQUENCE albums_id_seq START WITH 1 NOCACHE ORDER;
CREATE SEQUENCE locations_id_seq START WITH 1 NOCACHE ORDER;
CREATE SEQUENCE people_id_seq START WITH 1 NOCACHE ORDER;
CREATE SEQUENCE photos_id_seq START WITH 1 NOCACHE ORDER;
CREATE SEQUENCE photosextradata_id_seq START WITH 1 NOCACHE ORDER;

CREATE OR REPLACE TRIGGER locations_id_trg BEFORE
    INSERT ON locations
    FOR EACH ROW
    WHEN ( new.id IS NULL )
BEGIN
    :new.id := locations_id_seq.nextval;
END;

CREATE OR REPLACE TRIGGER people_id_trg BEFORE
    INSERT ON people
    FOR EACH ROW
    WHEN ( new.id IS NULL )
BEGIN
    :new.id := people_id_seq.nextval;
END;

CREATE OR REPLACE TRIGGER photos_id_trg BEFORE
    INSERT ON photos
    FOR EACH ROW
    WHEN ( new.id IS NULL )
BEGIN
    :new.id := photos_id_seq.nextval;
END;

CREATE OR REPLACE TRIGGER photos_id_trg BEFORE
    INSERT ON photos
    FOR EACH ROW
    WHEN ( new.id IS NULL )
BEGIN
    :new.id := photos_id_seq.nextval;
END;

CREATE OR REPLACE TRIGGER photosextradata_id_trg BEFORE
    INSERT ON photosextradata
    FOR EACH ROW
    WHEN ( new.id IS NULL )
BEGIN
    :new.id := photosextradata_id_seq.nextval;
END;

CREATE OR REPLACE TRIGGER albums_id_trg BEFORE
    INSERT ON albums
    FOR EACH ROW
    WHEN ( new.id IS NULL )
BEGIN
    :new.id := albums_id_seq.nextval;
END;

CREATE OR REPLACE TRIGGER reasonable_location_name BEFORE
  INSERT OR UPDATE ON locations
  FOR EACH ROW
BEGIN
  if (:new.name LIKE '%<%' OR :new.name LIKE '%>%' OR :new.name LIKE '%#%') then
    raise_application_error(-20750, 'Location name should not contain <># !');
  end if;
END;

CREATE OR REPLACE TRIGGER reasonable_people_names BEFORE
  INSERT OR UPDATE ON people
  FOR EACH ROW
BEGIN
  if (:new.name LIKE '%<%' OR :new.name LIKE '%>%' OR :new.name LIKE '%#%') then
    raise_application_error(-20751, 'Person`s name should not contain <># !');
  end if;
END;

ALTER TABLE photosextradata ADD CONSTRAINT photosextradata_pk PRIMARY KEY ( id ); 

----------------------------------

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
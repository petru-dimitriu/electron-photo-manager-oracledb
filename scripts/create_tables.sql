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

--

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
    location_id   INTEGER NULL,
	date_taken	  DATE
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
# OracleDB photo organizer built around Electron

## Overview
**This is a rewrite of my previous faculty project, this time using OracleDB instead of SQLite. As required by my faculty project specifications, most of the functionality has been moved to PL/SQL stored procedures and triggers.**
Tested on Windows 7.

Part of a faculty project. Simple photo organizer built around Electron. *Caution: rough around the edges.*

Aimed at managing locally-stored photos, with a simplistic and vintage look.

Photos can be:
* organized in albums
* searched through
* tagged with people
* tagged with locations
* rated

The app uses:
* OracleDB database for storing data, which does *not* include the actual photos, but rather the paths to the photos. (via the `node-oracledb` package)
* JQuery

## What it cannot do for now
This is mostly intented to be a proof-of-concept, so for now it is impossible to:
* rename people, places or albums
* set properties for more items at once

## Screenshots
![Electron SQLite manager](https://raw.githubusercontent.com/petru-dimitriu/electron-photo-manager/master/screen/1.png)
![Electron SQLite manager](https://raw.githubusercontent.com/petru-dimitriu/electron-photo-manager/master/screen/2.png)
![Electron SQLite manager](https://raw.githubusercontent.com/petru-dimitriu/electron-photo-manager/master/screen/3.png)
![Electron SQLite manager](https://raw.githubusercontent.com/petru-dimitriu/electron-photo-manager/master/screen/4.png)
![Electron SQLite manager](https://raw.githubusercontent.com/petru-dimitriu/electron-photo-manager/master/screen/5.png)

## Installing
` npm install ` *should* now be enough.

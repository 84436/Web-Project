@ECHO OFF

SET CWD=%~DP0
SET CWD=%CWD:~0,-1%
SET DBPATH=%CWD%\mongo_data

mongod --dbpath %DBPATH%

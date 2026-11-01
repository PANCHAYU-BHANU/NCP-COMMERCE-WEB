@echo off
title NCP COM WEB Backend (Spring Boot)
echo ==============================================
echo   Starting NCP COM WEB Backend on port 8080
echo ==============================================
cd /d "%~dp0ncp-com-web backend"
call mvnw.cmd spring-boot:run
pause

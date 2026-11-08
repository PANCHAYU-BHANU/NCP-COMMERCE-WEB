@echo off
title Cloudflare Tunnel - NCP Commerce Web
echo ==========================================================
echo Starting Cloudflare Tunnel for NCP Commerce Web...
echo Forwarding http://localhost:5173 to Public HTTPS URL...
echo ==========================================================
echo.
echo Look for the URL ending with '.trycloudflare.com' below:
echo (Copy and send that link to Directors / Principals / Teachers)
echo.
echo NOTE: Keep this window open and laptop ON while testing.
echo Press Ctrl+C to stop the tunnel anytime.
echo ==========================================================
echo.
"%~dp0cloudflared.exe" tunnel --url http://localhost:5173
pause


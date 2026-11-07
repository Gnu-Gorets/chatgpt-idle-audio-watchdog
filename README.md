# ChatGPT Idle Audio Watchdog

JavaScript userscript for Violentmonkey/Tampermonkey/etc, aimed at Bluetooth multipoint: with `chatgpt.com` open, headphones stay connected to laptop and phone, but phone audio does not play. Closing ChatGPT tab restores playback.

## How it works

ChatGPT can leave idle WebRTC audio connections open. After 15 seconds, script closes only connections with no remote answer, no live audio sender, and inactive Voice Mode.

Script does not mute normal ChatGPT audio, access microphone, send data, or change Bluetooth settings.

## Install

1. Open Violentmonkey/Tampermonkey/etc dashboard and click **+** to create script.
2. Paste contents of [`chatgpt-idle-audio-watchdog.user.js`](chatgpt-idle-audio-watchdog.user.js) and save.
3. Reload open ChatGPT tabs.

## Limits

Verified with LibreWolf on Linux and Sony WH-1000XM4. ChatGPT updates may change WebRTC behavior. If Voice Mode stops working, disable script and reload ChatGPT.

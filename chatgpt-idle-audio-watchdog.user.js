// ==UserScript==
// @name         ChatGPT Idle Audio Watchdog
// @namespace    https://github.com/GnuGorets/chatgpt-idle-audio-watchdog
// @version      1.0.0
// @description  Releases stale ChatGPT WebRTC audio preconnections that can hold Bluetooth multipoint audio.
// @match        https://chatgpt.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(() => {
    'use strict';

    const graceMs = 15_000;
    const pending = new Map();
    const prototype = window.RTCPeerConnection?.prototype;
    if (!prototype) return;

    const observe = (pc) => {
        if ([...pc.getTransceivers()].some((t) => t.receiver?.track?.kind === 'audio'
                || t.sender?.track?.kind === 'audio')) {
            pending.set(pc, pending.get(pc) ?? Date.now());
        }
    };

    for (const name of ['addTransceiver', 'addTrack', 'createOffer', 'setLocalDescription', 'setRemoteDescription']) {
        const original = prototype[name];
        if (typeof original !== 'function') continue;
        prototype[name] = function (...args) {
            const result = Reflect.apply(original, this, args);
            observe(this);
            return result;
        };
    }

    setInterval(() => {
        const voiceActive = document.querySelector('[aria-label="End voice mode"]');
        for (const [pc, since] of pending) {
            const transceivers = pc.getTransceivers();
            const hasAudio = transceivers.some((t) => t.receiver?.track?.kind === 'audio'
                || t.sender?.track?.kind === 'audio');
            const hasLiveAudioSender = pc.getSenders().some((s) => s.track?.kind === 'audio'
                && s.track.readyState !== 'ended');
            const unnegotiated = pc.remoteDescription == null
                && (pc.localDescription == null || pc.localDescription.type === 'offer');

            if (pc.signalingState === 'closed' || !hasAudio || !unnegotiated || hasLiveAudioSender) {
                pending.delete(pc);
            } else if (!voiceActive && Date.now() - since >= graceMs) {
                pc.close();
                pending.delete(pc);
            }
        }
    }, 1_000);
})();

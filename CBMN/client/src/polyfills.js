import { Buffer } from 'buffer';

// Polyfill for simple-peer capabilities in the browser
window.global = window;
if (!window.process) {
    window.process = { env: {} };
}
if (!window.Buffer) {
    window.Buffer = Buffer;
}

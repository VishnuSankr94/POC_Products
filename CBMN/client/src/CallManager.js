// Native WebRTC Implementation to avoid "simple-peer" polyfill issues (buffer/process/etc)

const RTC_CONFIG = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:global.stun.twilio.com:3478' }
    ]
};

export class CallManager {
    constructor(stream, isInitiator, onSignal, onStream, onClose) {
        this.stream = stream;
        this.isInitiator = isInitiator;
        this.onSignal = onSignal;
        this.onStream = onStream;
        this.onClose = onClose;
        this.peer = null;
        this.remoteStream = new MediaStream();

        this.initialize();
    }

    initialize() {
        console.log("Initializing RTCPeerConnection");
        this.peer = new RTCPeerConnection(RTC_CONFIG);

        // Add local tracks
        this.stream.getTracks().forEach(track => {
            this.peer.addTrack(track, this.stream);
        });

        // Handle remote tracks
        this.peer.ontrack = (event) => {
            console.log("Received remote track");
            event.streams[0].getTracks().forEach(track => {
                this.remoteStream.addTrack(track);
            });
            this.onStream(this.remoteStream);
        };

        // Handle ICE candidates
        this.peer.onicecandidate = (event) => {
            if (event.candidate) {
                this.onSignal({ type: 'candidate', candidate: event.candidate });
            }
        };

        // Connection state changes
        this.peer.onconnectionstatechange = () => {
            console.log("Connection state:", this.peer.connectionState);
            if (this.peer.connectionState === 'disconnected' || this.peer.connectionState === 'failed') {
                if (this.onClose) this.onClose();
            }
        };

        // If initiator, create offer
        if (this.isInitiator) {
            this.createOffer();
        }
    }

    async createOffer() {
        try {
            const offer = await this.peer.createOffer();
            await this.peer.setLocalDescription(offer);
            this.onSignal({ type: 'offer', sdp: offer });
        } catch (err) {
            console.error("Error creating offer:", err);
        }
    }

    async signal(data) {
        try {
            if (!this.peer) return;

            if (data.type === 'offer') {
                await this.peer.setRemoteDescription(new RTCSessionDescription(data.sdp));
                const answer = await this.peer.createAnswer();
                await this.peer.setLocalDescription(answer);
                this.onSignal({ type: 'answer', sdp: answer });
            }
            else if (data.type === 'answer') {
                await this.peer.setRemoteDescription(new RTCSessionDescription(data.sdp));
            }
            else if (data.type === 'candidate') {
                await this.peer.addIceCandidate(new RTCIceCandidate(data.candidate));
            }
        } catch (err) {
            console.error("Error handling signal:", err);
        }
    }

    destroy() {
        if (this.peer) {
            this.peer.close();
            this.peer = null;
        }
    }
}

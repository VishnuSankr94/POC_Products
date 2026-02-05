import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { User, Phone, Video, X, Check, Search, LogOut, Bell, Trash2, Mic, MicOff, VideoOff } from 'lucide-react';
import { CallManager } from './CallManager';
import './index.css';

// Initialize Socket
const socket = io('http://localhost:5000');

function App() {
  const [view, setView] = useState('login'); // login | dashboard | call
  const [username, setUsername] = useState('');
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  // Data State
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [targetName, setTargetName] = useState('');

  // Call State
  const [incomingCall, setIncomingCall] = useState(null);
  const [activeCall, setActiveCall] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const callManagerRef = useRef(null);
  const myVideo = useRef();
  const remoteVideo = useRef();

  useEffect(() => {
    // Socket Events
    socket.on('login_success', (data) => {
      setFriends(data.friends || []);
      setRequests(data.requests || []);
      setView('dashboard');
    });

    socket.on('error', (msg) => alert(msg));

    socket.on('new_request', (from) => {
      setRequests((prev) => [...prev, from]);
    });

    socket.on('friend_added', (newFriend) => {
      setFriends((prev) => [...prev, newFriend]);
      setRequests((prev) => prev.filter(r => r !== newFriend));
    });

    socket.on('friend_removed', (removedName) => {
      setFriends((prev) => prev.filter(f => f !== removedName));
    });

    socket.on('call_incoming', (data) => {
      setIncomingCall(data);
    });

    socket.on('call_accepted', (signal) => {
      if (callManagerRef.current) {
        callManagerRef.current.signal(signal);
      }
    });

    socket.on('ice_candidate', (candidate) => {
      if (callManagerRef.current) {
        callManagerRef.current.signal({ type: 'candidate', candidate });
      }
    });

    return () => {
      socket.off('login_success');
      socket.off('error');
      socket.off('new_request');
      socket.off('friend_added');
      socket.off('friend_removed');
      socket.off('call_incoming');
      socket.off('call_accepted');
      socket.off('ice_candidate');
    };
  }, []);

  // Handle Video Streams
  useEffect(() => {
    if (myStream && myVideo.current) myVideo.current.srcObject = myStream;
  }, [myStream, view]);

  useEffect(() => {
    if (remoteStream && remoteVideo.current) remoteVideo.current.srcObject = remoteStream;
  }, [remoteStream]);


  const login = () => {
    if (username.trim()) socket.emit('login', username);
  };

  const sendRequest = () => {
    if (targetName.trim()) {
      socket.emit('send_request', targetName);
      setTargetName('');
    }
  };

  const acceptRequest = (rName) => {
    socket.emit('accept_request', rName);
  };

  const deleteFriend = (e, fName) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to remove ${fName}?`)) {
      socket.emit('delete_friend', fName);
    }
  };

  // --- Call Logic ---

  const getMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setMyStream(stream);
      return stream;
    } catch (err) {
      console.error("Failed to get media", err);
      alert("Could not access camera/mic");
      return null;
    }
  };

  const toggleMute = () => {
    if (myStream) {
      myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
      setIsMuted(!myStream.getAudioTracks()[0].enabled);
    }
  };

  const toggleVideo = () => {
    if (myStream) {
      myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
      setIsVideoOff(!myStream.getVideoTracks()[0].enabled);
    }
  };

  const startCall = async (friendName) => {
    try {
      const stream = await getMedia();
      if (!stream) {
        alert("Could not get camera/microphone permissions.");
        return;
      }

      setActiveCall({ with: friendName, isCalling: true });
      setView('call');

      const manager = new CallManager(stream, true,
        (signalData) => {
          if (signalData.type === 'candidate') {
            socket.emit('ice_candidate', { to: friendName, candidate: signalData.candidate });
          } else {
            socket.emit('call_user', { userToCall: friendName, signalData, from: username });
          }
        },
        (remStream) => setRemoteStream(remStream),
        () => endCall()
      );
      callManagerRef.current = manager;
    } catch (err) {
      console.error("Start Call Failed:", err);
      alert("Failed to start call: " + err.message);
    }
  };

  const answerCall = async () => {
    const stream = await getMedia();
    if (!stream) return;

    const callerName = activeCall?.with || incomingCall.from;
    setActiveCall({ with: callerName, isCalling: false });
    setView('call');
    setIncomingCall(null);

    const manager = new CallManager(stream, false,
      (signalData) => {
        if (signalData.type === 'candidate') {
          socket.emit('ice_candidate', { to: callerName, candidate: signalData.candidate });
        } else {
          socket.emit('answer_call', { to: callerName, signal: signalData });
        }
      },
      (remStream) => setRemoteStream(remStream),
      () => endCall()
    );

    manager.signal(incomingCall.signal);
    callManagerRef.current = manager;
  };

  const endCall = () => {
    if (callManagerRef.current) {
      callManagerRef.current.destroy();
      callManagerRef.current = null;
    }
    if (myStream) {
      myStream.getTracks().forEach(t => t.stop());
      setMyStream(null);
    }
    setRemoteStream(null);
    setActiveCall(null);
    setView('dashboard');
    window.location.reload();
  };


  // --- UI Renders ---

  // 1. Login View
  if (view === 'login') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black text-white p-4">
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
          <div className="relative bg-black/80 backdrop-blur-xl p-10 rounded-2xl shadow-2xl w-full max-w-md ring-1 ring-white/10">
            <div className="mb-8 text-center">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/20">
                <User className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">CallByName</h1>
              <p className="text-gray-400 mt-2 font-light">Connect with friends, simply.</p>
            </div>

            <div className="space-y-5">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                <input
                  className="w-full pl-12 pr-4 py-4 bg-gray-900/50 border border-gray-700 rounded-xl outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all text-white placeholder-gray-600"
                  placeholder="Enter your unique name"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && login()}
                />
              </div>
              <button onClick={login} className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 py-4 rounded-xl font-bold shadow-lg shadow-purple-900/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2">
                Get Started <span className="text-xl">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Call View
  if (view === 'call') {
    return (
      <div className="flex flex-col h-screen bg-gray-950 text-white relative overflow-hidden">

        {/* Gradient Background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-gray-900/50 to-black z-0"></div>

        {/* Header */}
        <div className="absolute top-0 left-0 right-0 p-6 z-20 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent">
          <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_#22c55e]"></div>
            <span className="font-medium tracking-wide text-sm text-gray-200">CALL WITH</span>
            <span className="font-bold text-lg text-white">{activeCall?.with}</span>
          </div>
        </div>

        {/* Main Video (Remote) */}
        <div className="flex-1 relative z-10 flex items-center justify-center w-full h-full">
          {remoteStream ? (
            <video ref={remoteVideo} autoPlay className="w-full h-full object-cover" />
          ) : (
            <div className="flex flex-col items-center gap-4 text-gray-400 animate-pulse">
              <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center">
                <User className="w-10 h-10 opacity-50" />
              </div>
              <p className="text-xl font-light">Connecting to {activeCall?.with}...</p>
            </div>
          )}
        </div>

        {/* My Video (PIP) */}
        <div className="absolute bottom-32 right-6 w-48 h-64 bg-black/50 rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-30 transition-transform hover:scale-105 duration-300">
          <video ref={myVideo} autoPlay muted className="w-full h-full object-cover mirrored" />
          <div className="absolute bottom-2 left-2 text-xs font-bold text-white/80 bg-black/40 px-2 py-1 rounded-md backdrop-blur-sm">YOU</div>
        </div>

        {/* Controls Bar */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-6 p-4 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
          <button onClick={toggleMute} className={`p-4 rounded-xl transition-all ${isMuted ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-gray-700/50 text-white hover:bg-gray-700'}`}>
            {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>

          <button onClick={endCall} className="p-5 bg-red-600 rounded-2xl hover:bg-red-500 shadow-lg shadow-red-600/30 transition-all active:scale-95">
            <Phone className="w-8 h-8 rotate-[135deg]" />
          </button>

          <button onClick={toggleVideo} className={`p-4 rounded-xl transition-all ${isVideoOff ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-gray-700/50 text-white hover:bg-gray-700'}`}>
            {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
        </div>
      </div>
    )
  }

  // 3. Dashboard View
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black text-gray-100 font-sans selection:bg-purple-500/30">

      {/* Incoming Call Overlay */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center backdrop-blur-md">
          <div className="bg-gray-900 p-10 rounded-3xl shadow-2xl border border-gray-700/50 flex flex-col items-center gap-8 animate-in zoom-in-95 duration-300 max-w-sm w-full relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 to-blue-500/10 z-0"></div>

            <div className="relative z-10 w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl ring-4 ring-black/50">
              {incomingCall.from[0].toUpperCase()}
            </div>
            <div className="relative z-10 text-center space-y-2">
              <h3 className="text-3xl font-bold text-white">{incomingCall.from}</h3>
              <p className="text-purple-300 animate-pulse">Incoming Video Call...</p>
            </div>
            <div className="relative z-10 flex gap-6 w-full justify-center">
              <button onClick={() => setIncomingCall(null)} className="flex-1 p-4 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20 flex justify-center">
                <X className="w-8 h-8" />
              </button>
              <button onClick={answerCall} className="flex-1 p-4 bg-green-500 text-white rounded-2xl hover:bg-green-400 shadow-lg shadow-green-500/20 transition-all hover:-translate-y-1 flex justify-center">
                <Phone className="w-8 h-8 animate-bounce" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <span className="font-bold text-white text-lg">C</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight">CallByName</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
              <User className="w-4 h-4 text-purple-400" />
              <span className="font-medium text-sm">{username}</span>
            </div>
            <button onClick={() => window.location.reload()} className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* Left Column: Friends List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-bold flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-500/20 text-blue-400 rounded-lg flex items-center justify-center"><User className="w-5 h-5" /></span>
              My Friends
              <span className="text-base font-normal text-gray-500 ml-2">({friends.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {friends.length === 0 ? (
              <div className="col-span-full border-2 border-dashed border-gray-700/50 rounded-2xl p-10 flex flex-col items-center text-center text-gray-500 bg-gray-800/20">
                <User className="w-12 h-12 mb-4 opacity-50" />
                <p className="text-lg">No friends yet.</p>
                <p className="text-sm">Search for someone to start calling!</p>
              </div>
            ) : (
              friends.map(friend => (
                <div key={friend} className="group bg-gray-800/40 hover:bg-gray-800/80 backdrop-blur-sm p-5 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all flex justify-between items-center shadow-sm hover:shadow-xl hover:shadow-purple-500/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-600 rounded-full flex items-center justify-center font-bold text-lg shadow-inner">
                      {friend[0].toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{friend}</h4>
                      <span className="text-xs text-green-400 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span> Online
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={(e) => deleteFriend(e, friend)} className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100" title="Remove Friend">
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <button onClick={() => startCall(friend)} className="p-3 bg-purple-600 text-white rounded-xl hover:bg-purple-500 shadow-lg shadow-purple-600/20 transition-all active:scale-95">
                      <Video className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="space-y-8">

          {/* Add Friend Card */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Search className="w-24 h-24 rotate-12" />
            </div>

            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 relative z-10">
              <Search className="text-purple-400" /> Find People
            </h3>

            <div className="flex flex-col gap-3 relative z-10">
              <input
                className="w-full bg-black/40 border border-gray-700 rounded-xl px-4 py-3 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors text-white placeholder-gray-500"
                placeholder="Type exact username..."
                value={targetName}
                onChange={e => setTargetName(e.target.value)}
              />
              <button onClick={sendRequest} className="w-full bg-white text-black hover:bg-gray-200 py-3 rounded-xl font-bold transition-colors">
                Send Request
              </button>
            </div>
          </div>

          {/* Requests List */}
          <div className="bg-gray-800/30 rounded-3xl p-6 border border-white/5">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Bell className="text-yellow-400" /> Requests
              {requests.length > 0 && <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">{requests.length}</span>}
            </h3>

            <div className="space-y-3">
              {requests.length === 0 ? (
                <p className="text-gray-500 text-sm">No new requests.</p>
              ) : (
                requests.map(req => (
                  <div key={req} className="flex justify-between items-center bg-black/40 p-4 rounded-xl border border-gray-700/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center text-xs font-bold">
                        {req[0]}
                      </div>
                      <span className="font-medium">{req}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => acceptRequest(req)} className="p-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500 hover:text-white transition-colors">
                        <Check className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;

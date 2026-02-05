# Call By Name System

## Overview
A WebRTC-based calling application where users connect via unique usernames instead of phone numbers. 
Requires mutual friend acceptance before calling.

## Prerequisites
- Node.js installed.

## How to Run

1. **Start the Server**
   ```bash
   cd server
   node server.js
   ```
   (Runs on port 5000)

2. **Start the Client**
   Open a new terminal:
   ```bash
   cd client
   npm run dev
   ```
   (Typically runs on port 5173 or similar, check console output)

## Usage
1. Open the Client URL in two different tabs/windows.
2. Enter a unique name in each (e.g., "Alice" and "Bob").
3. **Alice**: Type "Bob" in the "Add Friend" box and click Add.
4. **Bob**: Check the "Requests" section and click the Green Checkmark to accept.
5. Once friends, click the Video icon next to the friend's name to call.
6. The other user will see an incoming call popup. Answer it to connect!

## Notes
- **In-Memory Storage**: If you restart the server, all users and friends are lost.
- **Microphone/Camera**: Allow browser permissions when asked.

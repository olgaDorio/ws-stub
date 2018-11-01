'use strict';

const express = require('express');
const SocketServer = require('ws').Server;
const path = require('path');

const PORT = process.env.PORT || 3000;
const INDEX = path.join(__dirname, 'index.html');

const server = express()
  .use((req, res) => res.sendFile(INDEX))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`));

const wss = new SocketServer({ server });

const getInfo = () => {
  const uptime = Math.round(process.uptime());
  const gcLength = uptime % 15;
  const gsLength = Math.max(gcLength - 2, 0);
  const lcLength = Math.max(gsLength - 7, 0);

  return {
    summary: {
      daemonsStatus: {
        grabber: (gcLength || gsLength) ? 'Active' : 'Inactive',
        localStreamer: lcLength ? 'Active' : 'Inactive',
      }
    },
    grabber: {
      substreams: Array.from({length: gsLength}, (v, i) => {
        return {
          width: uptime,
          height: uptime,
          name: `${i}${i}${i}`,
        }
      }),
      channels: Array.from({ length: gcLength }, () => {
        return Math.round(Math.random() * 10) % 3 ? "on" : "off";
      })
    },
    localStreamer: {
      channels: Array.from({length: lcLength}, (v, i) => {
        return {
          channelName: `Channel ${i}`,
          originalUrl: `http://127.0.0.${i}:${uptime}/somePath`,
        }
      })
    }
  };
};

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.on('close', () => console.log('Client disconnected'));
});

setInterval(() => {
  wss.clients.forEach((client) => {
    client.send(JSON.stringify(getInfo(), null, '\n\t'));
  });
}, 1000);

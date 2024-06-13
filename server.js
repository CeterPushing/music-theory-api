// server.js
const express = require('express');
const teoria = require('teoria');
const { Midi } = require('@tonejs/midi');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Scale Endpoint
app.get('/scale/:root/:type', (req, res) => {
  const { root, type } = req.params;
  const scale = teoria.scale(root, type);
  res.json(scale.simple());
});

// Chord Endpoint
app.get('/chord/:root/:type', (req, res) => {
  const { root, type } = req.params;
  const chord = teoria.chord(root, type);
  res.json(chord.simple());
});

// MIDI Conversion Endpoint
app.get('/text-to-midi', async (req, res) => {
  const notes = req.query.notes.split(','); // Comma-separated note names
  const midi = new Midi();
  const track = midi.addTrack();
  notes.forEach((note, index) => {
    track.addNote({
      midi: teoria.note(note).midi(),
      time: index * 0.5, // Half note spacing
      duration: 0.5,
    });
  });
  const filePath = 'riff.mid';
  fs.writeFileSync(filePath, Buffer.from(midi.toArray()));
  res.download(filePath, 'riff.mid');
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

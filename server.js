// server.js
const express = require('express');
const teoria = require('teoria');
const MidiWriter = require('midi-writer-js');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3000;

// Function to validate and process each note
function parseNoteToMidi(note) {
  try {
    const teoriaNote = teoria.note(note);
    const midiValue = teoriaNote.midi();
    const noteName = teoriaNote.name().toUpperCase() + (teoriaNote.accidental() || '') + teoriaNote.octave();
    return { note, midiValue, noteName, success: true };
  } catch (error) {
    return { note, error: error.message, success: false };
  }
}

// Endpoint to fetch scales
app.get('/scale/:root/:type', (req, res) => {
  const { root, type } = req.params;
  try {
    let scale;
    scale = teoria.scale(root, type);
    res.json(scale.simple());
  } catch (error) {
    res.status(400).json({ error: 'Invalid Scale' });
  }
});

// Endpoint to fetch chords
app.get('/chord/:root/:type', (req, res) => {
  const { root, type } = req.params;
  try {
    const chord = teoria.chord(root, type);
    res.json(chord.simple());
  } catch (error) {
    res.status(400).json({ error: 'Invalid Chord' });
  }
});

// MIDI Conversion Endpoint using Direct MIDI Values
app.get('/text-to-midi', (req, res) => {
  const notes = req.query.notes.split(','); // Comma-separated note names
  const track = new MidiWriter.Track();
  let allNotesValid = true;

  notes.forEach((note, index) => {
    const result = parseNoteToMidi(note);
    if (result.success) {
      console.log(`Adding note ${note} (MIDI ${result.midiValue}) as ${result.noteName} at tick ${index * 128}`);
      track.addEvent(new MidiWriter.NoteEvent({
        pitch: [result.midiValue],
        duration: '4', // Quarter note duration
        tick: index * 128, // Use tick for precise placement
        velocity: 50, // Default velocity
      }));
    } else {
      allNotesValid = false;
      console.error(`Error processing note ${note}: ${result.error}`);
    }
  });

  if (allNotesValid) {
    const write = new MidiWriter.Writer(track);
    const midiData = write.buildFile();
    const filePath = 'riff.mid';
    fs.writeFileSync(filePath, Buffer.from(midiData));
    res.download(filePath, 'riff.mid');
  } else {
    res.status(400).json({ error: 'Invalid notes encountered. See logs for details.' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

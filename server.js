// server.js
const express = require('express');
const teoria = require('teoria');
const MidiWriter = require('midi-writer-js');
const fs = require('fs');
const path = require('path');
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

// Generate MIDI file from note list
function generateMidiFile(notes, outputPath) {
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
    fs.writeFileSync(outputPath, Buffer.from(midiData));
    console.log(`MIDI file written to ${outputPath}`);
    return true;
  } else {
    console.error('Error: One or more notes were invalid. See logs for details.');
    return false;
  }
}

// Endpoint to convert notes to MIDI
app.get('/text-to-midi', (req, res) => {
  const notesParam = req.query.notes;
  if (!notesParam) {
    return res.status(400).json({ error: 'No notes provided' });
  }

  const notes = notesParam.split(','); // Comma-separated note names
  const outputPath = path.join(__dirname, 'riff.mid');

  if (generateMidiFile(notes, outputPath)) {
    const downloadUrl = `${req.protocol}://${req.get('host')}/riff.mid`;
    res.json({ download_url: downloadUrl });
  } else {
    res.status(400).json({ error: 'Failed to generate MIDI file' });
  }
});

// Serve the MIDI file for download
app.use('/riff.mid', (req, res) => {
  const filePath = path.join(__dirname, 'riff.mid');
  res.download(filePath, 'riff.mid', (err) => {
    if (err) {
      console.error('Error sending MIDI file:', err);
      res.status(500).send('Error downloading the file.');
    }
  });
});

// Start the server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

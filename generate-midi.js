// generate-midi.js
const teoria = require('teoria');
const MidiWriter = require('midi-writer-js');
const fs = require('fs');

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

// Function to generate MIDI file from note list
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
  } else {
    console.error('Error: One or more notes were invalid. See logs for details.');
  }
}

// List of notes to convert (Modify this list to test different notes)
const notes = ['E4', 'F4', 'G#4', 'A4', 'B4', 'C5', 'D5'];
const outputPath = 'output.mid';

generateMidiFile(notes, outputPath);

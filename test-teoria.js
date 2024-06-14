// test-teoria.js
const teoria = require('teoria');

const testNotes = ['E4', 'F4', 'G#4', 'A4', 'B4', 'C5', 'D5'];

testNotes.forEach(note => {
  try {
    const teoriaNote = teoria.note(note);
    console.log(`Note: ${note}, MIDI: ${teoriaNote.midi()}`);
  } catch (error) {
    console.error(`Error processing note ${note}:`, error.message);
  }
});

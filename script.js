const notesKey = 'notes';
let notes = JSON.parse(localStorage.getItem(notesKey)) || [];

function saveNotes() {
    localStorage.setItem(notesKey, JSON.stringify(notes));
}

function addNoteToDOM(id, content = '', isArchived = false, colNum) {
    const container = isArchived ? document.getElementById('archivedNotesContainer') : document.getElementById('notesContainer');
    const theCol = container.getElementsByClassName('col-md-4')[colNum];
    const cardHtml = `
            <div class="col my-2 note-card" data-id="${id}">
                <div class="card">
                    <div class="card-body" >
                        <textarea class="form-control autogrow" placeholder="Take a note..." oninput="autoGrow(this); updateNoteContent(${id}, this.value);"  ${isArchived ? 'disabled' : ''}>${content}</textarea>
                        <button class="btn btn-outline-danger mt-2" onclick="deleteNote(${id})"><i class="bi bi-trash"></i></button>
                        ${!isArchived ? `<button class="btn btn-outline-warning mt-2" onclick="archiveNote(${id})"><i class="bi bi-archive"></i></button>` : ''}
                    </div>
                </div>
            </div>`;
    // add cardHtml as child of theCol
    theCol.insertAdjacentHTML('beforeend', cardHtml);

    // trigger autoGrow for the new textarea
    autoGrow(theCol.lastElementChild.querySelector('textarea'));

    const noteCard = theCol.lastElementChild;
    const textarea = noteCard.querySelector('textarea');
    const buttons = noteCard.querySelectorAll('button');

    textarea.addEventListener('focus', () => noteCard.classList.add('show-buttons'));
    textarea.addEventListener('blur', (event) => {
        // Check if the new focused element is within the note card
        if (!noteCard.contains(event.relatedTarget)) {
            noteCard.classList.remove('show-buttons');
        }
    });

    // Ensure buttons don't hide if they're clicked
    buttons.forEach(button => {
        button.addEventListener('focus', () => noteCard.classList.add('show-buttons'));
    });
}

function autoGrow(element) {
    element.style.height = '5px';
    element.style.height = (element.scrollHeight) + 'px';
}

function updateNoteContent(id, content) {
    const noteIndex = notes.findIndex(note => note.id === id);
    if (noteIndex !== -1) {
        notes[noteIndex].content = content;
        saveNotes();
    }
}

function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    saveNotes();
    document.querySelector(`.note-card[data-id="${id}"]`).remove();
}

function archiveNote(id) {
    const noteIndex = notes.findIndex(note => note.id === id);
    const archivedNotesCount = notes.filter(note => note.isArchived).length;
    if (noteIndex !== -1) {
        notes[noteIndex].isArchived = true;
        saveNotes();
        document.querySelector(`.note-card[data-id="${id}"]`).remove();
        addNoteToDOM(notes[noteIndex].id, notes[noteIndex].content, true, archivedNotesCount % 3);
    }
}

document.getElementById('addNote').addEventListener('click', function () {
    const noteId = notes.length > 0 ? Math.max(...notes.map(note => note.id)) + 1 : 1;
    const newNote = { id: noteId, content: '', isArchived: false };
    notes.push(newNote);
    addNoteToDOM(newNote.id, newNote.content, false, notes.length % 3);
    saveNotes();
});

window.addEventListener('storage', function (event) {
    if (event.key === notesKey) {
        notes = JSON.parse(event.newValue) || [];
        document.getElementById('notesContainer').innerHTML = ''; // Clear existing notes
        document.getElementById('archivedNotesContainer').innerHTML = ''; // Clear archived notes
        renderNotes(notes);
    }
});

function renderNotes(notes) {
    let nonArchivedCount = 0;
    let archivedCount = 0;

    notes.forEach((note) => {
        if (!note.isArchived) {
            // For non-archived notes, use nonArchivedCount instead of index
            addNoteToDOM(note.id, note.content, false, nonArchivedCount % 3);
            nonArchivedCount++;
        } else {
            // For archived notes, use archivedCount instead of index
            addNoteToDOM(note.id, note.content, true, archivedCount % 3);
            archivedCount++;
        }
    });
}

// initial render
renderNotes(notes);
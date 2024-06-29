document.addEventListener('DOMContentLoaded', () => {
  const notesList = document.getElementById('notes');
  const noteBookList = document.getElementById('notebookList');
  const notesListSection = document.getElementById("notesListSection");
  notesList.innerText = "Select a Notebook to view your Notes!";
  let currentNotebook = null;
  let refresh = false;

  renderNotebooks();

  function renderNotebooks() {
      noteBookList.innerHTML = "";
      notesList.innerHTML = "Select a Notebook to view your Notes!";
      chrome.storage.local.get({noteBooks: []}, (result) => {
          let noteBooks = result.noteBooks;
          if (noteBooks.length > 0) {
              noteBooks.forEach((notebook, index) => {
                  const li = document.createElement('li');
                  li.textContent = notebook.name;
                  li.addEventListener('click', () => {
                      selectNotebook(index, li);
                  });
                  noteBookList.appendChild(li);
              });
          } else {
              notesListSection.innerText = "No notes yet.\n Save your first note to get started !!!";
          }
      });
  }

  function selectNotebook(index, noteBookElement) {
      if (refresh || currentNotebook !== noteBookElement) {
          refresh = false;
          if (currentNotebook) {
              currentNotebook.style.backgroundColor = '#fff';
              currentNotebook.style.color = 'black';
          }
          noteBookElement.style.backgroundColor = '#28a745';
          noteBookElement.style.color = '#fff';
          currentNotebook = noteBookElement;
          notesList.innerHTML = '';

          chrome.storage.local.get({noteBooks: []}, (result) => {
              const noteBooks = result.noteBooks;
              const noteBook = noteBooks[index];
              const notes = noteBook.notes;

              notes.forEach((note, noteIndex) => {
                  const li = document.createElement('li');
                  const notediv = document.createElement('p');
                  const linkdiv = document.createElement('div');
                  const actionsDiv = document.createElement('div');

                  notediv.innerText = note.note;
                  li.append(notediv);

                  linkdiv.innerHTML = `<a href="${note.url}" target="_blank">🔗 link</a>`;

                  const deleteButton = document.createElement('div');
                  deleteButton.innerHTML = "<img src='assets/deleteicon.png' width='14'></img>";
                  deleteButton.classList.add('button');

                  actionsDiv.classList.add('note-actions');
                  actionsDiv.append(linkdiv);
                  actionsDiv.append(deleteButton);
                  li.append(actionsDiv);

                  deleteButton.addEventListener('click', () => {
                      notes.splice(noteIndex, 1);
                      chrome.storage.local.set({noteBooks}, () => {
                          refresh = true;
                          selectNotebook(index, noteBookElement);
                      });
                  });

                  notesList.appendChild(li);
              });

              if (document.querySelector(".deleteButton")) {
                  document.querySelector(".deleteButton").remove();
              }

              const deleteNotebook = document.createElement('button');
              deleteNotebook.classList.add('deleteButton');
              deleteNotebook.innerText = "Delete Notebook";
              notesListSection.appendChild(deleteNotebook);

              deleteNotebook.addEventListener('click', () => {
                  noteBooks.splice(index, 1);
                  chrome.storage.local.set({noteBooks}, () => {
                      currentNotebook = null;
                      deleteNotebook.remove();
                      renderNotebooks();
                  });
              });
          });
      }
  }

  let summarizeBtn = document.getElementById("summarizeButton");
  summarizeBtn.addEventListener("click",function(){
    summarizeBtn.disabled = true;
    summarizeBtn.innerText = "Summarizing...";
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => { 
      const url = tabs[0].url;
      summarizeText(url);
    })
});

function summarizeText(url){
    let APItoken = "api token";
    const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apy-token': APItoken,
        },
        body: `{"url":"${url}"}`
      };
      
      fetch('https://api.apyhub.com//ai/summarize-url', options)
        .then(response => response.json())
        .then(response => {
            console.log(response);
            if(response.data.summary){
                let app = document.getElementById("app");
            app.innerHTML = "";
            let summarySection = document.createElement("div");
            summarySection.classList.add("summarySection");

            let textDiv = document.createElement("div");
            textDiv.classList.add("summary");
            textDiv.innerText = response.data.summary;
            summarySection.appendChild(textDiv);

            const actionsDiv = document.createElement("div");
            actionsDiv.classList.add("note-actions");

            const newNotebookInput = document.createElement('input');
            newNotebookInput.type = 'text';
            newNotebookInput.placeholder = 'New Notebook Name';
            actionsDiv.appendChild(newNotebookInput);

            const addNote = document.createElement('button');
              addNote.classList.add('deleteButton');
              addNote.innerText = "Add to Notebook";
              actionsDiv.appendChild(addNote);

              addNote.addEventListener('click',()=>{
                addToNewNotebook(newNotebookInput.value,response.data.summary,url);
              })

              summarySection.appendChild(actionsDiv);
              app.appendChild(summarySection);
            }
            else{
                alert("Could not summarize this page");
            }
            summarizeBtn.disabled = false;
            summarizeBtn.innerText = "Summarize this Page";
            
        })
        .catch(err => {
            console.error(err);
            summarizeBtn.disabled = false;
            summarizeBtn.innerText = "Summarize this Page";
            alert("Could not summarize this page");
        });
}
function addToNewNotebook(notebookName, noteContent,url) {
    chrome.storage.local.get({ noteBooks: [] }, (result) => {
        const noteBooks = result.noteBooks;
        noteBooks.push({ name: notebookName, notes: [{ note: noteContent, url: url }] });
        chrome.storage.local.set({ noteBooks }, () => {
            window.close();
        });
    });
}

});

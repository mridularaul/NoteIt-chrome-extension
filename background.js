chrome.runtime.onInstalled.addListener(() => {
    createContextMenu();
  });
  
  chrome.runtime.onStartup.addListener(() => {
    createContextMenu();
  });
  
  function createContextMenu() {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: "saveNote",
        title: "Save to Notes",
        contexts: ["selection"]
      });
      chrome.contextMenus.create({
        id: "addNotebook",
        title: "Save to New Notebook",
        parentId: "saveNote",
        contexts: ["selection"]
      });
      chrome.storage.local.get({noteBooks:[]}, (result)=>{
        const notebooks = result.noteBooks;
        if(notebooks.length > 0){
          notebooks.forEach(notebook => {
            chrome.contextMenus.create({
              id: notebook["name"],
              title: `Save to ${notebook["name"]}`,
              parentId: "saveNote",
              contexts: ["selection"]
            });
          });
        }
      });
    });
    
  }
  
  chrome.contextMenus.onClicked.addListener((info, tab) => {
    
    if (info.parentMenuItemId === "saveNote" && info.selectionText && info.selectionText.trim() != "") {
        if(info.menuItemId === "addNotebook"){
          chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['contentScript.js']
        }, () => {
            chrome.tabs.sendMessage(tab.id, { action: 'showPrompt' }, (response) => {
                if (response && response.notebookName) {
                    addNotebook(response.notebookName, info, tab.url);
                }
            });
        });
        }
        else{
          selectNotebook(info,tab.url);
        }
    }
  });

  function addNotebook (notebookName,info,tabUrl){
    if(notebookName){
      chrome.storage.local.get({noteBooks:[]}, (result)=>{
        const newNotebooks = result.noteBooks;
        newNotebooks.push({ name: notebookName, notes: [{"note" : info.selectionText , "url" : tabUrl}] });
        chrome.storage.local.set({noteBooks: newNotebooks},()=>{
          chrome.contextMenus.create({
            id: notebookName,
            title: `Save to ${notebookName}`,
            parentId: "saveNote",
            contexts: ["selection"]
          });
        });
      });
      
    };

  };

  function selectNotebook(info,tabUrl){
    const notebookName = info.menuItemId;
      chrome.storage.local.get({noteBooks:[]}, (result)=>{
        const newNotebooks = result.noteBooks;
        
        for(let newNotebook of newNotebooks){
          if(newNotebook.name===notebookName){
            newNotebook.notes.push({"note" : info.selectionText , "url" : tabUrl});
            break;
          }
        }
        chrome.storage.local.set({noteBooks: newNotebooks});
      })


  }
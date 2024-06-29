  function showPrompt(text, callback) {
    // Create modal elements
    const modal = document.createElement('div');
    const input = document.createElement('input');
    const okButton = document.createElement('button');
    const closeButton = document.createElement('button');

    // Style the modal
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.padding = '20px';
    modal.style.backgroundColor = '#f4f4f4';
    modal.style.boxShadow = '0px 0px 10px rgba(0, 0, 0, 0.1)';
    modal.style.zIndex = '10000';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.alignItems = 'center';
    modal.style.border = '2px';
    

    input.type = 'text';
    input.placeholder = text;
    input.style.width = '100%';
    input.style.marginBottom = '10px';
    input.style.padding = '10px';
    input.style.fontSize = '16px';
    input.style.boxSizing = 'border-box';

    okButton.textContent = 'Ok';
okButton.style.padding = '5px 10px';
okButton.style.backgroundColor = '#28a745';
okButton.style.color = 'white';
okButton.style.border = 'none';
okButton.style.borderRadius = '4px';
okButton.style.cursor = 'pointer';
okButton.style.display = 'inline-block';
okButton.style.width = 'auto';
okButton.style.margin = '5px';
okButton.style.fontSize = '16px';

okButton.onmouseover = () => okButton.style.backgroundColor = '#218838';
okButton.onmouseout = () => okButton.style.backgroundColor = '#28a745';

closeButton.textContent = 'Close';
closeButton.style.padding = '5px 10px';
closeButton.style.backgroundColor = 'red';
closeButton.style.color = 'white';
closeButton.style.border = 'none';
closeButton.style.borderRadius = '4px';
closeButton.style.cursor = 'pointer';
closeButton.style.display = 'inline-block';
closeButton.style.width = 'auto';
closeButton.style.margin = '5px';
closeButton.style.fontSize = '16px';

closeButton.onmouseover = () => closeButton.style.backgroundColor = '#cc0000';
closeButton.onmouseout = () => closeButton.style.backgroundColor = 'red';

    okButton.onclick = () => {
        document.body.removeChild(modal);
        callback(input.value);
    };

    
    closeButton.onclick = () => {
      document.body.removeChild(modal);
      callback(null); 
  };

  let div = document.createElement('div');
  div.style.display = 'flex';
  div.style.flexDirection = 'row';
  div.appendChild(okButton);
  div.appendChild(closeButton);
  
  
    modal.appendChild(input);  
    modal.appendChild(div);
    document.body.appendChild(modal);
    input.focus();
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'showPrompt') {
        showPrompt('Enter notebook name:', (input) => {
            sendResponse({ notebookName: input });
        });
        return true;  
    }
});


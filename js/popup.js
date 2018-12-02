let copy = document.getElementById('copy');
let input = document.getElementById('input');

function sendMessageToContentScript(message, callback) {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, message, response => {
            if (callback) {
                callback(response)
            };
        });
    });
}

copy.addEventListener('click', () => {
    sendMessageToContentScript({
        key: 'copy',
    }, response => {
        console.log('来自content的回复：' + response);
        if (response) {
            input.value = response;
            input.focus();
            input.setSelectionRange(0, response.length);
            document.execCommand('copy');
            alert('复制成功')
        }
    });
})

// window.close();
function guidGenerator() {
    let S4 = function () {
        return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
    };
    return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

function _arrayBufferToBase64(buffer) {
    let binary = '';
    let bytes = new Uint8Array(buffer);
    let len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function _base64ToArrayBuffer(base64) {
    let binary_string = window.atob(base64);
    let len = binary_string.length;
    let bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    minutes = (minutes >= 10) ? minutes : "0" + minutes;
    seconds = Math.floor(seconds % 60);
    seconds = (seconds >= 10) ? seconds : "0" + seconds;
    return minutes + ":" + seconds;
}

window.myApp = {
    setTray: () => {
        if (NL_MODE != "window") {
            console.log("INFO: Tray menu is only available in the window mode.");
            return;
        }
        let tray = {
            icon: "/resources/icons/logo.png",
            menuItems: [
                {id: "QUIT", text: "Quit"}
            ]
        };
        Neutralino.os.setTray(tray);
    }
};

Neutralino.events = {
    onTrayMenuItemClicked: (menuItem) => {
        switch (menuItem.id) {
            case "QUIT":
                Neutralino.app.exit();
                break;
        }
    }
};

document.onkeydown = function (e) {
    return !(e.ctrlKey &&
        (e.keyCode === 65 ||
            e.keyCode === 67 ||
            e.keyCode === 80 ||
            e.keyCode === 86 ||
            e.keyCode === 85 ||
            e.keyCode === 87 ||
            e.keyCode === 70 ||
            e.keyCode === 117));
};

document.addEventListener('contextmenu', event => event.preventDefault());

const EventBus = new Vue()
Neutralino.init();
// window.myApp.setTray();



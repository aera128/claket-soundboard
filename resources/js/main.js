window.myApp = {
    setTray: () => {
        if(NL_MODE != "window") {
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
        switch(menuItem.id) {
            case "QUIT":
                Neutralino.app.exit();
                break;
        }
    }
};

const EventBus = new Vue()
Neutralino.init();
window.myApp.setTray();



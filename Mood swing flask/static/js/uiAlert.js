class UIWebAlerts{

    // Constructor
    constructor(){
        this.iconPath = "res/";
        this.themes = [];
        this.themes.push("default");

        // Create the default canavas
        if(document.getElementById("ui-webalerts") != null){
            console.error("UI-WebAlerts: Canvas already exists");
            console.info("It is better if you remove the ui-webalerts element from the code, as the script creates this element automatically.");
            return;
        }
    
        var canvas = document.createElement("div");
        canvas.id = "ui-webalerts";
        canvas.className = "default";
        document.body.appendChild(canvas);
    }

    // Register a theme
    registerTheme(theme){
        this.themes.push(theme);
    }

    // Set the icon path for all alerts
    setIconPath(path){
        this.iconPath = path;
    }

    // Set the theme of the alerts
    setAlertTheme(theme){ 
        if(this.themes.includes(theme)){
            document.getElementById("ui-webalerts").className = theme;
        }else{
            console.error("UI-WebAlerts: Theme not found");
        }
    }

    // Create an alert
    createAlert(type, message, duration = 5000){

        type = type.toLowerCase();
        switch(type){
            case "success":
            case "info":
            case "warning":
            case "error":
                break;
            default:
                console.error("UI-WebAlerts: Invalid alert type");
                return;
        }

        var alert = document.createElement("div");
        alert.className = "alert alert-" + type;
        
       

        var text = document.createElement("p");
        text.innerHTML = message;

        var closeIcon = document.createElement("i");
        
        closeIcon.className = "close ri-close-line";

        closeIcon.onclick = function(){
            alert.remove();
        }

       
        alert.appendChild(text);
        alert.appendChild(closeIcon);

        document.getElementById("ui-webalerts").appendChild(alert);
        setTimeout(function(){
            if(alert != null) alert.remove();
        }, duration);
    }
}

const webalerts = new UIWebAlerts();
// webalerts.setIconPath("./res/");

export {webalerts};
class Messages {
    constructor() {
        this.arr = [];
        this._currIndex = -1;
        this._length = 0;
        this.subscribers = {
            currIndex: [],
            length: []
        };
    }

    getMessage(i) {
        return this.arr[i];
    }

    get currIndex() {
        return this._currIndex;
    }

    set currIndex(value) {
        if (this._currIndex !== value) {
            this._currIndex = value;
            this.notifySubscribers('currIndex', value);
        }
    }

    get length() {
        return this._length;
    }

    set length(value) {
        if (this._length !== value) {
            this._length = value;
            this.notifySubscribers('length', value);
        }
    }

    push(msg) {
        this.arr.push(msg);
        this.length = this.arr.length;
    
        // Auto-scroll logic to handle new message addition
        if (this.currIndex === this.length - 2) {
            this.currIndex++;
        }
    }

    removeAt(i) {
        this.arr.splice(i, 1);
        this.length = this.arr.length;
    }

    subscribe(prop, callback) {
        if (this.subscribers[prop]) {
            this.subscribers[prop].push(callback);
        }
    }

    notifySubscribers(prop, value) {
        if (this.subscribers[prop]) {
            this.subscribers[prop].forEach(callback => callback(value));
        }
    }
}

class PrintoutDisplay {
    constructor(settings) {
        settings = settings || {};
        this.msgs = new Messages();
        this.msgs.subscribe('length', settings.onNewMessage);
        this.msgs.subscribe('currIndex', ix => settings.onMessageChange(ix, this.msgs.getMessage(ix)));
        settings.onMessageChange(-1, '')
        this._timer = setInterval(() => {
            fetch(settings.url || 'http://localhost:40001/latest')
                .then(response => {
                    if (response.status === 200) {
                        return response.text();
                    } else if (response.status === 204) {
                        if (this.msgs.currIndex === -1 || this.msgs.length === 0) {
                            currMessageElem.innerHTML = '-';
                            currMessageContentElem.innerHTML = '==PRINTER READY==';
                        }
                    } else {
                        throw new Error(`Unexpected response status: ${response.status}`);
                    }
                })
                .then(text => {
                    if(text)
                        this.msgs.push(text);
                })
                .catch(error => {
                    // Show "CONNECTION ERROR" only if there are no messages
                    if (this.msgs.currIndex === -1 || this.msgs.length === 0) {
                        currMessageElem.innerHTML = '-';
                        currMessageContentElem.innerHTML = '==CONNECTION ERROR: NO CONNECTION TO SCRIPT==\n  Check that virtual_pos_printer.py script is running.';
                    }
                });
        }, settings.url || 2000);
    }
    stop() {
        if(this._timer) clearInterval(this._timer);
    }
    _changeMessage(n) {
        if(this.msgs.length > 0) {
            var newMsgIndex = this.msgs.currIndex + n;
            if(newMsgIndex >= 0 && newMsgIndex < this.msgs.length)
                this.msgs.currIndex = newMsgIndex;
        } else this.msgs.currIndex = -1;
    }
    nextMessage() {
        this._changeMessage(1);
    }
    prevMessage() {
        this._changeMessage(-1);
    }
    trashMessage() {
        const deletedIndex = this.msgs.currIndex;
        this.msgs.removeAt(deletedIndex);
    
        if (this.msgs.length > 0) {
            if (deletedIndex === 0) {
                this.msgs.currIndex = 0;
            } else {
                this.msgs.currIndex = Math.min(deletedIndex - 1, this.msgs.length - 1);
            }
        } else {
            this.msgs.currIndex = -1;
        }

        // Needed or removal from start doesn't show correct message
        this.msgs.notifySubscribers('currIndex', this.msgs.currIndex);
    }
}

const messageCountElem = document.querySelector("#messageCount");
const currMessageElem = document.querySelector("#currMessage");
const currMessageContentElem = document.querySelector("#printout-content-text");
const prevButtonElem = document.querySelector("#leftArrow");
const nextButtonElem = document.querySelector("#rightArrow");
const trashButtonElem = document.querySelector("#btnClear");
const smallerButtonElem = document.querySelector("#btnSmaller");
const largerButtonElem = document.querySelector("#btnLarger");
var printout = new PrintoutDisplay({
    onNewMessage: function(count) {
        messageCountElem.innerHTML = count;
    },
    onMessageChange: function(ix, msg) {
        if(ix < 0) {
            currMessageElem.innerHTML = '-';
            currMessageContentElem.innerHTML = '==PRINTER READY==';
        } else {
            currMessageElem.innerHTML = ix + 1;
            currMessageContentElem.innerHTML = msg;
        }
    }
});
prevButtonElem.addEventListener('click', printout.prevMessage.bind(printout));
nextButtonElem.addEventListener('click', printout.nextMessage.bind(printout));
trashButtonElem.addEventListener('click', printout.trashMessage.bind(printout));

let currSize = 16;  // Initial font size in pixels
const minSize = 8;  // Minimum font size
const maxSize = 72; // Maximum font size

const setSizeDirectly = (element, size) => {
    element.style.fontSize = `${size}px`;
};

// Set up the event listeners for resizing buttons
smallerButtonElem.addEventListener('click', () => {
    if (currSize > minSize) {
        currSize -= 2;  // Decrease font size by 2px
        setSizeDirectly(currMessageContentElem, currSize);
    }
});

largerButtonElem.addEventListener('click', () => {
    if (currSize < maxSize) {
        currSize += 2;  // Increase font size by 2px
        setSizeDirectly(currMessageContentElem, currSize);
    }
});

// Initialize the font size
setSizeDirectly(currMessageContentElem, currSize);

class IngamePanelCustomPanel extends TemplateElement {
    constructor() {
        super(...arguments);

        this.panelActive = false;
        this.started = false;
        this.ingameUi = null;
        this.busy = false;
        this.debugEnabled = false;

        if (this.debugEnabled) {
            var self = this;
            setTimeout(() => {
                self.isDebugEnabled();
            }, 1000);
        } else {
            this.initialize();
        }
    }
    isDebugEnabled() {
        var self = this;
        if (typeof g_modDebugMgr != "undefined") {
            g_modDebugMgr.AddConsole(null);
            g_modDebugMgr.AddDebugButton("Identifier", function() {
                console.log('Identifier');
                console.log(self.instrumentIdentifier);
            });
            g_modDebugMgr.AddDebugButton("TemplateID", function() {
                console.log('TemplateID');
                console.log(self.templateID);
            });
            g_modDebugMgr.AddDebugButton("Source", function() {
                console.log('Source');
                console.log(window.document.documentElement.outerHTML);
            });
			g_modDebugMgr.AddDebugButton("close", function() {
				console.log('close');
				if (self.ingameUi) {
					console.log('ingameUi');
					self.ingameUi.closePanel();
				}
			});
            this.initialize();
        } else {
            Include.addScript("/JS/debug.js", function () {
                if (typeof g_modDebugMgr != "undefined") {
                    g_modDebugMgr.AddConsole(null);
                    g_modDebugMgr.AddDebugButton("Identifier", function() {
                        console.log('Identifier');
                        console.log(self.instrumentIdentifier);
                    });
                    g_modDebugMgr.AddDebugButton("TemplateID", function() {
                        console.log('TemplateID');
                        console.log(self.templateID);
                    });
                    g_modDebugMgr.AddDebugButton("Source", function() {
                        console.log('Source');
                        console.log(window.document.documentElement.outerHTML);
                    });
                    g_modDebugMgr.AddDebugButton("close", function() {
                        console.log('close');
                        if (self.ingameUi) {
                            console.log('ingameUi');
                            self.ingameUi.closePanel();
                        }
                    });
                    self.initialize();
                } else {
                    setTimeout(() => {
                        self.isDebugEnabled();
                    }, 2000);
                }
            });
        }
    }
    connectedCallback() {
        super.connectedCallback();

        var self = this;
        this.ingameUi = this.querySelector('ingame-ui');

        this.iframeElement = document.getElementById("CustomPanelIframe");

        this.m_MainDisplay = document.querySelector("#MainDisplay");
        this.m_MainDisplay.classList.add("hidden");

        this.m_Footer = document.querySelector("#Footer");
        this.m_Footer.classList.add("hidden");

        if (this.ingameUi) {
            this.ingameUi.addEventListener("panelActive", (e) => {
                console.log('panelActive');
                self.panelActive = true;
                if (self.iframeElement) {
                    self.iframeElement.src = 'http://localhost:40001';
                }
            });
            this.ingameUi.addEventListener("panelInactive", (e) => {
                console.log('panelInactive');
                self.panelActive = false;
                if (self.iframeElement) {
                    self.iframeElement.src = '';
                }
            });
            this.ingameUi.addEventListener("onResizeElement", () => {
                //self.updateImage();
            });
            this.ingameUi.addEventListener("dblclick", () => {
                if (self.m_Footer) {
                    self.m_Footer.classList.remove("hidden");
                }
			});
        }
    }
    initialize() {
        if (this.started) {
            return;
        }


        

        //var self = this;
        //this.m_MainDisplay = document.querySelector("#MainDisplay");
        //this.m_MainDisplay.classList.add("hidden");

        //this.m_Footer = document.querySelector("#Footer");
        //this.m_Footer.classList.add("hidden");

        //this.iframeElement = document.getElementById("CustomPanelIframe");
        //this.ingameUi = this.querySelector('ingame-ui');

        /*if (this.ingameUi) {
            this.ingameUi.addEventListener("panelActive", (e) => {
                console.log('panelActive');
                self.updateImage();
            });
            this.ingameUi.addEventListener("panelInactive", (e) => {
                console.log('panelInactive');
                self.iframeElement.src = '';
            });
            this.ingameUi.addEventListener("onResizeElement", () => {
                //self.updateImage();
            });
            this.ingameUi.addEventListener("dblclick", () => {
                if (self.m_Footer) {
                    self.m_Footer.classList.remove("hidden");
                }
            });
        }*/
        this.started = true;
    }
    disconnectedCallback() {
        super.disconnectedCallback();
    }
    updateImage() {

    }
}
window.customElements.define("ingamepanel-custom", IngamePanelCustomPanel);
checkAutoload();
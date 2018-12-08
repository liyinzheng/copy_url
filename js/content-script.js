let myUrl;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.key == 'copy') {
        sendResponse(myUrl)
    }
});

function getLANIP(callback) {
    let RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
    if (RTCPeerConnection) {
        let rtc = new RTCPeerConnection({
            iceServers: [],
        });

        rtc.createDataChannel('', {
            reliable: false
        });

        rtc.onicecandidate = function (evt) {
            if (evt.candidate) {
                grepSDP("a=" + evt.candidate.candidate);
            }
        };

        rtc.createOffer(offerDesc => {
            grepSDP(offerDesc.sdp);
            rtc.setLocalDescription(offerDesc);
        }, e => {
            console.warn("offer failed", e);
        });

        let addrs = Object.create(null);
        addrs["0.0.0.0"] = false;

        function updateDisplay(newAddr) {
            if (newAddr in addrs) {
                return;
            } else {
                addrs[newAddr] = true;
            }
            let displayAddrs = Object.keys(addrs).filter(k => addrs[k]);
            for (let i = 0; i < displayAddrs.length; i++) {
                if (displayAddrs[i].length > 16) {
                    displayAddrs.splice(i, 1);
                    i--;
                }
            }
            if (callback) {
                callback(displayAddrs[0]);
            }
        }

        function grepSDP(sdp) {
            sdp.split('\r\n').forEach(line => {
                if (~line.indexOf("a=candidate")) {
                    let parts = line.split(' '),
                        addr = parts[4],
                        type = parts[7];
                    if (type === 'host') {
                        updateDisplay(addr);
                    }
                } else if (~line.indexOf("c=")) {
                    let parts = line.split(' '),
                        addr = parts[2];
                    updateDisplay(addr);
                }
            });
        }
    }
}

// function getLANIP(callback) {
//     var RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
//     if (RTCPeerConnection)(function () {
//         var rtc = new RTCPeerConnection({
//             iceServers: []
//         });
//         if (1 || window.mozRTCPeerConnection) {
//             rtc.createDataChannel('', {
//                 reliable: false
//             });
//         };

//         rtc.onicecandidate = function (evt) {
//             if (evt.candidate) grepSDP("a=" + evt.candidate.candidate);
//         };
//         rtc.createOffer(function (offerDesc) {
//             grepSDP(offerDesc.sdp);
//             rtc.setLocalDescription(offerDesc);
//         }, function (e) {
//             console.warn("offer failed", e);
//         });


//         var addrs = Object.create(null);
//         addrs["0.0.0.0"] = false;

//         function updateDisplay(newAddr) {
//             if (newAddr in addrs) return;
//             else addrs[newAddr] = true;
//             var displayAddrs = Object.keys(addrs).filter(function (k) {
//                 return addrs[k];
//             });
//             for (var i = 0; i < displayAddrs.length; i++) {
//                 if (displayAddrs[i].length > 16) {
//                     displayAddrs.splice(i, 1);
//                     i--;
//                 }
//             }
//             // console.log(displayAddrs[0]); //打印出内网ip
//             if (callback) {
//                 callback(displayAddrs[0]);
//             }
//         }

//         function grepSDP(sdp) {
//             var hosts = [];
//             sdp.split('\r\n').forEach(function (line, index, arr) {
//                 if (~line.indexOf("a=candidate")) {
//                     var parts = line.split(' '),
//                         addr = parts[4],
//                         type = parts[7];
//                     if (type === 'host') updateDisplay(addr);
//                 } else if (~line.indexOf("c=")) {
//                     var parts = line.split(' '),
//                         addr = parts[2];
//                     updateDisplay(addr);
//                 }
//             });
//         }
//     })();

// }

function getMyUrl() {
    let i, targetIp,
        href = window.location.href,
        targetIpBox = ['127.0.0.1', 'localhost'];
    for (i = 0; i < targetIpBox.length; i++) {
        targetIp = targetIpBox[i];
        if (href.indexOf(targetIp) > -1) {
            getLANIP((localIp) => {
                myUrl = href.replace(targetIp, localIp);
            })
            break;
        }
    }
}

getMyUrl();
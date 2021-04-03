import { WebRawHID } from "./webRawHID";
import { WebUsbComInterface } from "./webUsbComInterface";

let com: WebUsbComInterface;

const consoleLength = 1000000;

document.getElementById(
  "revision"
).innerText = `Revision:${process.env.REVISION}`;

if (!(navigator as any).serial) {
  alert("Please use chrome or edge");
}

let connectButton = document.getElementById("connect");
let updateTimerId: NodeJS.Timeout;
connectButton.onclick = async () => {
  if (com?.connected) {
    connectButton.innerText = "Connect";
    clearInterval(updateTimerId);
    await com.close();
  } else {
    try {
      com = new WebRawHID();
      await com.open(null, {});
      com.setReceiveCallback(dataReceiveHandler);
      connectButton.innerText = "Disconnect";
      updateTimerId = setInterval(updateConsole, 50);
    } catch (e) {
      console.error(e);
    }
  }
};

const hidConsole = document.getElementById("console");
let recvLine = "";

document.getElementById("clear").onclick = () => {
  hidConsole.innerHTML = "";
};

document.getElementById("save").onclick = () => {
  let download = <HTMLAnchorElement>document.getElementById("download-file");

  const date = new Date(Date.now());
  let padd2 = (str: number) => ("00" + str.toString()).slice(-2);
  download.download = `${date.getFullYear()}${padd2(
    date.getMonth() + 1
  )}${padd2(date.getDate())}${padd2(date.getHours())}${padd2(
    date.getMinutes()
  )}${padd2(date.getSeconds())}.txt`;

  download.href = URL.createObjectURL(
    new Blob([hidConsole.innerHTML], { type: "text/plain" })
  );
  download.click();
};

function updateConsole() {
  hidConsole.insertAdjacentText("beforeend", recvLine);
  recvLine = "";

  if ((document.getElementById("autoscroll") as HTMLInputElement).checked) {
    hidConsole.scrollTop = hidConsole.scrollHeight;
  }

  if (hidConsole.innerHTML.length > consoleLength) {
    hidConsole.innerHTML = hidConsole.innerHTML.slice(
      hidConsole.innerHTML.length - consoleLength
    );
  }
}

function dataReceiveHandler(msg: Uint8Array) {
  recvLine += new TextDecoder().decode(msg);
}

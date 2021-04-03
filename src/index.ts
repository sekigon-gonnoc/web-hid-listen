import { WebRawHID } from "./webRawHID";
import { WebUsbComInterface } from "./webUsbComInterface";

let com: WebUsbComInterface;

const consoleLength = 10000000;

document.getElementById(
  "revision"
).innerText = `Revision:${process.env.REVISION}`;

if (!(navigator as any).serial) {
  alert("Please use chrome or edge");
}

let connectButton = document.getElementById("connect");
connectButton.innerText = "Connect";
connectButton.onclick = async () => {
  if (com?.connected) {
    connectButton.innerText = "Connect";
    await com.close();
  } else {
    try {
      com = new WebRawHID();
      await com.open(null, {});
      com.setReceiveCallback(dataReceiveHandler);
      connectButton.innerText = "Disconnect";
    } catch (e) {
      console.error(e);
    }
  }
};

const console = document.getElementById("console");

document.getElementById("clear").onclick = () => {
  console.innerHTML = "";
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
    new Blob([console.innerHTML], { type: "text/plain" })
  );
  download.click();
};

function dataReceiveHandler(msg: Uint8Array) {
  const recvLine = new TextDecoder().decode(msg);

  console.innerHTML = console.innerHTML + recvLine;

  if ((document.getElementById("autoscroll") as HTMLInputElement).checked) {
    console.scrollTop = console.scrollHeight;
  }

  if (console.innerHTML.length > consoleLength) {
    console.innerHTML = console.innerHTML.slice(
      console.innerHTML.length - consoleLength
    );
  }
}

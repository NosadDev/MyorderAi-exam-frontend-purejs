const SHORTURL_LINK = 'shu-api.nosad.dev';
const API_ENDPOINT = '/api/v1/shorten';
const inputURLElement = document.getElementById('url');
const resultElement = document.getElementById('result');
const errorElement = document.getElementById('error');
const QRElement = document.getElementById("qrcode");
const QRWrapperElement = document.getElementById("qrcode-wrapper");
const qrcode = new QRCode(QRElement, {
    width: 256,
    height: 256,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.H
});

let ERROR_SHOWING = false;

document.addEventListener('DOMContentLoaded', () => {
    const elementList = document.querySelectorAll('[rsc]')
    elementList.forEach(element => {
        element.classList.add('rounded-md');
        element.classList.add('mx-1');
        element.classList.add('p-2');
    })
    const buttonIconList = document.querySelectorAll('[bic]')
    buttonIconList.forEach(element => {
        element.classList.add('flex')
        element.classList.add('items-center')
    });
    qrcode.makeCode('google.com');
});

async function shortenURL() {
    const response = await fetch(API_ENDPOINT,
        {
            method: 'POST',
            body: JSON.stringify({
                url: inputURLElement.value
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid Response')
            }
            return response.json();
        })
        .catch((error) => {
            displayError(true)
            throw error;
        });
    if (ERROR_SHOWING) {
        displayError(false)
    }
    QRElement.classList.add('hidden');
    QRWrapperElement.classList.add('hidden');
    displayResult(response);
}

function displayError(display) {
    if (display) {
        errorElement.classList.remove('hidden');
        resultElement.classList.add('hidden');
        ERROR_SHOWING = true;
    } else {
        errorElement.classList.add('hidden');
        resultElement.classList.remove('hidden');
        ERROR_SHOWING = false;
    }
}

function displayResult(data) {
    if (resultElement.classList.contains('hidden')) {
        resultElement.classList.remove('hidden');
    }
    resultElement.querySelector('#original-url').value = inputURLElement.value;
    resultElement.querySelector('#shorten-url').value = `${SHORTURL_LINK}/${data.hash}`;
}

function copyURL(elementId) {
    const URLElement = document.getElementById(elementId);
    if (!navigator.clipboard) {
        fallbackSetClipboard(URLElement.value);
        return;
    }
    setClipboard(URLElement.value);
}

function openURL(elementId) {
    const URLElement = document.getElementById(elementId);
    const a = document.createElement("a");
    if (/^(http|https):\/\//.test(URLElement.value)) {
        a.href = URLElement.value;
    } else {
        a.href = `//${URLElement.value}`;
    }
    a.target = '_blank'
    a.click();
}

function setClipboard(text) {
    navigator.clipboard.writeText(text);
}

function renderQR() {
    const url = resultElement.querySelector('#shorten-url').value;
    qrcode.makeCode(url);
    QRElement.classList.remove('hidden');
    QRWrapperElement.classList.remove('hidden');
    const imageQR = document.querySelector('#qrcode > img');
    const downloadQR = document.querySelector('#download-qrcode');
    downloadQR.download = `qr-${new Date().getTime()}`;
    downloadQR.href = imageQR.getAttribute('src');
}

function fallbackSetClipboard(text) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
}

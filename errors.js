const numberMessageMap = {};
setMessage(1, "Popup Blocked, Please Allow Popups");
setMessage(2, "Invalid Date Or Time Please Make Sure Your Input And Format Are Correct");
setMessage(3, "Session Uses Amount Has Exceeded The Threshold For The Day, Please Check Back Tomorrow");
setMessage(4, "No Error Message Here");
setMessage(5, "No Error Message Here");
setMessage(6, "No Error Message Here");
setMessage(7, "Discord Webhook Error");
setMessage(8, "Message Cannot Be Empty");
setMessage(9, "Failed To Load Album Art Image, Using Fallback");
setMessage(10, "Failed To Fetch Messages");
setMessage(11, "Failed To Send Message");
setMessage(12, "Failed To Load Messages");
setMessage(13, "Failed To Fetch Prescence Count");
setMessage(14, "Failed To Copy To Clipboard");
setMessage(15, "Website Does Not Exist");
function setMessage(num, message) {
    numberMessageMap[num] = message;
}
function checkNumber() {
    const num = document.getElementById('inputNumber').value;
    const response = numberMessageMap[num];
    const output = document.getElementById('responseText');
    output.textContent = response || "No Error Message Here";
    setTimeout(() => {
        output.textContent = '';
    }, 5000);
}
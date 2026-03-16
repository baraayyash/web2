const axios = require('axios');

async function sendRequest() {
    const res = await axios.get("https://httpbin.org/json");
    console.log("data in sendRequest:", res.data);
    return res.data;
}

module.exports = {
    sendRequest: sendRequest
}

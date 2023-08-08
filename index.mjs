import express from 'express';
import axios from 'axios';

const app = express();
app.use(express.json());
const port = 3000;

app.listen(port, () => {
    console.log(`API listening on port ${port}`);
});



const aria2cRpcSecret = '123456';
const aria2cUrl = 'http://localhost:8210/jsonrpc';

app.post('/download', (req, res) => {
    const { url } = req.body;

    console.log("This file to be download:" + url)

    if (!url) {
        return res.status(400).json({ error: 'URL not provided' });
    }

    // JSON-RPC method and parameters for aria2.addUri
    const addUriMethod = 'aria2.addUri';
    const addUriParams = [`token:${aria2cRpcSecret}`, [url], {dir: '/root/dev/download' }];

    // JSON-RPC request
    const addUriData = {
        jsonrpc: '2.0',
        id: '1',
        method: addUriMethod,
        params: addUriParams,
    };

    // Send JSON-RPC request to aria2c
    axios.post(aria2cUrl, addUriData)
        .then(addUriResponse => {
            // Parse JSON-RPC response
            const addUriResponseData = addUriResponse.data;
            const gid = addUriResponseData.result;

            // JSON-RPC method and parameters for aria2.tellStatus
            const tellStatusMethod = 'aria2.tellStatus';
            const tellStatusParams = [`token:${aria2cRpcSecret}`, gid];

            // JSON-RPC request for aria2.tellStatus
            const tellStatusData = {
                jsonrpc: '2.0',
                id: '2',
                method: tellStatusMethod,
                params: tellStatusParams,
            };

            // Send JSON-RPC request to aria2c for aria2.tellStatus
            return axios.post(aria2cUrl, tellStatusData);
        })
        .then(tellStatusResponse => {
            // Parse JSON-RPC response for aria2.tellStatus
            const tellStatusResponseData = tellStatusResponse.data;
            res.json(tellStatusResponseData);
        })
        .catch(error => {
            console.error('Error sending JSON-RPC request:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});
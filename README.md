# Test Cancelling Uploads

Simple Node app to demonstrate:
* Uploading larger files that are terminated server-side, requiring the Response header `Connection` to be set to `close`; otherwise, fetch/xhr requests will hang.
* Doing the above causes XHR and the Fetch API to return network reset errors in Firefox (NS_ERROR_NET_RESET) and Chrome (ERR_CONNECTION_ABORTED).
* The API tool Postman does not have this problem. It successfully retrieves the status code and message from the API.

This can be seen discussed [here](https://stackoverflow.com/questions/18367824/how-to-cancel-http-upload-from-data-events/18370751#18370751).

This app runs locally on your machine. It does not connect to the internet or upload any files anywhere.

## Contents

1. [Desired Outcome](#Desired-Outcome)
2. [Setup](#Setup)
3. [Postman](#Postman)

## Desired Outcome

Browsers to search for an HTTP response from an API, if given, either when the connection header is set to close or while the Request stream is stalled during upload (which may have been terminated).

## Setup

1. You need `git` and `node v18 or v20` installed on your system.
2. Clone this repository using the `git clone <url>` command.
3. Enter this project's folder and run the following commands:

```bash
npm install --include=dev
npm run build
npm start
```

4. Open your browser and navigate to [http://localhost:3000/](http://localhost:3000/)
5. Read the notes and start uploading (Note: nothing is actually uploaded).

## Postman

I recommend using [Postman](https://www.postman.com/) to see how the responses work properly for comparison.
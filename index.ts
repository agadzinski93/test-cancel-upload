import express from 'express';
import busboy from 'busboy';

import { Request, Response, NextFunction } from 'express';
import internal from 'stream';

const PORT = 3000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

class AppError extends Error {
    status;

    constructor(status: number, message: string) {
        super(message);
        this.status = status;
    }
}

//Cors middleware
const cors = (req: Request, res: Response, next: NextFunction) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
}

//Upload Middleware
const upload = (req: Request, res: Response, next: NextFunction) => {
    const bb = busboy({ headers: req.headers });
    let cancelUpload = false;

    bb.on('file', (name: string, file: internal.Readable, info: busboy.FileInfo) => {
        const { filename, encoding, mimeType } = info;

        /*
            Must set both these variables so we can distinguish that we manually destroyed the stream
            since busboy does that automatically on it's own when a file stream completes
        */
        file.destroy();
        cancelUpload = true;

        /*
            Keep track of how much the file stream is uploaded.
            This will only work if you comment out the above two lines of code.
        */
        const CONTENT_LENGTH = req.get('Content-Length');
        const TOTAL_SIZE = (CONTENT_LENGTH) ? parseInt(CONTENT_LENGTH) : 0;
        let completed = 0;

        file.on('data', (data: Buffer) => {
            completed += data.length;
            console.log(`Completed: ${Math.floor(completed / TOTAL_SIZE * 100)}% (${completed} bytes)`);
        });

        /*
            Executes when you reach end of file.
            Will not be called unless you comment out file.destroy() and cancelUpload = true.
        */
        file.on('end', () => {
            console.log('End of File');
        });
        file.on('error', (err: Error) => {
            console.log('Error with File');
        });
        /*
            Will be called when you either reach the end of the file OR call file.destroy()
            Ideally, you should see this ALWAYS execute.
        */
        file.on('close', () => {
            console.log('Closing File');
            //Check if we manually destroyed the stream
            if (cancelUpload) {
                bb.removeAllListeners();
                req.unpipe(bb);
                next(new AppError(400, 'Stream destroyed'));
            }
        });
    });
    bb.on('field', (name, val, info) => {
        console.log('FIELD');
        console.log(`${name}: ${val}`);
    });
    bb.on('close', () => {
        console.log('Closing busboy');
        next();
    });
    bb.on('error', (err: Error) => {
        console.log('Busboy Error');
        next(err);
    })
    req.pipe(bb);
}

app.get('/', (req: Request, res: Response, next: NextFunction) => {
    res.render('home');
});

app.post('/', cors, upload, (req: Request, res: Response, next: NextFunction) => {
    console.log('POST ROUTE');
    res.status(201).json({ status: 201, message: 'Success' });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log('Error Route');
    let status = 500;
    if (err instanceof AppError) status = err.status;
    if (err.message === 'Stream destroyed') res.header('Connection', 'close');
    res.status(status).json({ status, message: err.message });
});

app.listen(PORT, () => { console.log(`Listening on port ${PORT}`); });
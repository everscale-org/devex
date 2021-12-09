import express, { Request, Response } from 'express';
import path from 'path';
import bodyParser from 'body-parser';
import cors from 'cors';
import fileUpload from 'express-fileupload';
import { globals } from './config/globals';

import {indexRouter} from './routes/index';
import {sampleRouter} from './routes/sample';
import {addParamsRouter} from './routes/add-params-to-nft-root';
import {rootContractForm} from './routes/root-contract-form';
import {saveJsonRouter} from './routes/save-json';
import {tokensDataInfo} from './routes/tokens-data-info';
import {generateContractRouter} from './routes/generate-contract';
import { oneTokenInfoRouter } from './routes/one-token-info';
import { parameterForm } from './routes/parameter-form'
import { collectionListRouter } from './routes/collection-list'
import { mintRouter } from './routes/mint';
import { mintAnyRouter } from './routes/mint-any-warrior';
import { deployFromFile } from './routes/deploy-from-file';
import { imageGen } from './routes/gen-warrior';

const app = express();

// view engine setup
app.set('views', path.join(globals.APP_ROOT, 'views'));
app.set('view engine', 'pug');


app.use(cors());
app.use(fileUpload({
    createParentPath: true,
}));
app.use(globals.BASE_PATH, express.static(globals.PUBLIC_ROOT));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/', indexRouter);
app.use('/my-sample', sampleRouter);
app.use('/add-params', addParamsRouter);
app.use('/root-contract-form', rootContractForm);
app.use('/save-json', saveJsonRouter);
app.use('/one-token-info', oneTokenInfoRouter);
app.use('/tokens-data-info', tokensDataInfo);
app.use('/generate-contract', generateContractRouter);
app.use('/parameter-form', parameterForm);
app.use('/collection-list', collectionListRouter);
app.use('/mint', mintRouter);
app.use('/mint-any', mintAnyRouter);
app.use('/deploy-from-file', deployFromFile)
app.use('/gen-img', imageGen);

app.use((req: Request, res: Response) => {
    res.status(404);
    res.json({ error: 'Not found'});
});

app.listen(globals.APP_PORT, () => {
    console.log(`Running on PORT ${ globals.APP_PORT }.`);
});

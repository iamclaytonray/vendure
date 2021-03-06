import path from 'path';

import { API_PATH, API_PORT } from '../shared/shared-constants';

import { examplePaymentHandler } from './src/config/payment-method/example-payment-method-config';
import { OrderProcessOptions, VendureConfig } from './src/config/vendure-config';
import { defaultEmailTypes } from './src/email/default-email-types';
import { HandlebarsMjmlGenerator } from './src/email/handlebars-mjml-generator';
import { DefaultAssetServerPlugin } from './src/plugin';
import { DefaultSearchPlugin } from './src/plugin/default-search-plugin/default-search-plugin';

/**
 * Config settings used during development
 */
export const devConfig: VendureConfig = {
    defaultChannelToken: 'default-channel',
    authOptions: {
        disableAuth: false,
        sessionSecret: 'some-secret',
    },
    port: API_PORT,
    apiPath: API_PATH,
    dbConnectionOptions: {
        type: 'mysql',
        synchronize: true,
        logging: true,
        host: '192.168.99.100',
        port: 3306,
        username: 'root',
        password: '',
        database: 'vendure-dev',
    },
    orderProcessOptions: {} as OrderProcessOptions<any>,
    paymentOptions: {
        paymentMethodHandlers: [examplePaymentHandler],
    },
    customFields: {
        GlobalSettings: [{ name: 'royalMailId', type: 'string' }],
    },
    emailOptions: {
        emailTemplatePath: path.join(__dirname, 'src/email/templates'),
        emailTypes: defaultEmailTypes,
        generator: new HandlebarsMjmlGenerator(),
        transport: {
            type: 'file',
            raw: false,
            outputPath: path.join(__dirname, 'test-emails'),
        },
    },
    importExportOptions: {
        importAssetsDir: path.join(__dirname, 'import-assets'),
    },
    plugins: [
        new DefaultAssetServerPlugin({
            route: 'assets',
            assetUploadDir: path.join(__dirname, 'assets'),
            port: 4000,
        }),
        new DefaultSearchPlugin(),
    ],
};

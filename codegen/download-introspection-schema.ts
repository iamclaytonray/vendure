import fs from 'fs';
import { introspectionQuery } from 'graphql';
import http from 'http';
import path from 'path';

import { API_PATH, API_PORT } from '../shared/shared-constants';

// tslint:disable:no-console

/**
 * Makes an introspection query to the Vendure server and writes the result to a
 * schema.json file.
 *
 * If there is an error connecting to the server, the promise resolves to false.
 */
export function downloadIntrospectionSchema(outputFilePath: string): Promise<boolean> {
    const body = JSON.stringify({ query: introspectionQuery });

    return new Promise((resolve, reject) => {
        const request = http.request(
            {
                method: 'post',
                host: 'localhost',
                port: API_PORT,
                path: '/' + API_PATH,
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body),
                },
            },
            response => {
                const outputFile = fs.createWriteStream(outputFilePath);
                response.pipe(outputFile);
                response.on('end', () => resolve(true));
                response.on('error', reject);
            },
        );
        request.write(body);
        request.end();
        request.on('error', (err: any) => {
            if (err.code === 'ECONNREFUSED') {
                console.error(
                    `ERROR: Could not connect to the Vendure server at http://localhost:${API_PORT}/${API_PATH}`,
                );
                resolve(false);
            }
            reject(err);
        });
    });
}

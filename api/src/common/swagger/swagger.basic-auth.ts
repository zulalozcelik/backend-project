import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import basicAuth from '@fastify/basic-auth';
import type { FastifyInstance } from 'fastify';

export async function protectSwaggerWithBasicAuth(opts: {
    app: NestFastifyApplication;
    username: string;
    password: string;
    docsPath: string;
}) {
    const { app, username, password, docsPath } = opts;

    const fastify = app.getHttpAdapter().getInstance() as FastifyInstance & {
        basicAuth: (req: unknown, reply: unknown, done: (err?: Error) => void) => void;
    };

    await fastify.register(basicAuth, {
        validate(user: string, pass: string, _req: unknown, _reply: unknown, done: (err?: Error) => void) {
            if (user === username && pass === password) return done();
            return done(new Error('Unauthorized'));
        },
        authenticate: true,
    });

    fastify.addHook('onRequest', (req, reply, done) => {
        const url = (req as { url: string }).url ?? '';
        if (!url.startsWith(docsPath)) return done();
        fastify.basicAuth(req, reply, done);
    });
}

import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
    @Get()
    getHello() {
        return {
            message: 'Welcome to IndieLeads Enterprise API',
            version: '1.0.0',
            status: 'Online',
            docs: '/api/v1/health'
        };
    }
}

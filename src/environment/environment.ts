export const environment = {
    production: false,
    apis: {
        alertas: {
            baseUrl: 'http://localhost:8081/api',
            endpoints: {
                perfilAzure: 'http://localhost:8081/api/auth/perfil',
            }
        }
    },
    msalConfig: {
        auth: {
            clientId: 'f43a15d0-f8b8-42c0-b0cb-4aba49f94958',
            authority: 'https://login.microsoftonline.com/common',
            redirectUri: 'http://localhost:4200/login',
            postLogoutRedirectUri: 'http://localhost:4200/login',
        }
    },
    apiConfig: {
        scopes: ['User.Read'],
        uri: 'https://graph.microsoft.com/v1.0/me',
    }
};
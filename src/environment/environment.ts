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
            clientId: '817eaf26-9869-4d26-8e71-d2713298ddd7',
            authority: 'https://DCNGP6.b2clogin.com/DCNGP6.onmicrosoft.com/B2C_1_DCNGP6_LOGIN/v2.0',
            knownAuthorities: ['DCNGP6.b2clogin.com'],
            redirectUri: 'http://localhost:4200/login',
            postLogoutRedirectUri: 'http://localhost:4200/login',
            navigateToLoginRequestUrl: true
        }
    },
    apiConfig: {
        scopes: ['https://DCNGP6.onmicrosoft.com/817eaf26-9869-4d26-8e71-d2713298ddd7/access_as_user'],
        uri: 'http://localhost:8081/api/auth/perfil'
    }
};
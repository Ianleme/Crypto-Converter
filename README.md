# Welcome to your project

This project was bootstrapped using `create-vite`.

## Available Scripts

In the project directory, you can run:

### `npm run dev` or `yarn dev`

Runs the app in the development mode.
Open [http://localhost:8080](http://localhost:8080) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

### `npm run build` or `yarn build`

Builds the app for production to the `dist` folder.
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.
Your app is ready to be deployed!

See the section about [deployment](https://vitejs.dev/guide/static-deploy.html) for more information.

## Learn More

You can learn more in the [Vite documentation](https://vitejs.dev/guide/).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)

## Publishing your project

### How do I publish my project?

You can publish your project by running `npm run build` and deploying the `dist` folder to your hosting provider.

### Can I connect a custom domain to my project?

Yes, most hosting providers allow you to connect a custom domain. Please refer to your hosting provider's documentation for instructions.

## API e Configuração

### Configuração da API do CoinGecko

Este projeto utiliza a API do CoinGecko para buscar dados de criptomoedas.

- Em ambiente de desenvolvimento, os requests são feitos através de um servidor proxy local (server/index.js) para combinar dados em USD e BRL.
- Em ambiente de produção, os requests são feitos diretamente para a API do CoinGecko.

### Variáveis de Ambiente

Para configurar o projeto, crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```
# API do CoinGecko (necessário para produção)
VITE_COINGECKO_API_KEY=sua_chave_api_aqui

# Variáveis do servidor (apenas para desenvolvimento)
COINGECKO_API_URL=https://api.coingecko.com/api/v3
COINGECKO_API_KEY=sua_chave_api_aqui
CACHE_TTL=600
PORT=3001
```

Observações:

- Para desenvolvimento, execute `npm run dev:all` para iniciar tanto o frontend quanto o servidor proxy.
- Para produção, apenas a variável `VITE_COINGECKO_API_KEY` é necessária.
- Se você não tiver uma chave API do CoinGecko, as requisições ainda funcionarão, mas estarão sujeitas a limites de taxa mais restritos.

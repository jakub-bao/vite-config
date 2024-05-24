import {loadEnv, UserConfig, ServerOptions, defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
// import ReportPlugin from "./reportPlugin.js";

type Env = {
    VITE_DHIS_AUTH: string;
    VITE_DHIS_URL: string;
}

const env:Env = loadEnv('development', process.cwd()+'/..') as Env
const isDevMode = process.env.NODE_ENV==='development'
const envExists = env&&env.VITE_DHIS_AUTH&&env.VITE_DHIS_URL
if (isDevMode&&!envExists) throw new Error(`Please specify VITE_DHIS_AUTH and VITE_DHIS_URL in .env.local placed in root directory of the project`)

function getProxyConfig(){
    return {
        target: env.VITE_DHIS_URL,
        configure: (proxy, options) => {
            options.headers = {Authorization: `Basic ${env.VITE_DHIS_AUTH}`}
        },
        secure: false,
        changeOrigin: true
    }
}


function getServerOptions():ServerOptions{
    const proxyConfig = getProxyConfig()
    return {
        port: 3000,
        proxy: {
            '/api':proxyConfig,
            '/pdapsession':proxyConfig,
            '/dhis-web-commons': proxyConfig
        }
    }
}

function assembleConfig():UserConfig{
    const server:ServerOptions = getServerOptions()
    return {
        plugins: [react()/*, ReportPlugin()*/],
        server,
        preview: server,
        optimizeDeps: {
            exclude: ['@erb-processor/pdap-service']
        }
    }
}

export const genericViteConfig = defineConfig(({command, mode})=>{
    if (isDevMode) return assembleConfig()
    else return {plugins: [react()]}
})

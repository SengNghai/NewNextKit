
interface IConfig {
    dbCredentials: {
        connectionString: string;
    };
}


export default function defineConfig(config: IConfig) {
    console.log(config);
}
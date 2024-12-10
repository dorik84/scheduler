import { defineConfig } from "drizzle-kit";

export default defineConfig({
    schema: './src/drizzle/schema.ts',
    dialect: 'postgresql', 
    out: './src/drizzle/migrations',
    strict: true,
    verbose: true,
    dbCredentials:{
        url: process.env.DATABASE_URL as string
    }
})

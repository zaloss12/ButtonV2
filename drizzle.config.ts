import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: "libsql://button-zaloss11.aws-eu-west-1.turso.io?authToken=eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NTM2OTE2MTgsImlkIjoiNTcxZDVjZmItZmM2Ni00NjllLThkMTEtZDQ0NTJiNDUyOGVhIiwicmlkIjoiYWVmNmM0YTAtMDc5Ni00ZDg3LTliNTMtZWI2NTkyY2MzYjAwIn0.kCoMctJlkJbwGQuZ-mSDmKK5rbYVI3Hy4q7LVgdWZcOKAZyb9f123k8M9Pw_3G-6tLeu5My_ylIm0b1UdjmxBw"
  },
});
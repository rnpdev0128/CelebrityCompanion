import { PrismaClient } from "@/prisma/generated/client";
import { PrismaMariaDb  } from "@prisma/adapter-mariadb";


const adapter = new PrismaMariaDb({
  host: "localhost",
  port: 3306,
  user: "aicompanion_user",
  password: "YourPassword123!",
  database: "aicompanion",
  connectionLimit: 5,
});


export const prismadb = new PrismaClient({ adapter });

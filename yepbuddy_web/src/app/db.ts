import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// ⚠️ 모든 테이블이 들어가도록 스키마를 합쳐준다
import * as proteinSchema from "@/app/protein/schema";
import * as userSchema from "@/app/users/[username]/schema"; // profiles 참조 때문에 포함

const client = postgres(process.env.DATABASE_URL!, { prepare: false });

// ✅ schema 제네릭 주입
export const schema = { ...proteinSchema, ...userSchema };
const db = drizzle(client, { schema });

export default db;
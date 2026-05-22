import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";

/* =========================
CONFIG
========================= */

dotenv.config();

/* =========================
DATABASE
========================= */

connectDB();

/* =========================
APP
========================= */

const app = express();

/* =========================
MIDDLEWARE
========================= */

app.use(express.json());

app.use(
express.urlencoded({
extended:true
})
);

app.use(cors());

app.use(morgan("dev"));

app.use(cookieParser());

app.use(fileUpload({
useTempFiles:true
}));

/* =========================
STATIC UPLOADS
========================= */

app.use(
"/uploads",
express.static("uploads")
);

/* =========================
TEST ROUTE
========================= */

app.get("/", (req,res)=>{

res.status(200).json({

success:true,

message:
"HAMBAK TECH & SERVICES Backend Running Successfully"

});

});

/* =========================
API ROUTES
========================= */

app.use(
"/api/auth",
authRoutes
);

app.use(
  "/api/services",
  serviceRoutes
);

app.use(
  "/api/upload",
  uploadRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

app.use(
  "/api/transactions",
  transactionRoutes
);

/* =========================
404 HANDLER
========================= */

app.use((req,res)=>{

res.status(404).json({

success:false,

message:"Route Not Found"

});

});

/* =========================
SERVER
========================= */

const PORT =
process.env.PORT || 5000;

app.listen(PORT, ()=>{

console.log(
`Server running on port ${PORT}`
);

});
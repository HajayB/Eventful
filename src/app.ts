import express from "express";
import { setupSwagger } from "./swagger";
import routes from "./routes";
import { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser"
const app = express();
setupSwagger(app);

//Raw body ONLY for Paystack webhook
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);
app.use(cors({
  origin:"http://localhost:5173",
  credentials:true,
}))
// Normal JSON for other routes
app.use(express.json());
app.use(cookieParser())

// Mount all routes under /api
app.use("/api", routes);

//for paystack call back 
app.use("/paystack/callback", (req: Request,res: Response)=>{
  return res.status(200).json({
    success: true,
    message: "Payment confirmed. Your tickets are secured and a confirmation email is on its way.",
  });
  
})


app.use("/", (req: Request,res: Response)=>{
  res.status(200).json({message:"Server is running 🥶"})
})

export default app;

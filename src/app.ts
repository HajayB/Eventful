import express from "express";
import routes from "./routes";
import { Request, Response } from "express";
const app = express();

//Raw body ONLY for Paystack webhook
app.use(
  "/api/payments/webhook",
  express.raw({ type: "application/json" })
);
// Normal JSON for other routes
app.use(express.json());

// Mount all routes under /api
app.use("/api", routes);




app.use("/", (req: Request,res: Response)=>{
  res.status(200).json({message:"Server is running 🥶"})
})

export default app;

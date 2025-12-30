import { Hono } from "hono";
import { verifyPurchase,addUserLicense } from "../services/envato.service";

const envato = new Hono();

envato.post("/verify", verifyPurchase);
envato.post("/add-license",addUserLicense);


export default envato;

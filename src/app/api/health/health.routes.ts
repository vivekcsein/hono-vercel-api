import { Hono } from "hono";
import { getHealthStatus } from "./health.service";
import { ok } from "@/packages/utils/response.utils";

const healthRouter = new Hono();

healthRouter.get("/", (c) => ok(c, getHealthStatus()));

export default healthRouter;

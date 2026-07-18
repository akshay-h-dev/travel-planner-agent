/**
 * Health check route.
 *
 * Returns service status and basic metadata.
 * Used by load balancers, container orchestrators, and
 * monitoring dashboards to verify the service is alive.
 */

import { Router } from "express";
import { dataService } from "../services/dataService.js";

const router = Router();

router.get("/health", (_req, res) => {
  res.status(200).json({
    status: "healthy",
    service: "tripway-backend",
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    datasets: dataService.getDatasetStats(),
  });
});

export { router as healthRouter };

import express from "express";

import {
  
  createService,
  getServices,
  getSingleService,
  updateService,
  deleteService
  
} from "../controllers/serviceController.js";

import {
  
  protect,
  adminOnly
  
} from "../middleware/authMiddleware.js";

/* =========================
ROUTER
========================= */

const router = express.Router();

/* =========================
PUBLIC ROUTES
========================= */

/* GET ALL SERVICES */

router.get(
  "/",
  getServices
);

/* GET SINGLE SERVICE */

router.get(
  "/:id",
  getSingleService
);

/* =========================
ADMIN ROUTES
========================= */

/* CREATE SERVICE */

router.post(
  "/create",
  protect,
  adminOnly,
  createService
);

/* UPDATE SERVICE */

router.put(
  "/:id",
  protect,
  adminOnly,
  updateService
);

/* DELETE SERVICE */

router.delete(
  "/:id",
  protect,
  adminOnly,
  deleteService
);

/* =========================
EXPORT
========================= */

export default router;
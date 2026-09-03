import Service from "../models/Service.js";
import { inMemoryServices } from "../config/inMemoryStore.js";

/* =========================
CREATE SERVICE
========================= */

export const createService = async (req, res) => {
  try {
    let service;
    try {
      service = await Service.create({
        ...req.body,
        createdBy: req.user?._id
      });
    } catch {
      service = {
        _id: `srv_${Date.now()}`,
        ...req.body,
        createdBy: req.user?._id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      inMemoryServices.unshift(service);
    }

    res.status(201).json({
      success: true,
      message: "Service created successfully",
      service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
GET ALL SERVICES
========================= */

export const getServices = async (req, res) => {
  try {
    let services = [];
    try {
      services = await Service.find().sort({ createdAt: -1 });
    } catch {
      services = [];
    }

    if (!services || services.length === 0) {
      services = inMemoryServices;
    }

    res.status(200).json({
      success: true,
      count: services.length,
      services
    });
  } catch (error) {
    res.status(200).json({
      success: true,
      count: inMemoryServices.length,
      services: inMemoryServices
    });
  }
};

/* =========================
GET SINGLE SERVICE
========================= */

export const getSingleService = async (req, res) => {
  try {
    let service = null;
    try {
      service = await Service.findById(req.params.id);
    } catch {
      service = null;
    }

    if (!service) {
      service = inMemoryServices.find(
        (s) => s._id === req.params.id || s.slug === req.params.id
      );
    }

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.status(200).json({
      success: true,
      service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
UPDATE SERVICE
========================= */

export const updateService = async (req, res) => {
  try {
    let service;
    try {
      service = await Service.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true
        }
      );
    } catch {
      const idx = inMemoryServices.findIndex((s) => s._id === req.params.id);
      if (idx !== -1) {
        inMemoryServices[idx] = { ...inMemoryServices[idx], ...req.body };
        service = inMemoryServices[idx];
      }
    }

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Service updated successfully",
      service
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/* =========================
DELETE SERVICE
========================= */

export const deleteService = async (req, res) => {
  try {
    let found = false;
    try {
      const service = await Service.findById(req.params.id);
      if (service) {
        await service.deleteOne();
        found = true;
      }
    } catch {
      const idx = inMemoryServices.findIndex((s) => s._id === req.params.id);
      if (idx !== -1) {
        inMemoryServices.splice(idx, 1);
        found = true;
      }
    }

    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Service deleted successfully"
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

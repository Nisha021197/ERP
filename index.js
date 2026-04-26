const express = require('express');

// Controllers
const dashCtrl = require('./dashboardController');
const supCtrl = require('./supplierController');
const matCtrl = require('./materialController');
const poCtrl = require('./purchaseController');
const prodCtrl = require('./productController');
const prodOrderCtrl = require('./productionController');
const qcCtrl = require('./qualityController');
const shipCtrl = require('./shipmentController');

const router = express.Router();

// Dashboard
router.get('/dashboard', dashCtrl.getSummary);

// Suppliers
router.get('/suppliers', supCtrl.getAll);
router.get('/suppliers/:id', supCtrl.getOne);
router.post('/suppliers', supCtrl.create);
router.put('/suppliers/:id', supCtrl.update);
router.delete('/suppliers/:id', supCtrl.remove);

// Raw Materials
router.get('/materials', matCtrl.getAll);
router.get('/materials/:id', matCtrl.getOne);
router.post('/materials', matCtrl.create);
router.put('/materials/:id', matCtrl.update);
router.post('/materials/:id/adjust-stock', matCtrl.adjustStock);
router.delete('/materials/:id', matCtrl.remove);

// Purchase Orders
router.get('/purchase-orders', poCtrl.getAll);
router.get('/purchase-orders/:id', poCtrl.getOne);
router.post('/purchase-orders', poCtrl.create);
router.patch('/purchase-orders/:id/status', poCtrl.updateStatus);
router.delete('/purchase-orders/:id', poCtrl.remove);

// Products (Finished Goods)
router.get('/products', prodCtrl.getAll);
router.get('/products/:id', prodCtrl.getOne);
router.post('/products', prodCtrl.create);
router.put('/products/:id', prodCtrl.update);
router.get('/products/check-feasibility', prodCtrl.checkFeasibility);
router.delete('/products/:id', prodCtrl.remove);

// Production Orders
router.get('/production-orders', prodOrderCtrl.getAll);
router.get('/production-orders/:id', prodOrderCtrl.getOne);
router.post('/production-orders', prodOrderCtrl.create);
router.patch('/production-orders/:id/advance', prodOrderCtrl.advanceStage);
router.delete('/production-orders/:id', prodOrderCtrl.remove);

// Quality Checks
router.get('/quality-checks', qcCtrl.getAll);
router.get('/quality-checks/stats', qcCtrl.getStats);
router.post('/quality-checks', qcCtrl.create);

// Shipments
router.get('/shipments', shipCtrl.getAll);
router.get('/shipments/:id', shipCtrl.getOne);
router.post('/shipments', shipCtrl.create);
router.patch('/shipments/:id/status', shipCtrl.updateStatus);

module.exports = router;

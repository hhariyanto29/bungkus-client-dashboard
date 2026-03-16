const express = require('express');
const router = express.Router();

// Mock data for development
const mockOrders = [
  {
    order_id: '123e4567-e89b-12d3-a456-426614174000',
    order_number: 'BKS-2023-001',
    customer_name: 'PT. Contoh Packaging',
    status: 'lunas',
    total_amount: 2500000,
    created_at: '2023-10-15T08:30:00Z',
    items: [
      { name: 'Custom Box Premium', quantity: 100, price: 15000 },
      { name: 'Sticker Logo', quantity: 200, price: 5000 }
    ]
  },
  {
    order_id: '123e4567-e89b-12d3-a456-426614174001',
    order_number: 'BKS-2023-002',
    customer_name: 'CV. Sumber Makmur',
    status: 'dp',
    total_amount: 1800000,
    created_at: '2023-10-16T10:15:00Z',
    items: [
      { name: 'Paper Bag Custom', quantity: 500, price: 3000 },
      { name: 'Ribbon Premium', quantity: 100, price: 8000 }
    ]
  }
];

// Get all orders (admin only)
router.get('/', (req, res) => {
  res.json({
    success: true,
    count: mockOrders.length,
    data: mockOrders
  });
});

// Get single order by ID
router.get('/:orderId', (req, res) => {
  const orderId = req.params.orderId;
  const order = mockOrders.find(o => o.order_id === orderId);
  
  if (!order) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }
  
  res.json({
    success: true,
    data: order
  });
});

// Create new order
router.post('/', (req, res) => {
  const newOrder = {
    order_id: '123e4567-e89b-12d3-a456-42661417400' + (mockOrders.length + 1),
    order_number: `BKS-2023-00${mockOrders.length + 1}`,
    ...req.body,
    created_at: new Date().toISOString(),
    status: 'deal'
  };
  
  mockOrders.push(newOrder);
  
  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: newOrder
  });
});

// Update order status
router.patch('/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status, notes } = req.body;
  
  const orderIndex = mockOrders.findIndex(o => o.order_id === orderId);
  
  if (orderIndex === -1) {
    return res.status(404).json({
      success: false,
      error: 'Order not found'
    });
  }
  
  const validStatuses = ['deal', 'unpaid', 'dp', 'lunas', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid status. Must be one of: deal, unpaid, dp, lunas, completed'
    });
  }
  
  mockOrders[orderIndex].status = status;
  if (notes) {
    mockOrders[orderIndex].notes = notes;
  }
  mockOrders[orderIndex].updated_at = new Date().toISOString();
  
  res.json({
    success: true,
    message: `Order status updated to ${status}`,
    data: mockOrders[orderIndex]
  });
});

// Get order status history
router.get('/:orderId/status-history', (req, res) => {
  const orderId = req.params.orderId;
  
  // Mock status history
  const statusHistory = [
    {
      status: 'deal',
      timestamp: '2023-10-15T08:30:00Z',
      changed_by: 'Admin',
      notes: 'Order received'
    },
    {
      status: 'unpaid',
      timestamp: '2023-10-15T09:00:00Z',
      changed_by: 'System',
      notes: 'Invoice generated'
    },
    {
      status: 'dp',
      timestamp: '2023-10-16T14:30:00Z',
      changed_by: 'Customer',
      notes: '50% down payment received'
    },
    {
      status: 'lunas',
      timestamp: '2023-10-20T11:15:00Z',
      changed_by: 'Customer',
      notes: 'Full payment received'
    }
  ];
  
  res.json({
    success: true,
    data: statusHistory
  });
});

module.exports = router;
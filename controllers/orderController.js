import Order from "../models/order.js";
import Product from "../models/product.js";

export async function createOrder(req, res) {
  //get User information
  // add current users name if not provided
  //orderld generate
  //create order object

  if (req.user == null) {
    res.status(403).json({ error: "Please login and try again" });
    return;
  }

  const orderInfo = req.body;
  if (orderInfo.name == null) {
    orderInfo.name = req.user.firstName + " " + req.user.lastName;
  }

  let orderId = "CBC00001";
  const lastOrder = await Order.find().sort({ date: -1 }).limit(1);
  if (lastOrder.length > 0) {
    const lastOrderId = lastOrder[0].orderId;
    const lastOrderIdNumberString = lastOrderId.replace("CBC", "");
    const lastOrderIdNumber = parseInt(lastOrderIdNumberString);
    const newOrderIdNumber = lastOrderIdNumber + 1;
    orderId = "CBC" + newOrderIdNumber.toString().padStart(5, "0");
  }

  try {
    let total = 0;
    let labeledTotal = 0;
    const products = [];

    for (let i = 0; i < orderInfo.products.length; i++) {
      const item = await Product.findOne({
        productId: orderInfo.products[i].productId,
      });
      if (item == null) {
        res.status(404).json({
          message:
            "Product with id " + orderInfo.products[i].productId + " not found",
        });
        return;
      }

      if (item.isAvailable == false) {
        res.status(404).json({
          message:
            "Product with id " +
            orderInfo.products[i].productId +
            " is not available right now",
        });
        return;
      }
      products[i] = {
        productInfo: {
          productId: item.productId,
          name: item.name,
          altNames: item.altNames,
          description: item.description,
          images: item.images,
          labeledPrice: item.labeledPrice,
          price: item.price,
        },
        quantity: orderInfo.products[i].quantity,
      };

      total += orderInfo.products[i].quantity * item.price;
      labeledTotal += orderInfo.products[i].quantity * item.labeledPrice;
      // const shipping = orderInfo.shipping || 0;
      // const tax = orderInfo.tax || 0;
      // const grandTotal = total + shipping + tax;
      // total = grandTotal;
    }

    const order = new Order({
      orderId: orderId,
      email: req.user.email,
      name: orderInfo.name,
      phone: orderInfo.phone,
      address: orderInfo.address,
      city: orderInfo.city,
      state: orderInfo.state,
      zip: orderInfo.zip,
      products: products,
      labeledTotal: labeledTotal,
      total: parseFloat(total.toFixed(2)), // Ensure total is a float with 2 decimal places
      shipping: orderInfo.shipping || 0,
      tax: orderInfo.tax || 0,
      grandTotal: parseFloat(
        total + (orderInfo.shipping || 0) + (orderInfo.tax || 0)
      ).toFixed(2),
    });
    const createdOrder = await order.save();
    res.json({ message: "Order created successfully", order: createdOrder });
  } catch (error) {
    res.status(500).json({ error: "Error creating order" });
  }
}

export async function getOrder(req, res) {
  if (req.user == null) {
    res.status(403).json({ error: "Please login and try again" });
    return;
  }
  try {
    if (req.user == "admin") {
      const orders = await Order.find({});
      return res.json(orders);
    } else {
      const orders = await Order.find({ email: req.user.email });
      return res.json(orders);
    }
  } catch (error) {
    res.status(500).json({ error: "Error fetching order" });
  }
}

export async function changeOrderStatus(req, res) {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "You are not authorized" });
    }

    const { orderId, status } = req.body;

    const updatedOrder = await Order.findOneAndUpdate({ orderId }, { status });

    if (!updatedOrder) {
      return res.status(404).json({ error: "Order not found" });
    }

    return res.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

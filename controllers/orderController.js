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
        res
          .status(404)
          .json({
            message:
              "Product with id " +
              orderInfo.products[i].productId +
              " not found",
          });
        return;
      }

      if (item.isAvailable == false) {
        res
          .status(404)
          .json({
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
    }

    const order = new Order({
      orderId: orderId,
      email: req.user.email,
      name: orderInfo.name,
      phone: orderInfo.phone,
      address: orderInfo.address,
      products: products,
      labeledTotal: labeledTotal,
      total: total,
    });
    const createdOrder = await order.save();
    res.json({ message: "Order created successfully", order: createdOrder });
  } catch (error) {
    res.status(500).json({ error: "Error creating order" });
  }
}

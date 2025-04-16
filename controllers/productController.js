import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

// export function getProducts(req, res) {
//   Product.find()
//     .then((data) => {
//       res.json(data);
//     })
//     .catch((error) => {
//       console.error("Error fetching products:", error);
//       res.status(500).json({ error: "Error fetching products" });
//     });
// }

export async function getProducts(req, res) {
  try {
    if (isAdmin(req, res)) {
      const products = await Product.find();
      res.json(products);
    } else {
      const products = await Product.find({ isAvailable: true });
      res.json(products);
    }
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Error fetching products" });
  }
}

export function saveProduct(req, res) {
  if (!isAdmin(req, res)) {
    res.status(403).json({ error: "you are not authorized to add a product" });
    return;
  }
  const product = new Product(req.body);
  product
    .save()
    .then(() => {
      console.log("Product saved successfully");
      res.json({ message: "Product saved successfully" });
    })
    .catch((error) => {
      console.error("Error saving product:", error);
      res.status(500).json({ error: "Error saving product" });
    });
}

export async function deleteProduct(req, res) {
  if (!isAdmin(req, res)) {
    res
      .status(403)
      .json({ error: "you are not authorized to delete a product" });
    return;
  }
  try {
    await Product.deleteOne({ productId: req.params.productId });
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "Error deleting product" });
  }
}

export async function updateProduct(req, res) {
  if (!isAdmin(req, res)) {
    res
      .status(403)
      .json({ error: "you are not authorized to update a product" });
    return;
  }
  const productId = req.params.productId;
  const updatingProduct = req.body;
  try {
    await Product.updateOne({ productId: productId }, updatingProduct);
    res.json({ message: "Product updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
}

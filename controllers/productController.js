import Product from "../models/product.js";
import { isAdmin } from "./userController.js";


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
  const stock = req.body.stock;
  if (stock == 0) {
    updatingProduct.isAvailable = false;
  }else {
    updatingProduct.isAvailable = true;
  }
  try {
    await Product.updateOne({ productId: productId }, updatingProduct);
    res.json({ message: "Product updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
}

export async function getProductById(req, res) {
  const productId = req.params.productId;
  try {
    const product = await Product.findOne({ productId: productId });
    if (product == null) {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    if (product.isAvailable) {
      res.json(product);
    } else {
      if (isAdmin(req, res)) {
        res.json(product);
      } else {
        res.status(404).json({ message: "Product not found" });
        return;
      }
    }
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error });
  }
}

const getFilteredProducts = async (req, res) => {
  try {
    const { categories, minPrice, maxPrice, search } = req.query;

    let filters = {};
    if (categories && categories.length > 0) {
      filters.category = { $in: categories };
    }
    if (minPrice || maxPrice) {
      filters.price = { $gte: minPrice || 0, $lte: maxPrice || 50000 };
    }
    if (search) {
      filters.name = { $regex: search, $options: "i" }; // case-insensitive search
    }

    const products = await Product.find(filters);
    res.json(products);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching products" });
  }
};

export { getFilteredProducts };

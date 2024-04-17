import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Button from 'react-bootstrap/Button';
import Stack from 'react-bootstrap/Stack';
import ToastContext from "../context/ToastContext";
import { Card, Spinner, Form } from "react-bootstrap";
import { Link } from "react-router-dom";

const CustomerProduct = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const { toast } = useContext(ToastContext);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState([]);

   
    

    useEffect(() => {
        !user && navigate("/login", { replace: true });
        setLoading(true);
        fetchProducts();
        
        // Retrieve cart from localStorage when component mounts
        const storedCart = localStorage.getItem("cart");
        if (storedCart) {
            setCart(JSON.parse(storedCart));
        }
    }, []);

    // Update localStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(cart));
    }, [cart]);

    const fetchProducts = async () => {
        try {
            const res = await fetch('http://localhost:4000/api/products', {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem("token")}`,
                }
            });
            const result = await res.json();
            if (!result.error) {
                setProducts(result.products);
                setLoading(false);
            } else {
                toast.error(result.error);
                setLoading(false);
            }
        } catch (err) {
            toast.error("Failed to fetch products");
            setLoading(false);
        }
    };

    const addToCart = (product, quantity) => {
        const existingItem = cart.find(item => item._id === product._id);
        if (existingItem) {
            const updatedCart = cart.map(item => {
                if (item._id === product._id) {
                    return { ...item, quantity: item.quantity + quantity };
                }
                return item;
            });
            setCart(updatedCart);
        } else {
            const updatedCart = [...cart, { ...product, quantity }];
            setCart(updatedCart);
        }
        toast.success("Added to Cart");
    };

    const updateQuantity = (productId, quantity, fromCart) => {
        if (fromCart) {
            const updatedCart = cart.map(item => {
                if (item._id === productId) {
                    return { ...item, quantity };
                }
                return item;
            });
            setCart(updatedCart);
        } else {
            const updatedProducts = products.map(product => {
                if (product._id === productId) {
                    return { ...product, quantity };
                }
                return product;
            });
            setProducts(updatedProducts);
        }
    };

 

    return (
        <div className="container">
            <h2>Welcome, {user ? user.name : null} </h2>
            <p>Here are some products for you:</p>
            {loading ? (
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            ) : (
                <div className="row">
                    {products.map((product) => (
                        <div key={product._id} className="col-md-4 mb-3">
                            <Card className="h-100">
                                <Card.Img variant="top" src={`http://localhost:4000/${product.imageUrl}`} alt={product.name} />
                                <Card.Body>
                                    <Card.Title>{product.name}</Card.Title>
                                    <Card.Text>Price: ${product.price}</Card.Text>
                                    <Form.Group controlId={`quantity-${product._id}`}>
                                        <Form.Label>Quantity</Form.Label>
                                        <Form.Control
                                            type="number"
                                            defaultValue="1"
                                            min="1"
                                            onChange={(e) => updateQuantity(product._id, parseInt(e.target.value), false)}
                                        />
                                    </Form.Group>
                                    <Button variant="primary" onClick={() => addToCart(product, parseInt(document.getElementById(`quantity-${product._id}`).value))}>Add to Cart</Button>
                                    <Link to={`/product-details/${product._id}`}>
                                        <Button variant="primary">View Details</Button>
                                    </Link>
                                </Card.Body>
                            </Card>
                        </div>
                    ))}
                </div>
            )}
           
        </div>
    );
};

export default CustomerProduct;

import React, { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext";
import AddButton from "../../assets/images/add.png";
import bin from "../../assets/images/bin.png";
import FormWishlistAdd from "../forms/FormWishlistAdd";
import { useAuthRefresh } from '../../contexts/AuthRefresh';
import "./Wishlist.css";
import { useNavigate } from "react-router-dom";


const URL = import.meta.env.VITE_API_URL;

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("") ;
  const [activeForm, setActiveForm] = useState(null);
  const navigate = useNavigate();

  const { authFetch } = useAuthRefresh();

  const openAddForm = () => setActiveForm("add");
  const closeForm = () => setActiveForm(null);

  const { user } = useUser();

  useEffect(() => {
    if (successMessage) setTimeout(() => setSuccessMessage(""), 5000);
    if (errorMessage) setTimeout(() => setErrorMessage(""), 5000);
  }, [successMessage, errorMessage]);


  const handleRemove = async (wishlistEntry) => {
    const entryId = wishlistEntry["id"];

    try {
      //const token = localStorage.getItem("access");

      const response = await authFetch(`${URL}/api/wishlist/${entryId}/delete/`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to remove item from wishlist");
      }

      setWishlist((prevWishlist) =>
        prevWishlist.filter((item) => item.id !== entryId)
      );
      setSuccessMessage("Deleted successfully!")
    } catch (error) {
      console.error("Error removing item:", error);
      setErrorMessage("Failed to remove item. Please try again.");
    }
  };

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        if(!user) {
          navigate('/');
          return;
        }
        const token = localStorage.getItem("access");

        const response = await authFetch(`${URL}/api/wishlist/`, {
          method: "GET",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch from wishlist");
        }

        const data = await response.json();
        setWishlist(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vinyls:", error);
        setErrorMessage("Failed to load vinyl records. Please try again.");
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }


  console.log(user) ;


  return (
    <div className="wishlist-container">
      <h2>My Wishlist</h2>
      {successMessage && <div className="success-message">{successMessage}</div>}
      {errorMessage && <div className="error-message">{errorMessage}</div>}
      {wishlist.length === 0 ? (
        <p>You don't have anything added to wishlist.</p>
      ) : (
        <div className="wishlist-list">
          {wishlist.map((item) => (
            <div key={item["id"]} className="wishlist-item">
              <p>{item["record_catalog_number"]}</p>
              <button
                className="wishlist-remove"
                onClick={() => handleRemove(item)}
              >
                <img src={bin} alt={bin} />
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="add-container">
        <img
          className="add-button"
          src={AddButton}
          alt="add-button"
          onClick={openAddForm}
        />
        {activeForm === "add" && (
          <div className="modal-overlay">
            <FormWishlistAdd
              onClose={closeForm}
              onAddItem={(newItem) => {
                setWishlist((prevWishlist) => [...prevWishlist, newItem]);
              }}
            />{" "}
          </div>
        )}
      </div>
    </div>
  );
}

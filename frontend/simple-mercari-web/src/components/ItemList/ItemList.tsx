import React from "react";
import { Item } from "../Item";
import { useNavigate } from "react-router-dom";

interface Item {
  id: number;
  name: string;
  price: number;
  category_name: string;
}

interface Prop {
  items: Item[];
}

export const ItemList: React.FC<Prop> = (props) => {
  const navigate = useNavigate();
  return (
    <div>
      <div className="ItemCards">
        {props.items &&
          props.items.map((item) => {
            return <Item item={item} />;
          })}
      </div>
      <div className="AddItem">
      <button  onClick={() => navigate("/sell")} id="MerButton">
        <i className="bi bi-plus-lg"></i>Add Item
      </button>
      </div>
    </div>
      
  );
};

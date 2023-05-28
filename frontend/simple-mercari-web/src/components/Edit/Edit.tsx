import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import { MerComponent } from "../MerComponent";
import { toast } from "react-toastify";
import { fetcher, fetcherBlob} from "../../helper";

interface Category {
  id: number;
  name: string;
}

type formDataType = {
  name: string;
  category_id: number;
  price: number;
  description: string;
  image: string | File;
  imagePreview?: string; 
};

interface Item {
    id: number;
    name: string;
    category_id: number;
    category_name: string;
    user_id: number;
    price: number;
    description: string;
  }
  

export const Edit: React.FC = () => {
  const initialState = {
    name: "",
    category_id: 1,
    price: 0,
    description: "",
    image: "",
    imagePreview:"",
  };

  const params = useParams();
  const [item, setItem] = useState<Item>();
  const [itemImage, setItemImage] = useState<Blob>();
  const [values, setValues] = useState<formDataType>(initialState);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cookies] = useCookies(["token", "userID"]);



  const onValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    });
  };

  const onSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    });
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValues({
      ...values,
      [event.target.name]: event.target.files![0],
      imagePreview: URL.createObjectURL(event.target.files![0]) // 画像のプレビューを作成
    });
  };

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData();
    data.append("name", values.name);
    data.append("category_id", values.category_id.toString());
    data.append("price", values.price.toString());
    data.append("description", values.description);
    data.append("image", values.image);
    
    fetcher(`/items/${params.id}`, {
        method: "PUT",
        body: data,
        headers: {
          Authorization: `Bearer ${cookies.token}`,
        },
      })
    .then((_) => {
        toast.success("Item updated successfully!");
    })
    .catch((error: Error) => {
        toast.error(error.message);
        console.error("POST error:", error);
    });  

  };

  const fetchItem = () => {
    fetcher<Item>(`/items/${params.id}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("GET success:", res);
        setItem(res);
      })
      .catch((err) => {
        console.log(`GET error:`, err);
        toast.error(err.message);
      });

    fetcherBlob(`/items/${params.id}/image`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        console.log("GET success:", res);
        setItemImage(res);
      })
      .catch((err) => {
        console.log(`GET error:`, err);
        toast.error(err.message);
      });
  };


  const fetchCategories = () => {
    fetcher<Category[]>(`/items/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    })
      .then((items) => setCategories(items))
      .catch((err) => {
        console.log(`GET error:`, err);
        toast.error(err.message);
      });
  };

  useEffect(() => {
    fetchItem();
    fetchCategories();
  }, []);

  
  useEffect(() => {
    if (item) {
      setValues({
        name: item.name,
        category_id: item.category_id,
        price: item.price,
        description: item.description,
        image:itemImage ? URL.createObjectURL(itemImage) : "",
        imagePreview:itemImage ? URL.createObjectURL(itemImage) : "",
      });
    }
  }, [item, itemImage]);

  return (
    <MerComponent>
      <div className="Listing">
      <div className="w3-card-4">
        <img src={values.imagePreview} alt="..." ></img>
        <input
              type="file"
              name="image"
              id="MerTextInput"
              onChange={onFileChange}
              required
            />
        <div className="w3-container w3-center">
          <h1>{values.name}</h1>
          <h2 id="price">{values.price}</h2>
          <h5>{values.description}</h5>
        </div>
      </div>
        <form onSubmit={onSubmit} className="ListingForm">
          <div>
            <h3>Name</h3>
            <input
              value={values.name}
              type="text"
              name="name"
              id="MerTextInput"
              placeholder="name"
              onChange={onValueChange}
              required
            />
            <h3>Category</h3>
            <select
              name="category_id"
              id="MerTextInput"
              value={values.category_id}
              onChange={onSelectChange}
            >
              {categories &&
                categories.map((category) => {
                  return <option value={category.id}>{category.name}</option>;
                })}
            </select>
            <h3>Price</h3>
            <input
              value={values.price}
              type="number"
              name="price"
              id="MerTextInput"
              placeholder="price"
              onChange={onValueChange}
              required
            />
            <h3>Description</h3>
            <input
              value={values.description}
              type="text"
              name="description"
              id="MerTextInput"
              placeholder="description"
              onChange={onValueChange}
              required
            />
            {/* <input
              type="file"
              name="image"
              id="MerTextInput"
              onChange={onFileChange}
              required
            /> */}
            <button type="submit" className="EditButton">
              Update this item
            </button>
          </div>
        </form>
      </div>
    </MerComponent>
  );
};

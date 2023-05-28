import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useParams } from "react-router-dom";
import { MerComponent } from "../MerComponent";
import { toast } from "react-toastify";
import { ItemList } from "../ItemList";
import { fetcher } from "../../helper";
import { get } from "http";

interface Item {
  id: number;
  name: string;
  price: number;
  category_name: string;
}

interface FavoriteFolder {
  UserID: number;
  FavoriteFolderID: number;
  FavoriteFolderName: string;
}


export const Favorite: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [favoriteFolders, setFavoriteFolders] = useState<FavoriteFolder[]>([]);
  const [cookies] = useCookies(["token"]);
  const params = useParams();

  const fetchItems = () => {
    fetcher<Item[]>(`/users/${params.id}/items`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${cookies.token}`,
      },
    })
      .then((items) => setItems(items))
      .catch((err) => {
        console.log(`GET error:`, err);
        toast.error(err.message);
      });
  };

  const getFavoriteFolders = ()=> {
    fetcher<FavoriteFolder[]>(`/favorite`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${cookies.token}`,
      },
    })
      .then((data) => setFavoriteFolders(data))
      .catch((err) => {
        console.log(`GET error:`, err);
        toast.error(err.message);
      });
    }
    
  useEffect(() => {
    fetchItems();
    getFavoriteFolders();
  }, []);

  
  return (
    <MerComponent>
      <div className="Favorite">
        <h1>Favorite Items</h1>
        <div className="w3-sidebar w3-bar-block" >
        <a href="/favorite" className="w3-bar-item w3-button">All</a>
          {favoriteFolders.map((folder) => (
            <a key={folder.FavoriteFolderID}
              href = "/favorite/{folder.FavoriteFolderID}"
              className="w3-bar-item w3-button"
            > 
            {folder.FavoriteFolderName}
            </a>
          ))}
        </div>
        <div className="MyItem">
            <h2>All</h2>
            {<ItemList items={items} />}
        </div>
      </div>
    </MerComponent>
  );
};

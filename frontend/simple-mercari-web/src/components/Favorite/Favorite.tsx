import { useState, useEffect } from "react";
import { useCookies } from "react-cookie";
import { useParams } from "react-router-dom";
import { MerComponent } from "../MerComponent";
import { toast } from "react-toastify";
import { ItemList } from "../ItemList";
import { fetcher } from "../../helper";

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
  const params = useParams<{ id?: string }>();
  const [selectedFolderId, setSelectedFolderId] = useState<string | undefined>(params.id);

  const fetchItems = (folderId: string | undefined) => {
    fetcher<Item[]>(`/favorite/${folderId ?? ""}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${cookies.token}`,
      },
    })
      .then((items) => {
        console.log(items)
        setItems(items)
      })
      .catch((err) => {
        console.log(`GET error:`, err);
        toast.error(err.message);
      });
  };

  const getFavoriteFolders = () => {
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
  };

  const onFolderClick = (folderId: number | null) => {
    setSelectedFolderId(folderId?.toString());
    fetchItems(folderId?.toString());
  };

  useEffect(() => {
    fetchItems(selectedFolderId);
    getFavoriteFolders();
  }, [selectedFolderId]);

  return (
    <MerComponent>
      <div className="Favorite">
        <h1>Favorite Items</h1>
        <div className="w3-sidebar w3-bar-block">
          <a href="/favorite" className="w3-bar-item w3-button">
            All
          </a>
          {favoriteFolders && favoriteFolders.map((folder) => (
            <a
                key={folder.FavoriteFolderID}
                href={`/favorite/${folder.FavoriteFolderID}`}
                className="w3-bar-item w3-button"
                onClick={(event) => {
                  event.preventDefault();
                  onFolderClick(folder.FavoriteFolderID);
                }}
              >
                {folder.FavoriteFolderName}
              </a>
          ))}
        </div>
        <div className="MyItem">
          {selectedFolderId && (
            <h2>
              {favoriteFolders.find((folder) => folder.FavoriteFolderID === Number(selectedFolderId))?.FavoriteFolderName}
            </h2>
          )}
          <ItemList items={items} />
        </div>
      </div>
    </MerComponent>
  );
};
